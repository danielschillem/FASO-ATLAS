package handlers

import (
	"net/http"

	"github.com/faso-atlas/backend/internal/repository"
	"github.com/faso-atlas/backend/pkg/apperror"
	"github.com/gin-gonic/gin"
)

type AtlasHandler struct {
	atlas repository.AtlasRepository
}

func NewAtlasHandler(atlas repository.AtlasRepository) *AtlasHandler {
	return &AtlasHandler{atlas: atlas}
}

func (h *AtlasHandler) GetEvents(c *gin.Context) {
	events, err := h.atlas.ListEvents(c.Request.Context(), c.Query("era"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to fetch atlas events"))
		return
	}
	c.JSON(http.StatusOK, events)
}
