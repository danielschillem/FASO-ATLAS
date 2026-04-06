package handlers

import (
	"net/http"
	"time"

	"github.com/faso-atlas/backend/internal/middleware"
	"github.com/faso-atlas/backend/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ReservationHandler struct {
	db *gorm.DB
}

func NewReservationHandler(db *gorm.DB) *ReservationHandler {
	return &ReservationHandler{db: db}
}

type createReservationRequest struct {
	EstablishmentID uint   `json:"establishmentId" binding:"required"`
	CheckInDate     string `json:"checkInDate" binding:"required"`
	CheckOutDate    string `json:"checkOutDate"`
	GuestsCount     int    `json:"guestsCount"`
	SpecialRequests string `json:"specialRequests"`
}

func (h *ReservationHandler) Create(c *gin.Context) {
	userID := c.GetUint(middleware.UserIDKey)
	var req createReservationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	checkIn, err := time.Parse("2006-01-02", req.CheckInDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid checkInDate format (YYYY-MM-DD)"})
		return
	}

	var establishment models.Establishment
	if err := h.db.First(&establishment, req.EstablishmentID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "establishment not found"})
		return
	}

	reservation := models.Reservation{
		UserID:          userID,
		EstablishmentID: req.EstablishmentID,
		CheckInDate:     checkIn,
		GuestsCount:     req.GuestsCount,
		SpecialRequests: req.SpecialRequests,
		Status:          models.StatusPending,
	}

	if req.CheckOutDate != "" {
		if checkOut, err := time.Parse("2006-01-02", req.CheckOutDate); err == nil {
			reservation.CheckOutDate = &checkOut
			nights := checkOut.Sub(checkIn).Hours() / 24
			reservation.TotalPriceFCFA = int64(nights) * establishment.PriceMinFCFA
		}
	}

	if req.GuestsCount == 0 {
		reservation.GuestsCount = 1
	}

	if err := h.db.Create(&reservation).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create reservation"})
		return
	}

	c.JSON(http.StatusCreated, reservation)
}

func (h *ReservationHandler) MyReservations(c *gin.Context) {
	userID := c.GetUint(middleware.UserIDKey)
	var reservations []models.Reservation
	h.db.Preload("Establishment").Preload("Establishment.Place").
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&reservations)
	c.JSON(http.StatusOK, reservations)
}

func (h *ReservationHandler) Get(c *gin.Context) {
	userID := c.GetUint(middleware.UserIDKey)
	var r models.Reservation
	if err := h.db.Preload("Establishment").Preload("Establishment.Place").
		First(&r, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "reservation not found"})
		return
	}
	if r.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "access denied"})
		return
	}
	c.JSON(http.StatusOK, r)
}

func (h *ReservationHandler) Cancel(c *gin.Context) {
	userID := c.GetUint(middleware.UserIDKey)
	var r models.Reservation
	if err := h.db.First(&r, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "reservation not found"})
		return
	}
	if r.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "access denied"})
		return
	}
	h.db.Model(&r).Update("status", models.StatusCancelled)
	c.JSON(http.StatusOK, r)
}

func (h *ReservationHandler) UpdateStatus(c *gin.Context) {
	var req struct {
		Status models.ReservationStatus `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	var r models.Reservation
	if err := h.db.First(&r, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "reservation not found"})
		return
	}
	h.db.Model(&r).Update("status", req.Status)
	c.JSON(http.StatusOK, r)
}
