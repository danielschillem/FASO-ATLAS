package handlers

import (
	"net/http"

	"github.com/faso-atlas/backend/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AtlasHandler struct {
	db *gorm.DB
}

func NewAtlasHandler(db *gorm.DB) *AtlasHandler {
	return &AtlasHandler{db: db}
}

func (h *AtlasHandler) GetEvents(c *gin.Context) {
	query := h.db.Model(&models.AtlasEvent{}).Order("sort_order ASC, year ASC")

	if era := c.Query("era"); era != "" {
		query = query.Where("era = ?", era)
	}

	var events []models.AtlasEvent
	if err := query.Find(&events).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch atlas events"})
		return
	}
	c.JSON(http.StatusOK, events)
}
