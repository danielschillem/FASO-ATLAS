package handlers

import (
	"net/http"
	"strconv"

	"github.com/faso-atlas/backend/internal/middleware"
	"github.com/faso-atlas/backend/internal/models"
	"github.com/faso-atlas/backend/internal/repository"
	"github.com/faso-atlas/backend/pkg/apperror"
	"github.com/faso-atlas/backend/pkg/pagination"
	"github.com/gin-gonic/gin"
	"github.com/lib/pq"
)

type OwnerHandler struct {
	estabs repository.EstablishmentRepository
	places repository.PlaceRepository
	resas  repository.ReservationRepository
}

func NewOwnerHandler(
	estabs repository.EstablishmentRepository,
	places repository.PlaceRepository,
	resas repository.ReservationRepository,
) *OwnerHandler {
	return &OwnerHandler{estabs: estabs, places: places, resas: resas}
}

func (h *OwnerHandler) ownerID(c *gin.Context) uint {
	id, _ := c.Get(middleware.UserIDKey)
	return id.(uint)
}

// ─── Dashboard Stats ───

func (h *OwnerHandler) GetStats(c *gin.Context) {
	ownerID := h.ownerID(c)

	estabs, totalEstabs, _ := h.estabs.ListByOwner(c.Request.Context(), ownerID, 0, 1)
	_ = estabs

	resas, err := h.resas.ListByOwner(c.Request.Context(), ownerID)
	if err != nil {
		resas = nil
	}

	var pendingResas, confirmedResas int
	var revenue int64
	for _, r := range resas {
		switch r.Status {
		case models.StatusPending:
			pendingResas++
		case models.StatusConfirmed:
			confirmedResas++
		}
		if r.Status != models.StatusCancelled {
			revenue += r.TotalPriceFCFA
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"totalEstablishments": totalEstabs,
		"totalReservations":   len(resas),
		"pendingReservations": pendingResas,
		"confirmedReservations": confirmedResas,
		"revenue":             revenue,
	})
}

// ─── Owner Establishments ───

func (h *OwnerHandler) ListEstablishments(c *gin.Context) {
	ownerID := h.ownerID(c)
	p := pagination.Parse(c, 20)
	list, total, err := h.estabs.ListByOwner(c.Request.Context(), ownerID, p.Offset, p.Limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to fetch establishments"))
		return
	}
	c.JSON(http.StatusOK, pagination.NewResponse(c, list, total, p))
}

func (h *OwnerHandler) GetEstablishment(c *gin.Context) {
	ownerID := h.ownerID(c)
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	estab, err := h.estabs.GetByID(c.Request.Context(), uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, apperror.NotFound("establishment"))
		return
	}
	if estab.OwnerID == nil || *estab.OwnerID != ownerID {
		c.JSON(http.StatusForbidden, apperror.Forbidden("not your establishment"))
		return
	}
	c.JSON(http.StatusOK, estab)
}

func (h *OwnerHandler) CreateEstablishment(c *gin.Context) {
	ownerID := h.ownerID(c)
	var req struct {
		PlaceID      uint     `json:"placeId" binding:"required"`
		Type         string   `json:"type" binding:"required"`
		PriceMinFCFA int64    `json:"priceMinFcfa"`
		PriceMaxFCFA int64    `json:"priceMaxFcfa"`
		Stars        int      `json:"stars"`
		Amenities    []string `json:"amenities"`
		Phone        string   `json:"phone"`
		Email        string   `json:"email"`
		Website      string   `json:"website"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}
	estab := &models.Establishment{
		PlaceID:      req.PlaceID,
		OwnerID:      &ownerID,
		Type:         models.EstablishmentType(req.Type),
		PriceMinFCFA: req.PriceMinFCFA,
		PriceMaxFCFA: req.PriceMaxFCFA,
		Stars:        req.Stars,
		Amenities:    pq.StringArray(req.Amenities),
		PhoneNumber:  req.Phone,
		Email:        req.Email,
		Website:      req.Website,
		IsAvailable:  true,
	}
	if err := h.estabs.Create(c.Request.Context(), estab); err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to create establishment"))
		return
	}
	c.JSON(http.StatusCreated, estab)
}

func (h *OwnerHandler) UpdateEstablishment(c *gin.Context) {
	ownerID := h.ownerID(c)
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	existing, err := h.estabs.GetByID(c.Request.Context(), uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, apperror.NotFound("establishment"))
		return
	}
	if existing.OwnerID == nil || *existing.OwnerID != ownerID {
		c.JSON(http.StatusForbidden, apperror.Forbidden("not your establishment"))
		return
	}
	var req struct {
		Type         string   `json:"type"`
		PriceMinFCFA int64    `json:"priceMinFcfa"`
		PriceMaxFCFA int64    `json:"priceMaxFcfa"`
		Stars        int      `json:"stars"`
		Amenities    []string `json:"amenities"`
		Phone        string   `json:"phone"`
		Email        string   `json:"email"`
		Website      string   `json:"website"`
		IsAvailable  *bool    `json:"isAvailable"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}
	if req.Type != "" {
		existing.Type = models.EstablishmentType(req.Type)
	}
	if req.PriceMinFCFA > 0 {
		existing.PriceMinFCFA = req.PriceMinFCFA
	}
	if req.PriceMaxFCFA > 0 {
		existing.PriceMaxFCFA = req.PriceMaxFCFA
	}
	if req.Stars >= 1 && req.Stars <= 5 {
		existing.Stars = req.Stars
	}
	if req.Amenities != nil {
		existing.Amenities = pq.StringArray(req.Amenities)
	}
	if req.Phone != "" {
		existing.PhoneNumber = req.Phone
	}
	if req.Email != "" {
		existing.Email = req.Email
	}
	if req.Website != "" {
		existing.Website = req.Website
	}
	if req.IsAvailable != nil {
		existing.IsAvailable = *req.IsAvailable
	}
	if err := h.estabs.Update(c.Request.Context(), existing); err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to update establishment"))
		return
	}
	c.JSON(http.StatusOK, existing)
}

func (h *OwnerHandler) DeleteEstablishment(c *gin.Context) {
	ownerID := h.ownerID(c)
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	existing, err := h.estabs.GetByID(c.Request.Context(), uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, apperror.NotFound("establishment"))
		return
	}
	if existing.OwnerID == nil || *existing.OwnerID != ownerID {
		c.JSON(http.StatusForbidden, apperror.Forbidden("not your establishment"))
		return
	}
	if err := h.estabs.Delete(c.Request.Context(), uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to delete establishment"))
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "establishment deleted"})
}

// ─── Owner Reservations ───

func (h *OwnerHandler) ListReservations(c *gin.Context) {
	ownerID := h.ownerID(c)
	resas, err := h.resas.ListByOwner(c.Request.Context(), ownerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to fetch reservations"))
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": resas, "total": len(resas)})
}

func (h *OwnerHandler) UpdateReservationStatus(c *gin.Context) {
	ownerID := h.ownerID(c)
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	// Verify this reservation belongs to an establishment owned by this user
	resa, err := h.resas.GetByID(c.Request.Context(), uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, apperror.NotFound("reservation"))
		return
	}
	estab, err := h.estabs.GetByID(c.Request.Context(), resa.EstablishmentID)
	if err != nil || estab.OwnerID == nil || *estab.OwnerID != ownerID {
		c.JSON(http.StatusForbidden, apperror.Forbidden("not your reservation"))
		return
	}
	var req struct {
		Status models.ReservationStatus `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}
	if err := h.resas.UpdateStatus(c.Request.Context(), uint(id), req.Status); err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to update reservation"))
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "reservation updated"})
}
