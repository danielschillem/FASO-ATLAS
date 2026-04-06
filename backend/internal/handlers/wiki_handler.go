package handlers

import (
	"net/http"
	"strconv"

	"github.com/faso-atlas/backend/internal/middleware"
	"github.com/faso-atlas/backend/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/microcosm-cc/bluemonday"
	"gorm.io/gorm"
)

type WikiHandler struct {
	db      *gorm.DB
	sanitizer *bluemonday.Policy
}

func NewWikiHandler(db *gorm.DB) *WikiHandler {
	return &WikiHandler{
		db:      db,
		sanitizer: bluemonday.UGCPolicy(),
	}
}

func (h *WikiHandler) ListArticles(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset := paginate(page, limit)

	query := h.db.Model(&models.WikiArticle{}).Where("is_approved = ?", true)
	if cat := c.Query("category"); cat != "" {
		query = query.Where("category = ?", cat)
	}

	var total int64
	query.Count(&total)

	var articles []models.WikiArticle
	query.Select("id, slug, title, subtitle, category, lead_text, tags, view_count, created_at").
		Offset(offset).Limit(limit).
		Order("view_count DESC").
		Find(&articles)

	c.Header("X-Total-Count", strconv.FormatInt(total, 10))
	c.JSON(http.StatusOK, gin.H{"data": articles, "total": total})
}

func (h *WikiHandler) GetArticle(c *gin.Context) {
	var article models.WikiArticle
	if err := h.db.Preload("Author").
		Where("slug = ? AND is_approved = ?", c.Param("slug"), true).
		First(&article).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "article not found"})
		return
	}
	h.db.Model(&article).UpdateColumn("view_count", gorm.Expr("view_count + 1"))
	c.JSON(http.StatusOK, article)
}

type createArticleRequest struct {
	Title       string              `json:"title" binding:"required"`
	Slug        string              `json:"slug" binding:"required"`
	Subtitle    string              `json:"subtitle"`
	Category    string              `json:"category"`
	LeadText    string              `json:"leadText"`
	BodyHTML    string              `json:"bodyHtml"`
	InfoboxData models.InfoboxData  `json:"infoboxData"`
	Tags        []string            `json:"tags"`
}

func (h *WikiHandler) CreateArticle(c *gin.Context) {
	userID := c.GetUint(middleware.UserIDKey)
	var req createArticleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	article := models.WikiArticle{
		Slug:        req.Slug,
		Title:       req.Title,
		Subtitle:    req.Subtitle,
		Category:    req.Category,
		LeadText:    req.LeadText,
		BodyHTML:    h.sanitizer.Sanitize(req.BodyHTML),
		InfoboxData: req.InfoboxData,
		Tags:        req.Tags,
		AuthorID:    &userID,
		IsApproved:  false,
	}

	if err := h.db.Create(&article).Error; err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "slug already exists"})
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
	var article models.WikiArticle
	if err := h.db.Where("slug = ?", c.Param("slug")).First(&article).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "article not found"})
		return
	}

	var req addRevisionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	revision := models.WikiRevision{
		ArticleID: article.ID,
		AuthorID:  userID,
		BodyHTML:  h.sanitizer.Sanitize(req.BodyHTML),
		Summary:   req.Summary,
	}
	h.db.Create(&revision)
	c.JSON(http.StatusCreated, revision)
}

func (h *WikiHandler) ApproveRevision(c *gin.Context) {
	var revision models.WikiRevision
	if err := h.db.First(&revision, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "revision not found"})
		return
	}

	h.db.Model(&models.WikiArticle{}).Where("id = ?", revision.ArticleID).
		Updates(map[string]interface{}{
			"body_html":   revision.BodyHTML,
			"is_approved": true,
		})

	c.JSON(http.StatusOK, gin.H{"message": "revision approved and applied"})
}
