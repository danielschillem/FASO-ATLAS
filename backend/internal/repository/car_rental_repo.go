package repository

import (
	"context"

	"github.com/faso-atlas/backend/internal/models"
	"gorm.io/gorm"
)

type CarRentalRepository interface {
	List(ctx context.Context, offset, limit int, filters CarRentalFilters) ([]models.CarRental, int64, error)
	GetByID(ctx context.Context, id uint) (*models.CarRental, error)
}

type CarRentalFilters struct {
	Category string
	RegionID string
	MinSeats int
}

type carRentalRepo struct{ db *gorm.DB }

func NewCarRentalRepository(db *gorm.DB) CarRentalRepository {
	return &carRentalRepo{db: db}
}

func (r *carRentalRepo) List(ctx context.Context, offset, limit int, f CarRentalFilters) ([]models.CarRental, int64, error) {
	query := r.db.WithContext(ctx).Model(&models.CarRental{}).
		Preload("Region").
		Where("is_available = ?", true)

	if f.Category != "" {
		query = query.Where("category = ?", f.Category)
	}
	if f.RegionID != "" {
		query = query.Where("region_id = ?", f.RegionID)
	}
	if f.MinSeats > 0 {
		query = query.Where("seats >= ?", f.MinSeats)
	}

	var total int64
	query.Count(&total)

	var list []models.CarRental
	err := query.Order("price_per_day ASC").Offset(offset).Limit(limit).Find(&list).Error
	return list, total, err
}

func (r *carRentalRepo) GetByID(ctx context.Context, id uint) (*models.CarRental, error) {
	var c models.CarRental
	err := r.db.WithContext(ctx).Preload("Region").First(&c, id).Error
	return &c, err
}
