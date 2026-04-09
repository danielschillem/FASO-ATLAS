package repository

import (
	"context"

	"github.com/faso-atlas/backend/internal/models"
	"gorm.io/gorm"
)

type RegionRepository interface {
	List(ctx context.Context) ([]models.Region, error)
	GetByID(ctx context.Context, id uint) (*models.Region, error)
	Create(ctx context.Context, r *models.Region) error
	Update(ctx context.Context, r *models.Region) error
	Delete(ctx context.Context, id uint) error
}

type regionRepo struct{ db *gorm.DB }

func NewRegionRepository(db *gorm.DB) RegionRepository { return &regionRepo{db: db} }

func (r *regionRepo) List(ctx context.Context) ([]models.Region, error) {
	var regions []models.Region
	err := r.db.WithContext(ctx).Order("name ASC").Find(&regions).Error
	return regions, err
}

func (r *regionRepo) GetByID(ctx context.Context, id uint) (*models.Region, error) {
	var region models.Region
	err := r.db.WithContext(ctx).First(&region, id).Error
	return &region, err
}

func (r *regionRepo) Create(ctx context.Context, region *models.Region) error {
	return r.db.WithContext(ctx).Create(region).Error
}

func (r *regionRepo) Update(ctx context.Context, region *models.Region) error {
	return r.db.WithContext(ctx).Save(region).Error
}

func (r *regionRepo) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&models.Region{}, id).Error
}
