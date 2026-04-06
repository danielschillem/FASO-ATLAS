package handlers

import (
	"net/http"

	"github.com/faso-atlas/backend/internal/repository"
	"github.com/faso-atlas/backend/pkg/apperror"
	"github.com/faso-atlas/backend/pkg/pagination"
	"github.com/gin-gonic/gin"
)

type DestinationHandler struct {
	places repository.PlaceRepository
}

func NewDestinationHandler(places repository.PlaceRepository) *DestinationHandler {
	return &DestinationHandler{places: places}
}

func (h *DestinationHandler) List(c *gin.Context) {
	p := pagination.Parse(c, 12)
	active := true
	places, total, err := h.places.List(c.Request.Context(), p.Offset, p.Limit, repository.PlaceFilters{
		Type:     c.Query("type"),
		RegionID: c.Query("region_id"),
		Active:   &active,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to fetch destinations"))
		return
	}
	c.JSON(http.StatusOK, pagination.NewResponse(c, places, total, p))
}

func (h *DestinationHandler) Get(c *gin.Context) {
	place, err := h.places.GetBySlug(c.Request.Context(), c.Param("slug"))
	if err != nil {
		c.JSON(http.StatusNotFound, apperror.NotFound("destination"))
		return
	}
	c.JSON(http.StatusOK, place)
}
