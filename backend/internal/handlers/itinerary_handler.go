package handlers

import (
	"net/http"
	"strconv"

	"github.com/faso-atlas/backend/internal/middleware"
	"github.com/faso-atlas/backend/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ItineraryHandler struct {
	db *gorm.DB
}

func NewItineraryHandler(db *gorm.DB) *ItineraryHandler {
	return &ItineraryHandler{db: db}
}

func (h *ItineraryHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "12"))
	offset := paginate(page, limit)

	query := h.db.Model(&models.Itinerary{}).Where("is_public = ?", true)

	if d := c.Query("difficulty"); d != "" {
		query = query.Where("difficulty = ?", d)
	}
	if dur := c.Query("duration"); dur != "" {
		query = query.Where("duration_days <= ?", dur)
	}

	var total int64
	query.Count(&total)

	var itineraries []models.Itinerary
	query.Preload("Stops").Preload("Stops.Place").
		Offset(offset).Limit(limit).
		Order("created_at DESC").
		Find(&itineraries)

	c.Header("X-Total-Count", strconv.FormatInt(total, 10))
	c.JSON(http.StatusOK, gin.H{"data": itineraries, "total": total})
}

func (h *ItineraryHandler) Get(c *gin.Context) {
	var it models.Itinerary
	if err := h.db.Preload("Stops", func(db *gorm.DB) *gorm.DB {
		return db.Order("stop_order ASC")
	}).Preload("Stops.Place").Preload("Stops.Place.Region").
		First(&it, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "itinerary not found"})
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
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
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
	h.db.Create(&it)
	c.JSON(http.StatusCreated, it)
}

func (h *ItineraryHandler) AddStop(c *gin.Context) {
	userID := c.GetUint(middleware.UserIDKey)
	var it models.Itinerary
	if err := h.db.First(&it, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "itinerary not found"})
		return
	}
	if it.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "access denied"})
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
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	itID, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	stop := models.ItineraryStop{
		ItineraryID: uint(itID),
		PlaceID:     req.PlaceID,
		Order:       req.Order,
		DayNumber:   req.DayNumber,
		Duration:    req.Duration,
		Notes:       req.Notes,
	}
	h.db.Create(&stop)
	c.JSON(http.StatusCreated, stop)
}

func (h *ItineraryHandler) DeleteStop(c *gin.Context) {
	userID := c.GetUint(middleware.UserIDKey)
	var it models.Itinerary
	if err := h.db.First(&it, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "itinerary not found"})
		return
	}
	if it.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "access denied"})
		return
	}
	h.db.Where("id = ? AND itinerary_id = ?", c.Param("stopId"), c.Param("id")).
		Delete(&models.ItineraryStop{})
	c.JSON(http.StatusOK, gin.H{"message": "stop removed"})
}
