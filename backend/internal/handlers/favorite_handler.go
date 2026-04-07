package handlers

import (
	"net/http"
	"strconv"

	"github.com/faso-atlas/backend/internal/models"
	"github.com/faso-atlas/backend/internal/repository"
	"github.com/faso-atlas/backend/pkg/apperror"
	"github.com/gin-gonic/gin"
)

type FavoriteHandler struct {
	repo repository.FavoriteRepository
}

func NewFavoriteHandler(repo repository.FavoriteRepository) *FavoriteHandler {
	return &FavoriteHandler{repo: repo}
}

type toggleFavoriteRequest struct {
	TargetID   uint                `json:"targetId" binding:"required"`
	TargetType models.FavoriteType `json:"targetType" binding:"required"`
}

func (h *FavoriteHandler) Toggle(c *gin.Context) {
	userID := c.GetUint("userID")
	var req toggleFavoriteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid request body"))
		return
	}
	if req.TargetType != models.FavoritePlace && req.TargetType != models.FavoriteItinerary {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("targetType must be 'place' or 'itinerary'"))
		return
	}

	ctx := c.Request.Context()
	exists, err := h.repo.Exists(ctx, userID, req.TargetID, req.TargetType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to check favorite"))
		return
	}

	if exists {
		if err := h.repo.Remove(ctx, userID, req.TargetID, req.TargetType); err != nil {
			c.JSON(http.StatusInternalServerError, apperror.Internal("failed to remove favorite"))
			return
		}
		c.JSON(http.StatusOK, gin.H{"favorited": false})
	} else {
		fav := &models.Favorite{
			UserID:     userID,
			TargetID:   req.TargetID,
			TargetType: req.TargetType,
		}
		if err := h.repo.Add(ctx, fav); err != nil {
			c.JSON(http.StatusInternalServerError, apperror.Internal("failed to add favorite"))
			return
		}
		c.JSON(http.StatusCreated, gin.H{"favorited": true})
	}
}

func (h *FavoriteHandler) List(c *gin.Context) {
	userID := c.GetUint("userID")
	targetType := models.FavoriteType(c.Query("type"))

	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	if limit > 100 {
		limit = 100
	}

	favorites, total, err := h.repo.ListByUser(c.Request.Context(), userID, targetType, offset, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to list favorites"))
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  favorites,
		"total": total,
	})
}

func (h *FavoriteHandler) Check(c *gin.Context) {
	userID := c.GetUint("userID")
	targetID, err := strconv.ParseUint(c.Param("targetId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid targetId"))
		return
	}
	targetType := models.FavoriteType(c.Query("type"))
	if targetType == "" {
		targetType = models.FavoritePlace
	}

	exists, err := h.repo.Exists(c.Request.Context(), userID, uint(targetID), targetType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to check favorite"))
		return
	}

	c.JSON(http.StatusOK, gin.H{"favorited": exists})
}
