package repository

import (
	"context"
	"time"

	"github.com/faso-atlas/backend/internal/models"
	"gorm.io/gorm"
)

type AdRepository interface {
	// Public
	ListActive(ctx context.Context, placement models.AdPlacement, page string, limit int) ([]models.Ad, error)
	IncrementImpressions(ctx context.Context, ids []uint) error
	IncrementClicks(ctx context.Context, id uint) error
	// Admin CRUD
	Create(ctx context.Context, ad *models.Ad) error
	Update(ctx context.Context, ad *models.Ad) error
	Delete(ctx context.Context, id uint) error
	GetByID(ctx context.Context, id uint) (*models.Ad, error)
	List(ctx context.Context, offset, limit int) ([]models.Ad, int64, error)
}

type adRepo struct{ db *gorm.DB }

func NewAdRepository(db *gorm.DB) AdRepository { return &adRepo{db: db} }

// ListActive returns ads that are active, within date range, matching placement and page.
func (r *adRepo) ListActive(ctx context.Context, placement models.AdPlacement, page string, limit int) ([]models.Ad, error) {
	now := time.Now()
	query := r.db.WithContext(ctx).
		Where("is_active = ? AND placement = ?", true, placement).
		Where("(starts_at IS NULL OR starts_at <= ?)", now).
		Where("(ends_at IS NULL OR ends_at >= ?)", now)

	if page != "" {
		query = query.Where("? = ANY(pages)", page)
	}

	var ads []models.Ad
	err := query.Order("priority DESC, created_at DESC").Limit(limit).Find(&ads).Error
	return ads, err
}

func (r *adRepo) IncrementImpressions(ctx context.Context, ids []uint) error {
	if len(ids) == 0 {
		return nil
	}
	return r.db.WithContext(ctx).
		Model(&models.Ad{}).
		Where("id IN ?", ids).
		UpdateColumn("impressions", gorm.Expr("impressions + 1")).Error
}

func (r *adRepo) IncrementClicks(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).
		Model(&models.Ad{}).
		Where("id = ?", id).
		UpdateColumn("clicks", gorm.Expr("clicks + 1")).Error
}

func (r *adRepo) Create(ctx context.Context, ad *models.Ad) error {
	return r.db.WithContext(ctx).Create(ad).Error
}

func (r *adRepo) Update(ctx context.Context, ad *models.Ad) error {
	return r.db.WithContext(ctx).Save(ad).Error
}

func (r *adRepo) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&models.Ad{}, id).Error
}

func (r *adRepo) GetByID(ctx context.Context, id uint) (*models.Ad, error) {
	var ad models.Ad
	err := r.db.WithContext(ctx).First(&ad, id).Error
	return &ad, err
}

func (r *adRepo) List(ctx context.Context, offset, limit int) ([]models.Ad, int64, error) {
	var ads []models.Ad
	var total int64
	r.db.WithContext(ctx).Model(&models.Ad{}).Count(&total)
	err := r.db.WithContext(ctx).Offset(offset).Limit(limit).Order("priority DESC, created_at DESC").Find(&ads).Error
	return ads, total, err
}
