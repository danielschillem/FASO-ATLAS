package handlers

import (
	"net/http"
	"strconv"

	"github.com/faso-atlas/backend/internal/middleware"
	"github.com/faso-atlas/backend/internal/models"
	"github.com/faso-atlas/backend/internal/services"
	"github.com/faso-atlas/backend/pkg/apperror"
	"github.com/faso-atlas/backend/pkg/pagination"
	"github.com/gin-gonic/gin"
)

type WikiHandler struct {
	wiki *services.WikiService
}

func NewWikiHandler(wiki *services.WikiService) *WikiHandler {
	return &WikiHandler{wiki: wiki}
}

func (h *WikiHandler) ListArticles(c *gin.Context) {
	p := pagination.Parse(c, 20)
	articles, total, appErr := h.wiki.ListArticles(c.Request.Context(), p.Offset, p.Limit, c.Query("category"))
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, pagination.NewResponse(c, articles, total, p))
}

func (h *WikiHandler) GetArticle(c *gin.Context) {
	article, appErr := h.wiki.GetArticle(c.Request.Context(), c.Param("slug"))
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, article)
}

type createArticleRequest struct {
	Title       string             `json:"title" binding:"required"`
	Slug        string             `json:"slug" binding:"required"`
	Subtitle    string             `json:"subtitle"`
	Category    string             `json:"category"`
	LeadText    string             `json:"leadText"`
	BodyHTML    string             `json:"bodyHtml"`
	InfoboxData models.InfoboxData `json:"infoboxData"`
	Tags        []string           `json:"tags"`
}

func (h *WikiHandler) CreateArticle(c *gin.Context) {
	userID := c.GetUint(middleware.UserIDKey)
	var req createArticleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}

	article, appErr := h.wiki.CreateArticle(c.Request.Context(), services.CreateArticleInput{
		UserID:      userID,
		Title:       req.Title,
		Slug:        req.Slug,
		Subtitle:    req.Subtitle,
		Category:    req.Category,
		LeadText:    req.LeadText,
		BodyHTML:    req.BodyHTML,
		InfoboxData: req.InfoboxData,
		Tags:        req.Tags,
	})
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusCreated, article)
}

type addRevisionRequest struct {
	BodyHTML string `json:"bodyHtml" binding:"required"`
	Summary  string `json:"summary"`
}

func (h *WikiHandler) AddRevision(c *gin.Context) {
	userID := c.GetUint(middleware.UserIDKey)
	var req addRevisionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}

	revision, appErr := h.wiki.AddRevision(c.Request.Context(), services.AddRevisionInput{
		UserID:   userID,
		Slug:     c.Param("slug"),
		BodyHTML: req.BodyHTML,
		Summary:  req.Summary,
	})
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusCreated, revision)
}

func (h *WikiHandler) ApproveRevision(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	if appErr := h.wiki.ApproveRevision(c.Request.Context(), uint(id)); appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "revision approved and applied"})
}
