package handlers

import (
	"net/http"
	"strconv"

	"github.com/faso-atlas/backend/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type EstablishmentHandler struct {
	db *gorm.DB
}

func NewEstablishmentHandler(db *gorm.DB) *EstablishmentHandler {
	return &EstablishmentHandler{db: db}
}

func (h *EstablishmentHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "12"))
	offset := paginate(page, limit)

	query := h.db.Model(&models.Establishment{}).
		Preload("Place").
		Preload("Place.Region").
		Preload("Place.Images").
		Where("is_available = ?", true)

	if t := c.Query("type"); t != "" {
		query = query.Where("type = ?", t)
	}
	if stars := c.Query("stars"); stars != "" {
		query = query.Where("stars >= ?", stars)
	}
	if rid := c.Query("region_id"); rid != "" {
		query = query.Joins("JOIN places ON places.id = establishments.place_id").
			Where("places.region_id = ?", rid)
	}

	var total int64
	query.Count(&total)

	var establishments []models.Establishment
	if err := query.Offset(offset).Limit(limit).Find(&establishments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch establishments"})
		return
	}

	c.Header("X-Total-Count", strconv.FormatInt(total, 10))
	c.JSON(http.StatusOK, gin.H{
		"data":  establishments,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

func (h *EstablishmentHandler) Get(c *gin.Context) {
	var e models.Establishment
	if err := h.db.Preload("Place").Preload("Place.Region").Preload("Place.Images").
		First(&e, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "establishment not found"})
		return
	}
	c.JSON(http.StatusOK, e)
}
