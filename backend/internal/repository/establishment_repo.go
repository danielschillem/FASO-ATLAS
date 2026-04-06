package repository

import (
	"context"

	"github.com/faso-atlas/backend/internal/models"
	"gorm.io/gorm"
)

type EstablishmentRepository interface {
	List(ctx context.Context, offset, limit int, filters EstablishmentFilters) ([]models.Establishment, int64, error)
	GetByID(ctx context.Context, id uint) (*models.Establishment, error)
	Search(ctx context.Context, query string, limit int) ([]models.Establishment, error)
}

type EstablishmentFilters struct {
	Type     string
	MinStars int
	RegionID string
}

type estabRepo struct{ db *gorm.DB }

func NewEstablishmentRepository(db *gorm.DB) EstablishmentRepository { return &estabRepo{db: db} }

func (r *estabRepo) List(ctx context.Context, offset, limit int, f EstablishmentFilters) ([]models.Establishment, int64, error) {
	query := r.db.WithContext(ctx).Model(&models.Establishment{}).
		Preload("Place").Preload("Place.Region").Preload("Place.Images").
		Where("is_available = ?", true)
	if f.Type != "" {
		query = query.Where("type = ?", f.Type)
	}
	if f.MinStars >= 1 && f.MinStars <= 5 {
		query = query.Where("stars >= ?", f.MinStars)
	}
	if f.RegionID != "" {
		query = query.Joins("JOIN places ON places.id = establishments.place_id").
			Where("places.region_id = ?", f.RegionID)
	}
	var total int64
	query.Count(&total)
	var list []models.Establishment
	err := query.Offset(offset).Limit(limit).Find(&list).Error
	return list, total, err
}

func (r *estabRepo) GetByID(ctx context.Context, id uint) (*models.Establishment, error) {
	var e models.Establishment
	err := r.db.WithContext(ctx).Preload("Place").Preload("Place.Region").Preload("Place.Images").
		First(&e, id).Error
	return &e, err
}

func (r *estabRepo) Search(ctx context.Context, query string, limit int) ([]models.Establishment, error) {
	var list []models.Establishment
	err := r.db.WithContext(ctx).Preload("Place").Preload("Place.Region").
		Joins("JOIN places ON places.id = establishments.place_id").
		Where("establishments.is_available = ? AND places.name ILIKE ?", true, "%"+query+"%").
		Limit(limit).Find(&list).Error
	return list, err
}
