package handlers

import (
	"net/http"

	"github.com/faso-atlas/backend/internal/models"
	"github.com/faso-atlas/backend/internal/services"
	"github.com/faso-atlas/backend/pkg/apperror"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	auth *services.AuthService
}

func NewAuthHandler(auth *services.AuthService) *AuthHandler {
	return &AuthHandler{auth: auth}
}

type registerRequest struct {
	Email     string          `json:"email" binding:"required,email"`
	Password  string          `json:"password" binding:"required"`
	FirstName string          `json:"firstName" binding:"required"`
	LastName  string          `json:"lastName"`
	Role      models.UserRole `json:"role"`
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req registerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}

	result, appErr := h.auth.Register(c.Request.Context(), services.RegisterInput{
		Email:     req.Email,
		Password:  req.Password,
		FirstName: req.FirstName,
		LastName:  req.LastName,
		Role:      req.Role,
	})
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}

	c.JSON(http.StatusCreated, result)
}

type loginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}

	result, appErr := h.auth.Login(c.Request.Context(), req.Email, req.Password)
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}

	c.JSON(http.StatusOK, result)
}

type refreshRequest struct {
	RefreshToken string `json:"refreshToken" binding:"required"`
}

func (h *AuthHandler) Refresh(c *gin.Context) {
	var req refreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}

	result, appErr := h.auth.Refresh(c.Request.Context(), req.RefreshToken)
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}

	c.JSON(http.StatusOK, result)
}

func (h *AuthHandler) Me(c *gin.Context) {
	userID := c.GetUint("userID")
	user, appErr := h.auth.GetCurrentUser(c.Request.Context(), userID)
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, user)
}

func (h *AuthHandler) VerifyEmail(c *gin.Context) {
	var req struct {
		Token string `json:"token" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}

	if appErr := h.auth.VerifyEmail(c.Request.Context(), req.Token); appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "email verified successfully"})
}

func (h *AuthHandler) RequestVerification(c *gin.Context) {
	userID := c.GetUint("userID")
	token, appErr := h.auth.RequestEmailVerification(c.Request.Context(), userID)
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}

	// In production, send this token via email instead of returning it
	c.JSON(http.StatusOK, gin.H{
		"message": "verification email sent",
		"token":   token, // Remove in production
	})
}

func (h *AuthHandler) ForgotPassword(c *gin.Context) {
	var req struct {
		Email string `json:"email" binding:"required,email"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}

	token, appErr := h.auth.RequestPasswordReset(c.Request.Context(), req.Email)
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}

	resp := gin.H{"message": "if an account exists with that email, a reset link has been sent"}
	if token != "" {
		resp["token"] = token // Remove in production
	}
	c.JSON(http.StatusOK, resp)
}

func (h *AuthHandler) ResetPassword(c *gin.Context) {
	var req struct {
		Token       string `json:"token" binding:"required"`
		NewPassword string `json:"newPassword" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}

	if appErr := h.auth.ResetPassword(c.Request.Context(), req.Token, req.NewPassword); appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "password reset successfully"})
}
