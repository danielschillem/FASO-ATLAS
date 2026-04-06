package handlers

import (
	"net/http"
	"strconv"

	"github.com/faso-atlas/backend/internal/repository"
	"github.com/faso-atlas/backend/pkg/apperror"
	"github.com/faso-atlas/backend/pkg/pagination"
	"github.com/gin-gonic/gin"
)

type EstablishmentHandler struct {
	establishments repository.EstablishmentRepository
}

func NewEstablishmentHandler(estab repository.EstablishmentRepository) *EstablishmentHandler {
	return &EstablishmentHandler{establishments: estab}
}

func (h *EstablishmentHandler) List(c *gin.Context) {
	p := pagination.Parse(c, 12)

	var minStars int
	if s := c.Query("stars"); s != "" {
		if v, err := strconv.Atoi(s); err == nil {
			minStars = v
		}
	}

	list, total, err := h.establishments.List(c.Request.Context(), p.Offset, p.Limit, repository.EstablishmentFilters{
		Type:     c.Query("type"),
		MinStars: minStars,
		RegionID: c.Query("region_id"),
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to fetch establishments"))
		return
	}

	c.JSON(http.StatusOK, pagination.NewResponse(c, list, total, p))
}

func (h *EstablishmentHandler) Get(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	e, err := h.establishments.GetByID(c.Request.Context(), uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, apperror.NotFound("establishment"))
		return
	}
	c.JSON(http.StatusOK, e)
}
