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
)

type ItineraryHandler struct {
	itineraries repository.ItineraryRepository
}

func NewItineraryHandler(itineraries repository.ItineraryRepository) *ItineraryHandler {
	return &ItineraryHandler{itineraries: itineraries}
}

func (h *ItineraryHandler) List(c *gin.Context) {
	p := pagination.Parse(c, 12)

	var maxDuration int
	if dur := c.Query("duration"); dur != "" {
		if d, err := strconv.Atoi(dur); err == nil && d > 0 {
			maxDuration = d
		}
	}

	list, total, err := h.itineraries.List(c.Request.Context(), p.Offset, p.Limit, repository.ItineraryFilters{
		Difficulty:  c.Query("difficulty"),
		MaxDuration: maxDuration,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to fetch itineraries"))
		return
	}
	c.JSON(http.StatusOK, pagination.NewResponse(c, list, total, p))
}

func (h *ItineraryHandler) Get(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	it, err := h.itineraries.GetByID(c.Request.Context(), uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, apperror.NotFound("itinerary"))
		return
	}
	c.JSON(http.StatusOK, it)
}

type createItineraryRequest struct {
	Title        string `json:"title" binding:"required"`
	Description  string `json:"description"`
	DurationDays int    `json:"durationDays"`
	Difficulty   string `json:"difficulty"`
	BudgetFCFA   int64  `json:"budgetFcfa"`
	IsPublic     bool   `json:"isPublic"`
}

func (h *ItineraryHandler) Create(c *gin.Context) {
	userID := c.GetUint(middleware.UserIDKey)
	var req createItineraryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}

	it := models.Itinerary{
		UserID:       userID,
		Title:        req.Title,
		Description:  req.Description,
		DurationDays: req.DurationDays,
		Difficulty:   req.Difficulty,
		BudgetFCFA:   req.BudgetFCFA,
		IsPublic:     req.IsPublic,
	}
	if err := h.itineraries.Create(c.Request.Context(), &it); err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to create itinerary"))
		return
	}
	c.JSON(http.StatusCreated, it)
}

func (h *ItineraryHandler) AddStop(c *gin.Context) {
	userID := c.GetUint(middleware.UserIDKey)
	itID, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	it, err := h.itineraries.GetByID(c.Request.Context(), uint(itID))
	if err != nil {
		c.JSON(http.StatusNotFound, apperror.NotFound("itinerary"))
		return
	}
	if it.UserID != userID {
		c.JSON(http.StatusForbidden, apperror.Forbidden("access denied"))
		return
	}

	var req struct {
		PlaceID   uint   `json:"placeId" binding:"required"`
		Order     int    `json:"order" binding:"required"`
		DayNumber int    `json:"dayNumber" binding:"required"`
		Duration  string `json:"duration"`
		Notes     string `json:"notes"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}

	stop := models.ItineraryStop{
		ItineraryID: uint(itID),
		PlaceID:     req.PlaceID,
		Order:       req.Order,
		DayNumber:   req.DayNumber,
		Duration:    req.Duration,
		Notes:       req.Notes,
	}
	if err := h.itineraries.CreateStop(c.Request.Context(), &stop); err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to add stop"))
		return
	}
	c.JSON(http.StatusCreated, stop)
}

func (h *ItineraryHandler) DeleteStop(c *gin.Context) {
	userID := c.GetUint(middleware.UserIDKey)
	itID, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	it, err := h.itineraries.GetByID(c.Request.Context(), uint(itID))
	if err != nil {
		c.JSON(http.StatusNotFound, apperror.NotFound("itinerary"))
		return
	}
	if it.UserID != userID {
		c.JSON(http.StatusForbidden, apperror.Forbidden("access denied"))
		return
	}

	stopID, _ := strconv.ParseUint(c.Param("stopId"), 10, 64)
	_ = h.itineraries.DeleteStop(c.Request.Context(), uint(stopID), uint(itID))
	c.JSON(http.StatusOK, gin.H{"message": "stop removed"})
}
