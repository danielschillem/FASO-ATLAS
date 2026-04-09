package handlers

import (
	"net/http"
	"strconv"

	"github.com/faso-atlas/backend/internal/models"
	"github.com/faso-atlas/backend/internal/services"
	"github.com/faso-atlas/backend/pkg/apperror"
	"github.com/faso-atlas/backend/pkg/pagination"
	"github.com/gin-gonic/gin"
)

type AdHandler struct {
	ads *services.AdService
}

func NewAdHandler(ads *services.AdService) *AdHandler {
	return &AdHandler{ads: ads}
}

// ─── Public endpoints ───

// GetActiveAds returns ads for a given placement + page.
// GET /api/v1/ads?placement=banner&page=home&limit=3
func (h *AdHandler) GetActiveAds(c *gin.Context) {
	placement := models.AdPlacement(c.DefaultQuery("placement", "banner"))
	page := c.Query("page")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "3"))

	ads, appErr := h.ads.GetActiveAds(c.Request.Context(), placement, page, limit)
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": ads})
}

// TrackClick increments the click counter for an ad.
// POST /api/v1/ads/:id/click
func (h *AdHandler) TrackClick(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	if appErr := h.ads.TrackClick(c.Request.Context(), uint(id)); appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, gin.H{"tracked": true})
}

// ─── Admin endpoints ───

func (h *AdHandler) AdminList(c *gin.Context) {
	p := pagination.Parse(c, 20)
	ads, total, appErr := h.ads.List(c.Request.Context(), p.Offset, p.Limit)
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, pagination.NewResponse(c, ads, total, p))
}

func (h *AdHandler) AdminGet(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	ad, appErr := h.ads.GetByID(c.Request.Context(), uint(id))
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, ad)
}

type adRequest struct {
	Title       string   `json:"title" binding:"required"`
	PartnerName string   `json:"partnerName" binding:"required"`
	Placement   string   `json:"placement" binding:"required"`
	ImageURL    string   `json:"imageUrl" binding:"required"`
	LinkURL     string   `json:"linkUrl" binding:"required"`
	AltText     string   `json:"altText"`
	Pages       []string `json:"pages"`
	Priority    int      `json:"priority"`
	StartsAt    string   `json:"startsAt"`
	EndsAt      string   `json:"endsAt"`
	IsActive    bool     `json:"isActive"`
}

func (h *AdHandler) AdminCreate(c *gin.Context) {
	var req adRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}
	ad, appErr := h.ads.Create(c.Request.Context(), services.CreateAdInput{
		Title:       req.Title,
		PartnerName: req.PartnerName,
		Placement:   req.Placement,
		ImageURL:    req.ImageURL,
		LinkURL:     req.LinkURL,
		AltText:     req.AltText,
		Pages:       req.Pages,
		Priority:    req.Priority,
		StartsAt:    req.StartsAt,
		EndsAt:      req.EndsAt,
		IsActive:    req.IsActive,
	})
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusCreated, ad)
}

func (h *AdHandler) AdminUpdate(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	var req adRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}
	ad, appErr := h.ads.Update(c.Request.Context(), uint(id), services.CreateAdInput{
		Title:       req.Title,
		PartnerName: req.PartnerName,
		Placement:   req.Placement,
		ImageURL:    req.ImageURL,
		LinkURL:     req.LinkURL,
		AltText:     req.AltText,
		Pages:       req.Pages,
		Priority:    req.Priority,
		StartsAt:    req.StartsAt,
		EndsAt:      req.EndsAt,
		IsActive:    req.IsActive,
	})
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, ad)
}

func (h *AdHandler) AdminDelete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	if appErr := h.ads.Delete(c.Request.Context(), uint(id)); appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "ad deleted"})
}
