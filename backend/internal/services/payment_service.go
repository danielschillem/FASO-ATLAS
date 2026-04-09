package services

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"github.com/faso-atlas/backend/internal/models"
	"github.com/faso-atlas/backend/internal/repository"
)

// PaymentService handles Stripe payment integration via REST API.
type PaymentService struct {
	secretKey    string
	webhookSecret string
	webURL       string
	reservations repository.ReservationRepository
	logger       *slog.Logger
	enabled      bool
}

func NewPaymentService(secretKey, webhookSecret, webURL string, reservations repository.ReservationRepository, logger *slog.Logger) *PaymentService {
	return &PaymentService{
		secretKey:    secretKey,
		webhookSecret: webhookSecret,
		webURL:       webURL,
		reservations: reservations,
		logger:       logger,
		enabled:      secretKey != "",
	}
}

type CheckoutResult struct {
	SessionID  string `json:"sessionId"`
	CheckoutURL string `json:"checkoutUrl"`
}

// CreateCheckoutSession creates a Stripe Checkout session for a reservation.
func (s *PaymentService) CreateCheckoutSession(ctx context.Context, reservationID, userID uint) (*CheckoutResult, error) {
	if !s.enabled {
		return nil, errors.New("payments are not configured")
	}

	resa, err := s.reservations.GetByID(ctx, reservationID)
	if err != nil {
		return nil, fmt.Errorf("reservation not found: %w", err)
	}
	if resa.UserID != userID {
		return nil, errors.New("access denied")
	}
	if resa.PaymentStatus == models.PaymentSucceeded {
		return nil, errors.New("reservation already paid")
	}
	if resa.TotalPriceFCFA <= 0 {
		return nil, errors.New("reservation has no price")
	}

	// Stripe expects amounts in the smallest currency unit (centimes for XOF = FCFA)
	// XOF is a zero-decimal currency, so amount = price in FCFA
	amount := resa.TotalPriceFCFA

	estabName := "Réservation"
	if resa.Establishment.Place.Name != "" {
		estabName = resa.Establishment.Place.Name
	}

	form := url.Values{}
	form.Set("mode", "payment")
	form.Set("currency", "xof")
	form.Set("line_items[0][price_data][currency]", "xof")
	form.Set("line_items[0][price_data][product_data][name]", fmt.Sprintf("Réservation — %s", estabName))
	form.Set("line_items[0][price_data][unit_amount]", strconv.FormatInt(amount, 10))
	form.Set("line_items[0][quantity]", "1")
	form.Set("metadata[reservation_id]", strconv.FormatUint(uint64(reservationID), 10))
	form.Set("success_url", fmt.Sprintf("%s/reservations/%d?status=success", s.webURL, reservationID))
	form.Set("cancel_url", fmt.Sprintf("%s/reservations/%d?status=cancelled", s.webURL, reservationID))

	req, err := http.NewRequestWithContext(ctx, "POST", "https://api.stripe.com/v1/checkout/sessions", strings.NewReader(form.Encode()))
	if err != nil {
		return nil, err
	}
	req.SetBasicAuth(s.secretKey, "")
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("stripe API error: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		s.logger.ErrorContext(ctx, "stripe checkout failed", "status", resp.StatusCode, "body", string(body))
		return nil, fmt.Errorf("stripe returned %d", resp.StatusCode)
	}

	var session struct {
		ID  string `json:"id"`
		URL string `json:"url"`
	}
	if err := json.Unmarshal(body, &session); err != nil {
		return nil, err
	}

	// Save payment intent on reservation
	if err := s.reservations.UpdatePayment(ctx, reservationID, session.ID, models.PaymentPending); err != nil {
		s.logger.ErrorContext(ctx, "failed to save payment intent", "error", err)
	}

	s.logger.InfoContext(ctx, "checkout session created", "reservationID", reservationID, "sessionID", session.ID)

	return &CheckoutResult{SessionID: session.ID, CheckoutURL: session.URL}, nil
}

// HandleWebhook processes Stripe webhook events.
func (s *PaymentService) HandleWebhook(ctx context.Context, payload []byte, sigHeader string) error {
	if !s.enabled {
		return errors.New("payments not configured")
	}

	if s.webhookSecret != "" {
		if err := s.verifySignature(payload, sigHeader); err != nil {
			return fmt.Errorf("invalid webhook signature: %w", err)
		}
	}

	var event struct {
		Type string          `json:"type"`
		Data json.RawMessage `json:"data"`
	}
	if err := json.Unmarshal(payload, &event); err != nil {
		return err
	}

	var object struct {
		Object struct {
			ID       string            `json:"id"`
			Metadata map[string]string `json:"metadata"`
		} `json:"object"`
	}

	switch event.Type {
	case "checkout.session.completed":
		if err := json.Unmarshal(event.Data, &object); err != nil {
			return err
		}
		resaIDStr := object.Object.Metadata["reservation_id"]
		resaID, err := strconv.ParseUint(resaIDStr, 10, 64)
		if err != nil {
			return fmt.Errorf("invalid reservation_id in metadata: %s", resaIDStr)
		}
		if err := s.reservations.UpdatePayment(ctx, uint(resaID), object.Object.ID, models.PaymentSucceeded); err != nil {
			return err
		}
		if err := s.reservations.UpdateStatus(ctx, uint(resaID), models.StatusConfirmed); err != nil {
			return err
		}
		s.logger.InfoContext(ctx, "payment succeeded", "reservationID", resaID)

	case "checkout.session.expired":
		if err := json.Unmarshal(event.Data, &object); err != nil {
			return err
		}
		resaIDStr := object.Object.Metadata["reservation_id"]
		resaID, _ := strconv.ParseUint(resaIDStr, 10, 64)
		if resaID > 0 {
			_ = s.reservations.UpdatePayment(ctx, uint(resaID), object.Object.ID, models.PaymentFailed)
			s.logger.InfoContext(ctx, "payment expired", "reservationID", resaID)
		}
	}

	return nil
}

func (s *PaymentService) verifySignature(payload []byte, sigHeader string) error {
	if s.webhookSecret == "" {
		return nil
	}

	parts := strings.Split(sigHeader, ",")
	var timestamp, signature string
	for _, p := range parts {
		kv := strings.SplitN(p, "=", 2)
		if len(kv) != 2 {
			continue
		}
		switch kv[0] {
		case "t":
			timestamp = kv[1]
		case "v1":
			signature = kv[1]
		}
	}

	if timestamp == "" || signature == "" {
		return errors.New("missing signature components")
	}

	signedPayload := fmt.Sprintf("%s.%s", timestamp, string(payload))
	mac := hmac.New(sha256.New, []byte(s.webhookSecret))
	mac.Write([]byte(signedPayload))
	expected := hex.EncodeToString(mac.Sum(nil))

	sigBytes, _ := hex.DecodeString(signature)
	expectedBytes, _ := hex.DecodeString(expected)

	if !hmac.Equal(sigBytes, expectedBytes) {
		return errors.New("signature mismatch")
	}

	return nil
}
