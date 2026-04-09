package handlers

import (
	"io"
	"net/http"
	"strconv"

	"github.com/faso-atlas/backend/internal/middleware"
	"github.com/faso-atlas/backend/internal/services"
	"github.com/faso-atlas/backend/pkg/apperror"
	"github.com/gin-gonic/gin"
)

type PaymentHandler struct {
	svc *services.PaymentService
}

func NewPaymentHandler(svc *services.PaymentService) *PaymentHandler {
	return &PaymentHandler{svc: svc}
}

// CreateCheckout creates a Stripe Checkout session for a reservation.
func (h *PaymentHandler) CreateCheckout(c *gin.Context) {
	userID := c.GetUint(middleware.UserIDKey)
	var req struct {
		ReservationID uint `json:"reservationId" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}

	result, err := h.svc.CreateCheckoutSession(c.Request.Context(), req.ReservationID, userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}
	c.JSON(http.StatusOK, result)
}

// Webhook handles Stripe webhook events.
func (h *PaymentHandler) Webhook(c *gin.Context) {
	const maxBodyBytes = 65536
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxBodyBytes)

	payload, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("unable to read body"))
		return
	}

	sig := c.GetHeader("Stripe-Signature")
	if err := h.svc.HandleWebhook(c.Request.Context(), payload, sig); err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}

	c.JSON(http.StatusOK, gin.H{"received": true})
}

// GetPaymentStatus returns the payment status of a reservation.
func (h *PaymentHandler) GetPaymentStatus(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("reservationId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid reservation ID"))
		return
	}
	_ = uint(id)
	// The reservation already contains payment status - client fetches via /reservations/:id
	c.JSON(http.StatusOK, gin.H{"reservationId": id, "message": "use GET /reservations/:id for payment status"})
}
