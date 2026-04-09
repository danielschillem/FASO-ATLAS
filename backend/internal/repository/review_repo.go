package repository

import (
	"context"

	"github.com/faso-atlas/backend/internal/models"
	"gorm.io/gorm"
)

type ReviewRepository interface {
	Create(ctx context.Context, review *models.Review) error
	GetByID(ctx context.Context, id uint) (*models.Review, error)
	ListByPlace(ctx context.Context, placeID uint, offset, limit int) ([]models.Review, int64, error)
	ListByEstablishment(ctx context.Context, estabID uint, offset, limit int) ([]models.Review, int64, error)
	Update(ctx context.Context, review *models.Review) error
	Delete(ctx context.Context, id uint) error
	AverageRating(ctx context.Context, placeID *uint, estabID *uint) (float64, int64, error)
}

type reviewRepo struct{ db *gorm.DB }

func NewReviewRepository(db *gorm.DB) ReviewRepository { return &reviewRepo{db: db} }

func (r *reviewRepo) Create(ctx context.Context, review *models.Review) error {
	return r.db.WithContext(ctx).Create(review).Error
}

func (r *reviewRepo) GetByID(ctx context.Context, id uint) (*models.Review, error) {
	var rev models.Review
	err := r.db.WithContext(ctx).Preload("User").Preload("Images").First(&rev, id).Error
	return &rev, err
}

func (r *reviewRepo) ListByPlace(ctx context.Context, placeID uint, offset, limit int) ([]models.Review, int64, error) {
	var reviews []models.Review
	var total int64
	q := r.db.WithContext(ctx).Model(&models.Review{}).Where("place_id = ?", placeID)
	q.Count(&total)
	err := q.Preload("User").Preload("Images").Offset(offset).Limit(limit).Order("created_at DESC").Find(&reviews).Error
	return reviews, total, err
}

func (r *reviewRepo) ListByEstablishment(ctx context.Context, estabID uint, offset, limit int) ([]models.Review, int64, error) {
	var reviews []models.Review
	var total int64
	q := r.db.WithContext(ctx).Model(&models.Review{}).Where("establishment_id = ?", estabID)
	q.Count(&total)
	err := q.Preload("User").Preload("Images").Offset(offset).Limit(limit).Order("created_at DESC").Find(&reviews).Error
	return reviews, total, err
}

func (r *reviewRepo) Update(ctx context.Context, review *models.Review) error {
	return r.db.WithContext(ctx).Save(review).Error
}

func (r *reviewRepo) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&models.Review{}, id).Error
}

func (r *reviewRepo) AverageRating(ctx context.Context, placeID *uint, estabID *uint) (float64, int64, error) {
	var result struct {
		Avg   float64
		Count int64
	}
	q := r.db.WithContext(ctx).Model(&models.Review{})
	if placeID != nil {
		q = q.Where("place_id = ?", *placeID)
	}
	if estabID != nil {
		q = q.Where("establishment_id = ?", *estabID)
	}
	err := q.Select("COALESCE(AVG(rating), 0) as avg, COUNT(*) as count").Scan(&result).Error
	return result.Avg, result.Count, err
}
