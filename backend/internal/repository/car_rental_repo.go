package repository

import (
	"context"

	"github.com/faso-atlas/backend/internal/models"
	"gorm.io/gorm"
)

type CarRentalRepository interface {
	List(ctx context.Context, offset, limit int, filters CarRentalFilters) ([]models.CarRental, int64, error)
	ListAll(ctx context.Context, offset, limit int) ([]models.CarRental, int64, error)
	GetByID(ctx context.Context, id uint) (*models.CarRental, error)
	Create(ctx context.Context, c *models.CarRental) error
	Update(ctx context.Context, c *models.CarRental) error
	Delete(ctx context.Context, id uint) error
	SetAvailable(ctx context.Context, id uint, available bool) error
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

func (r *carRentalRepo) ListAll(ctx context.Context, offset, limit int) ([]models.CarRental, int64, error) {
	var total int64
	r.db.WithContext(ctx).Model(&models.CarRental{}).Count(&total)
	var list []models.CarRental
	err := r.db.WithContext(ctx).Preload("Region").
		Offset(offset).Limit(limit).Order("id DESC").Find(&list).Error
	return list, total, err
}

func (r *carRentalRepo) Create(ctx context.Context, c *models.CarRental) error {
	return r.db.WithContext(ctx).Create(c).Error
}

func (r *carRentalRepo) Update(ctx context.Context, c *models.CarRental) error {
	return r.db.WithContext(ctx).Save(c).Error
}

func (r *carRentalRepo) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&models.CarRental{}, id).Error
}

func (r *carRentalRepo) SetAvailable(ctx context.Context, id uint, available bool) error {
	return r.db.WithContext(ctx).Model(&models.CarRental{}).Where("id = ?", id).Update("is_available", available).Error
}
