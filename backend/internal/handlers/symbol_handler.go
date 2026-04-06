package handlers

import (
	"net/http"

	"github.com/faso-atlas/backend/internal/repository"
	"github.com/faso-atlas/backend/pkg/apperror"
	"github.com/gin-gonic/gin"
)

type SymbolHandler struct {
	symbols repository.SymbolRepository
}

func NewSymbolHandler(symbols repository.SymbolRepository) *SymbolHandler {
	return &SymbolHandler{symbols: symbols}
}

func (h *SymbolHandler) List(c *gin.Context) {
	symbols, err := h.symbols.List(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to fetch symbols"))
		return
	}
	c.JSON(http.StatusOK, symbols)
}
