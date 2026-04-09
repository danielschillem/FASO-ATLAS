package handlers

import (
	"net/http"
	"strconv"

	"github.com/faso-atlas/backend/internal/repository"
	"github.com/faso-atlas/backend/pkg/apperror"
	"github.com/gin-gonic/gin"
)

type NearbyHandler struct {
	places         repository.PlaceRepository
	establishments repository.EstablishmentRepository
}

func NewNearbyHandler(places repository.PlaceRepository, estab repository.EstablishmentRepository) *NearbyHandler {
	return &NearbyHandler{places: places, establishments: estab}
}

func (h *NearbyHandler) NearbyPlaces(c *gin.Context) {
	lat, lng, radius, limit, err := parseNearbyParams(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}

	places, dbErr := h.places.NearBy(c.Request.Context(), lat, lng, radius, limit)
	if dbErr != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to fetch nearby places"))
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": places, "total": len(places)})
}

func (h *NearbyHandler) NearbyEstablishments(c *gin.Context) {
	lat, lng, radius, limit, err := parseNearbyParams(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}

	estabs, dbErr := h.establishments.NearBy(c.Request.Context(), lat, lng, radius, limit)
	if dbErr != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to fetch nearby establishments"))
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": estabs, "total": len(estabs)})
}

func parseNearbyParams(c *gin.Context) (lat, lng, radius float64, limit int, err error) {
	lat, err = strconv.ParseFloat(c.Query("lat"), 64)
	if err != nil {
		return 0, 0, 0, 0, err
	}
	lng, err = strconv.ParseFloat(c.Query("lng"), 64)
	if err != nil {
		return 0, 0, 0, 0, err
	}
	radius = 50 // default 50km
	if r := c.Query("radius"); r != "" {
		if v, e := strconv.ParseFloat(r, 64); e == nil && v > 0 && v <= 500 {
			radius = v
		}
	}
	limit = 20
	if l := c.Query("limit"); l != "" {
		if v, e := strconv.Atoi(l); e == nil && v > 0 && v <= 100 {
			limit = v
		}
	}
	return lat, lng, radius, limit, nil
}
