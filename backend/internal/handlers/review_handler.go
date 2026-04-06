package handlers

import (
	"net/http"
	"strconv"

	"github.com/faso-atlas/backend/internal/middleware"
	"github.com/faso-atlas/backend/internal/services"
	"github.com/faso-atlas/backend/pkg/apperror"
	"github.com/faso-atlas/backend/pkg/pagination"
	"github.com/gin-gonic/gin"
)

type ReviewHandler struct {
	reviews *services.ReviewService
}

func NewReviewHandler(reviews *services.ReviewService) *ReviewHandler {
	return &ReviewHandler{reviews: reviews}
}

type createReviewRequest struct {
	PlaceID         *uint  `json:"placeId"`
	EstablishmentID *uint  `json:"establishmentId"`
	Rating          int    `json:"rating" binding:"required"`
	Comment         string `json:"comment"`
}

func (h *ReviewHandler) Create(c *gin.Context) {
	userID := c.GetUint(middleware.UserIDKey)
	var req createReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}

	review, appErr := h.reviews.Create(c.Request.Context(), services.CreateReviewInput{
		UserID:          userID,
		PlaceID:         req.PlaceID,
		EstablishmentID: req.EstablishmentID,
		Rating:          req.Rating,
		Comment:         req.Comment,
	})
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusCreated, review)
}

func (h *ReviewHandler) ListByPlace(c *gin.Context) {
	placeID, err := strconv.ParseUint(c.Param("placeId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid placeId"))
		return
	}
	p := pagination.Parse(c, 20)
	reviews, total, appErr := h.reviews.ListByPlace(c.Request.Context(), uint(placeID), p.Offset, p.Limit)
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, pagination.NewResponse(c, reviews, total, p))
}

func (h *ReviewHandler) ListByEstablishment(c *gin.Context) {
	estabID, err := strconv.ParseUint(c.Param("establishmentId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid establishmentId"))
		return
	}
	p := pagination.Parse(c, 20)
	reviews, total, appErr := h.reviews.ListByEstablishment(c.Request.Context(), uint(estabID), p.Offset, p.Limit)
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, pagination.NewResponse(c, reviews, total, p))
}

func (h *ReviewHandler) Update(c *gin.Context) {
	userID := c.GetUint(middleware.UserIDKey)
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}

	var req struct {
		Rating  int    `json:"rating" binding:"required"`
		Comment string `json:"comment"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}

	review, appErr := h.reviews.Update(c.Request.Context(), uint(id), userID, req.Rating, req.Comment)
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, review)
}

func (h *ReviewHandler) Delete(c *gin.Context) {
	userID := c.GetUint(middleware.UserIDKey)
	role, _ := c.Get(middleware.UserRoleKey)
	isAdmin := role == "admin"

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}

	if appErr := h.reviews.Delete(c.Request.Context(), uint(id), userID, isAdmin); appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "review deleted"})
}
