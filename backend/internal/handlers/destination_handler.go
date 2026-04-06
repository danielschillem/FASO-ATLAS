package handlers

import (
	"net/http"
	"strconv"

	"github.com/faso-atlas/backend/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type DestinationHandler struct {
	db *gorm.DB
}

func NewDestinationHandler(db *gorm.DB) *DestinationHandler {
	return &DestinationHandler{db: db}
}

func (h *DestinationHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "12"))
	offset := paginate(page, limit)

	query := h.db.Model(&models.Place{}).
		Preload("Region").
		Preload("Images").
		Where("is_active = ?", true)

	if t := c.Query("type"); t != "" {
		query = query.Where("type = ?", t)
	}
	if rid := c.Query("region_id"); rid != "" {
		query = query.Where("region_id = ?", rid)
	}

	var total int64
	query.Count(&total)

	var places []models.Place
	if err := query.Offset(offset).Limit(limit).Order("rating DESC").Find(&places).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch destinations"})
		return
	}

	c.Header("X-Total-Count", strconv.FormatInt(total, 10))
	c.JSON(http.StatusOK, gin.H{
		"data":  places,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

func (h *DestinationHandler) Get(c *gin.Context) {
	var place models.Place
	if err := h.db.Preload("Region").Preload("Images").
		Where("slug = ? AND is_active = ?", c.Param("slug"), true).
		First(&place).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "destination not found"})
		return
	}
	c.JSON(http.StatusOK, place)
}
