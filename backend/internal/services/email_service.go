package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
)

// EmailService handles transactional email delivery via SendGrid.
type EmailService struct {
	apiKey  string
	fromEmail string
	fromName  string
	webURL    string
	logger  *slog.Logger
	enabled bool
}

func NewEmailService(apiKey, webURL string, logger *slog.Logger) *EmailService {
	return &EmailService{
		apiKey:    apiKey,
		fromEmail: "noreply@fasotrip.bf",
		fromName:  "Faso Trip",
		webURL:    webURL,
		logger:    logger,
		enabled:   apiKey != "",
	}
}

type sendGridPayload struct {
	Personalizations []map[string]interface{} `json:"personalizations"`
	From             map[string]string        `json:"from"`
	Subject          string                   `json:"subject"`
	Content          []map[string]string      `json:"content"`
}

func (s *EmailService) send(ctx context.Context, to, subject, htmlBody string) error {
	if !s.enabled {
		s.logger.WarnContext(ctx, "email sending disabled (no SENDGRID_API_KEY)", "to", to, "subject", subject)
		return nil
	}

	payload := sendGridPayload{
		Personalizations: []map[string]interface{}{
			{"to": []map[string]string{{"email": to}}},
		},
		From:    map[string]string{"email": s.fromEmail, "name": s.fromName},
		Subject: subject,
		Content: []map[string]string{{"type": "text/html", "value": htmlBody}},
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("marshal email payload: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://api.sendgrid.com/v3/mail/send", bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("create email request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+s.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("send email: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("sendgrid returned status %d", resp.StatusCode)
	}

	s.logger.InfoContext(ctx, "email sent", "to", to, "subject", subject)
	return nil
}

// SendVerificationEmail sends an email verification link.
func (s *EmailService) SendVerificationEmail(ctx context.Context, to, firstName, token string) error {
	link := fmt.Sprintf("%s/verify-email?token=%s", s.webURL, token)
	html := fmt.Sprintf(`
		<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px">
			<h1 style="color:#160A00;font-size:24px;margin-bottom:8px">Bienvenue sur Faso Trip</h1>
			<p style="color:#717171;font-size:15px;line-height:1.6">
				Bonjour %s,<br><br>
				Merci de vous être inscrit. Veuillez confirmer votre adresse email en cliquant sur le lien ci-dessous :
			</p>
			<a href="%s" style="display:inline-block;padding:14px 28px;background:#C1272D;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;margin:20px 0">
				Vérifier mon email
			</a>
			<p style="color:#B0B0B0;font-size:12px;margin-top:24px">
				Ce lien expire dans 24 heures. Si vous n'avez pas créé de compte, ignorez cet email.
			</p>
			<hr style="border:none;border-top:1px solid #EDE8E0;margin:24px 0">
			<p style="color:#B0B0B0;font-size:11px">Faso Trip — Tourisme & Patrimoine du Burkina Faso</p>
		</div>
	`, firstName, link)

	return s.send(ctx, to, "Vérifiez votre email — Faso Trip", html)
}

// SendPasswordResetEmail sends a password reset link.
func (s *EmailService) SendPasswordResetEmail(ctx context.Context, to, firstName, token string) error {
	link := fmt.Sprintf("%s/reset-password?token=%s", s.webURL, token)
	html := fmt.Sprintf(`
		<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px">
			<h1 style="color:#160A00;font-size:24px;margin-bottom:8px">Réinitialisation du mot de passe</h1>
			<p style="color:#717171;font-size:15px;line-height:1.6">
				Bonjour %s,<br><br>
				Vous avez demandé une réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous pour en choisir un nouveau :
			</p>
			<a href="%s" style="display:inline-block;padding:14px 28px;background:#160A00;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;margin:20px 0">
				Réinitialiser mon mot de passe
			</a>
			<p style="color:#B0B0B0;font-size:12px;margin-top:24px">
				Ce lien expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez cet email.
			</p>
			<hr style="border:none;border-top:1px solid #EDE8E0;margin:24px 0">
			<p style="color:#B0B0B0;font-size:11px">Faso Trip — Tourisme & Patrimoine du Burkina Faso</p>
		</div>
	`, firstName, link)

	return s.send(ctx, to, "Réinitialisation du mot de passe — Faso Trip", html)
}

// SendReservationConfirmation sends a reservation confirmation email.
func (s *EmailService) SendReservationConfirmation(ctx context.Context, to, firstName, placeName, checkIn, checkOut string, totalFCFA int64) error {
	html := fmt.Sprintf(`
		<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px">
			<h1 style="color:#160A00;font-size:24px;margin-bottom:8px">Réservation confirmée</h1>
			<p style="color:#717171;font-size:15px;line-height:1.6">
				Bonjour %s,<br><br>
				Votre réservation à <strong>%s</strong> a bien été enregistrée.
			</p>
			<div style="background:#FAF7F2;padding:16px;border-radius:8px;margin:16px 0">
				<p style="margin:4px 0;font-size:14px"><strong>Arrivée :</strong> %s</p>
				<p style="margin:4px 0;font-size:14px"><strong>Départ :</strong> %s</p>
				<p style="margin:4px 0;font-size:14px"><strong>Total :</strong> %d FCFA</p>
			</div>
			<p style="color:#B0B0B0;font-size:12px;margin-top:24px">
				Vous pouvez gérer vos réservations dans votre espace personnel sur Faso Trip.
			</p>
			<hr style="border:none;border-top:1px solid #EDE8E0;margin:24px 0">
			<p style="color:#B0B0B0;font-size:11px">Faso Trip — Tourisme & Patrimoine du Burkina Faso</p>
		</div>
	`, firstName, placeName, checkIn, checkOut, totalFCFA)

	return s.send(ctx, to, "Réservation confirmée — "+placeName, html)
}
