package handlers

import (
	"net/http"

	"github.com/faso-atlas/backend/internal/services"
	"github.com/faso-atlas/backend/pkg/apperror"
	"github.com/gin-gonic/gin"
)

type ImageHandler struct {
	imageSvc *services.ImageService
}

func NewImageHandler(imageSvc *services.ImageService) *ImageHandler {
	return &ImageHandler{imageSvc: imageSvc}
}

func (h *ImageHandler) Upload(c *gin.Context) {
	file, header, err := c.Request.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("image file is required"))
		return
	}
	defer file.Close()

	// Limit to 10MB
	if header.Size > 10<<20 {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("image must be smaller than 10MB"))
		return
	}

	folder := c.DefaultPostForm("folder", "general")

	url, err := h.imageSvc.Upload(c.Request.Context(), file, header.Filename, folder)
	if err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("image upload failed: "+err.Error()))
		return
	}

	c.JSON(http.StatusCreated, gin.H{"url": url})
}
