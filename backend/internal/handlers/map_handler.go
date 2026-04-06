package handlers

import (
	"net/http"
	"strconv"

	"github.com/faso-atlas/backend/internal/services"
	"github.com/faso-atlas/backend/pkg/apperror"
	"github.com/gin-gonic/gin"
)

type MapHandler struct {
	mapSvc *services.MapService
}

func NewMapHandler(mapSvc *services.MapService) *MapHandler {
	return &MapHandler{mapSvc: mapSvc}
}

func (h *MapHandler) GetPlaces(c *gin.Context) {
	resp, appErr := h.mapSvc.GetPlaces(c.Request.Context(), c.Query("type"), c.Query("region_id"))
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, resp)
}

func (h *MapHandler) GetPlace(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	place, appErr := h.mapSvc.GetPlace(c.Request.Context(), uint(id))
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, place)
}

func (h *MapHandler) GetRegions(c *gin.Context) {
	regions, appErr := h.mapSvc.GetRegions(c.Request.Context())
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, regions)
}
