package handlers

import (
	"net/http"
	"strconv"

	"github.com/faso-atlas/backend/internal/middleware"
	"github.com/faso-atlas/backend/internal/models"
	"github.com/faso-atlas/backend/internal/services"
	"github.com/faso-atlas/backend/pkg/apperror"
	"github.com/gin-gonic/gin"
)

type ReservationHandler struct {
	svc *services.ReservationService
}

func NewReservationHandler(svc *services.ReservationService) *ReservationHandler {
	return &ReservationHandler{svc: svc}
}

type createReservationRequest struct {
	EstablishmentID uint   `json:"establishmentId" binding:"required"`
	CheckInDate     string `json:"checkInDate" binding:"required"`
	CheckOutDate    string `json:"checkOutDate"`
	GuestsCount     int    `json:"guestsCount"`
	SpecialRequests string `json:"specialRequests"`
}

func (h *ReservationHandler) Create(c *gin.Context) {
	userID := c.GetUint(middleware.UserIDKey)
	var req createReservationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}

	result, appErr := h.svc.Create(c.Request.Context(), services.CreateReservationInput{
		UserID:          userID,
		EstablishmentID: req.EstablishmentID,
		CheckInDate:     req.CheckInDate,
		CheckOutDate:    req.CheckOutDate,
		GuestsCount:     req.GuestsCount,
		SpecialRequests: req.SpecialRequests,
	})
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}

	c.JSON(http.StatusCreated, result)
}

func (h *ReservationHandler) MyReservations(c *gin.Context) {
	userID := c.GetUint(middleware.UserIDKey)
	list, appErr := h.svc.MyReservations(c.Request.Context(), userID)
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, list)
}

func (h *ReservationHandler) OwnerReservations(c *gin.Context) {
	userID := c.GetUint(middleware.UserIDKey)
	list, appErr := h.svc.OwnerReservations(c.Request.Context(), userID)
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, list)
}

func (h *ReservationHandler) Get(c *gin.Context) {
	userID := c.GetUint(middleware.UserIDKey)
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	r, appErr := h.svc.Get(c.Request.Context(), uint(id), userID)
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, r)
}

func (h *ReservationHandler) Cancel(c *gin.Context) {
	userID := c.GetUint(middleware.UserIDKey)
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	r, appErr := h.svc.Cancel(c.Request.Context(), uint(id), userID)
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, r)
}

func (h *ReservationHandler) UpdateStatus(c *gin.Context) {
	var req struct {
		Status models.ReservationStatus `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	r, appErr := h.svc.UpdateStatus(c.Request.Context(), uint(id), req.Status)
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, r)
}
