package repository

import (
	"context"

	"github.com/faso-atlas/backend/internal/models"
	"gorm.io/gorm"
)

type WikiRepository interface {
	ListArticles(ctx context.Context, offset, limit int, category string) ([]models.WikiArticle, int64, error)
	GetArticleBySlug(ctx context.Context, slug string) (*models.WikiArticle, error)
	CreateArticle(ctx context.Context, a *models.WikiArticle) error
	IncrementViewCount(ctx context.Context, id uint) error
	SetApproved(ctx context.Context, id uint, approved bool) error
	CreateRevision(ctx context.Context, rev *models.WikiRevision) error
	GetRevisionByID(ctx context.Context, id uint) (*models.WikiRevision, error)
	ApplyRevision(ctx context.Context, articleID uint, bodyHTML string) error
	SearchArticles(ctx context.Context, query string, limit int) ([]models.WikiArticle, error)
}

type wikiRepo struct{ db *gorm.DB }

func NewWikiRepository(db *gorm.DB) WikiRepository { return &wikiRepo{db: db} }

func (r *wikiRepo) ListArticles(ctx context.Context, offset, limit int, category string) ([]models.WikiArticle, int64, error) {
	query := r.db.WithContext(ctx).Model(&models.WikiArticle{}).Where("is_approved = ?", true)
	if category != "" {
		query = query.Where("category = ?", category)
	}
	var total int64
	query.Count(&total)
	var articles []models.WikiArticle
	err := query.Select("id, slug, title, subtitle, category, lead_text, tags, view_count, created_at").
		Offset(offset).Limit(limit).Order("view_count DESC").Find(&articles).Error
	return articles, total, err
}

func (r *wikiRepo) GetArticleBySlug(ctx context.Context, slug string) (*models.WikiArticle, error) {
	var a models.WikiArticle
	err := r.db.WithContext(ctx).Preload("Author").
		Where("slug = ? AND is_approved = ?", slug, true).First(&a).Error
	return &a, err
}

func (r *wikiRepo) CreateArticle(ctx context.Context, a *models.WikiArticle) error {
	return r.db.WithContext(ctx).Create(a).Error
}

func (r *wikiRepo) IncrementViewCount(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Model(&models.WikiArticle{}).Where("id = ?", id).
		UpdateColumn("view_count", gorm.Expr("view_count + 1")).Error
}

func (r *wikiRepo) SetApproved(ctx context.Context, id uint, approved bool) error {
	return r.db.WithContext(ctx).Model(&models.WikiArticle{}).Where("id = ?", id).
		Update("is_approved", approved).Error
}

func (r *wikiRepo) CreateRevision(ctx context.Context, rev *models.WikiRevision) error {
	return r.db.WithContext(ctx).Create(rev).Error
}

func (r *wikiRepo) GetRevisionByID(ctx context.Context, id uint) (*models.WikiRevision, error) {
	var rev models.WikiRevision
	err := r.db.WithContext(ctx).First(&rev, id).Error
	return &rev, err
}

func (r *wikiRepo) ApplyRevision(ctx context.Context, articleID uint, bodyHTML string) error {
	return r.db.WithContext(ctx).Model(&models.WikiArticle{}).Where("id = ?", articleID).
		Updates(map[string]interface{}{"body_html": bodyHTML, "is_approved": true}).Error
}

func (r *wikiRepo) SearchArticles(ctx context.Context, query string, limit int) ([]models.WikiArticle, error) {
	var articles []models.WikiArticle
	tsQuery := "plainto_tsquery('french', ?)"
	err := r.db.WithContext(ctx).
		Where("is_approved = ? AND search_vec @@ "+tsQuery, true, query).
		Select("id, slug, title, subtitle, category, lead_text").
		Order(gorm.Expr("ts_rank(search_vec, "+tsQuery+") DESC", query)).
		Limit(limit).Find(&articles).Error
	if err != nil {
		return articles, err
	}
	// Fallback to ILIKE if tsvector returns no results
	if len(articles) == 0 {
		err = r.db.WithContext(ctx).Where("is_approved = ? AND title ILIKE ?", true, "%"+query+"%").
			Select("id, slug, title, subtitle, category, lead_text").
			Limit(limit).Find(&articles).Error
	}
	return articles, err
}
