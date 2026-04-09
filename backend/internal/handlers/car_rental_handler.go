package handlers

import (
	"net/http"
	"strconv"

	"github.com/faso-atlas/backend/internal/repository"
	"github.com/faso-atlas/backend/pkg/apperror"
	"github.com/faso-atlas/backend/pkg/pagination"
	"github.com/gin-gonic/gin"
)

type CarRentalHandler struct {
	cars repository.CarRentalRepository
}

func NewCarRentalHandler(cars repository.CarRentalRepository) *CarRentalHandler {
	return &CarRentalHandler{cars: cars}
}

func (h *CarRentalHandler) List(c *gin.Context) {
	p := pagination.Parse(c, 12)

	var minSeats int
	if s := c.Query("seats"); s != "" {
		if v, err := strconv.Atoi(s); err == nil {
			minSeats = v
		}
	}

	list, total, err := h.cars.List(c.Request.Context(), p.Offset, p.Limit, repository.CarRentalFilters{
		Category: c.Query("category"),
		RegionID: c.Query("region_id"),
		MinSeats: minSeats,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to fetch car rentals"))
		return
	}

	c.JSON(http.StatusOK, pagination.NewResponse(c, list, total, p))
}

func (h *CarRentalHandler) Get(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	car, err := h.cars.GetByID(c.Request.Context(), uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, apperror.NotFound("car rental"))
		return
	}
	c.JSON(http.StatusOK, car)
}
