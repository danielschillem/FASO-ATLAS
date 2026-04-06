package handlers

import (
	"net/http"

	"github.com/faso-atlas/backend/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type SymbolHandler struct {
	db *gorm.DB
}

func NewSymbolHandler(db *gorm.DB) *SymbolHandler {
	return &SymbolHandler{db: db}
}

func (h *SymbolHandler) List(c *gin.Context) {
	var symbols []models.Symbol
	if err := h.db.Order("sort_order ASC").Find(&symbols).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch symbols"})
		return
	}
	c.JSON(http.StatusOK, symbols)
}
