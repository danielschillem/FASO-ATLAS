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

type NotificationHandler struct {
	notifs *services.NotificationService
}

func NewNotificationHandler(notifs *services.NotificationService) *NotificationHandler {
	return &NotificationHandler{notifs: notifs}
}

func (h *NotificationHandler) List(c *gin.Context) {
	userID := c.GetUint(middleware.UserIDKey)
	p := pagination.Parse(c, 20)
	notifs, total, appErr := h.notifs.List(c.Request.Context(), userID, p.Offset, p.Limit)
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, pagination.NewResponse(c, notifs, total, p))
}

func (h *NotificationHandler) UnreadCount(c *gin.Context) {
	userID := c.GetUint(middleware.UserIDKey)
	count, appErr := h.notifs.UnreadCount(c.Request.Context(), userID)
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, gin.H{"count": count})
}

func (h *NotificationHandler) MarkRead(c *gin.Context) {
	userID := c.GetUint(middleware.UserIDKey)
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	if appErr := h.notifs.MarkRead(c.Request.Context(), uint(id), userID); appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "marked as read"})
}

func (h *NotificationHandler) MarkAllRead(c *gin.Context) {
	userID := c.GetUint(middleware.UserIDKey)
	if appErr := h.notifs.MarkAllRead(c.Request.Context(), userID); appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "all marked as read"})
}
