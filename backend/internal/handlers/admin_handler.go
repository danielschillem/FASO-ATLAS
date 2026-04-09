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

type AdminHandler struct {
	admin *services.AdminService
}

func NewAdminHandler(admin *services.AdminService) *AdminHandler {
	return &AdminHandler{admin: admin}
}

func (h *AdminHandler) ListUsers(c *gin.Context) {
	p := pagination.Parse(c, 20)
	users, total, appErr := h.admin.ListUsers(c.Request.Context(), p.Offset, p.Limit)
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, pagination.NewResponse(c, users, total, p))
}

func (h *AdminHandler) UpdateUserRole(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	var req struct {
		Role models.UserRole `json:"role" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}

	user, appErr := h.admin.UpdateUserRole(c.Request.Context(), uint(id), req.Role)
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, user)
}

func (h *AdminHandler) DeleteUser(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	if appErr := h.admin.DeleteUser(c.Request.Context(), uint(id)); appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "user deleted"})
}

func (h *AdminHandler) TogglePlaceActive(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	var req struct {
		Active bool `json:"active"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}
	if appErr := h.admin.TogglePlaceActive(c.Request.Context(), uint(id), req.Active); appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "place updated"})
}

func (h *AdminHandler) ToggleArticleApproved(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	var req struct {
		Approved bool `json:"approved"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}
	if appErr := h.admin.ToggleArticleApproved(c.Request.Context(), uint(id), req.Approved); appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "article updated"})
}

func (h *AdminHandler) GetStats(c *gin.Context) {
	stats, appErr := h.admin.GetStats(c.Request.Context())
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, stats)
}

// ─── Admin Place CRUD ───

func (h *AdminHandler) ListPlaces(c *gin.Context) {
	p := pagination.Parse(c, 20)
	places, total, appErr := h.admin.ListPlaces(c.Request.Context(), p.Offset, p.Limit)
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, pagination.NewResponse(c, places, total, p))
}

func (h *AdminHandler) GetPlace(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	place, appErr := h.admin.GetPlace(c.Request.Context(), uint(id))
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, place)
}

func (h *AdminHandler) CreatePlace(c *gin.Context) {
	var req services.CreatePlaceInput
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}
	place, appErr := h.admin.CreatePlace(c.Request.Context(), req)
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusCreated, place)
}

func (h *AdminHandler) UpdatePlace(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	var req services.CreatePlaceInput
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}
	place, appErr := h.admin.UpdatePlace(c.Request.Context(), uint(id), req)
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, place)
}

func (h *AdminHandler) DeletePlace(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	if appErr := h.admin.DeletePlace(c.Request.Context(), uint(id)); appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "place deleted"})
}
