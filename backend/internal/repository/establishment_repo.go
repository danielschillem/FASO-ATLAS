package repository

import (
	"context"

	"github.com/faso-atlas/backend/internal/models"
	"gorm.io/gorm"
)

type EstablishmentRepository interface {
	List(ctx context.Context, offset, limit int, filters EstablishmentFilters) ([]models.Establishment, int64, error)
	ListAll(ctx context.Context, offset, limit int) ([]models.Establishment, int64, error)
	ListByOwner(ctx context.Context, ownerID uint, offset, limit int) ([]models.Establishment, int64, error)
	GetByID(ctx context.Context, id uint) (*models.Establishment, error)
	Create(ctx context.Context, e *models.Establishment) error
	Update(ctx context.Context, e *models.Establishment) error
	Delete(ctx context.Context, id uint) error
	SetAvailable(ctx context.Context, id uint, available bool) error
	Search(ctx context.Context, query string, limit int) ([]models.Establishment, error)
	NearBy(ctx context.Context, lat, lng, radiusKm float64, limit int) ([]models.Establishment, error)
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

func (r *estabRepo) ListAll(ctx context.Context, offset, limit int) ([]models.Establishment, int64, error) {
	var total int64
	r.db.WithContext(ctx).Model(&models.Establishment{}).Count(&total)
	var list []models.Establishment
	err := r.db.WithContext(ctx).Preload("Place").Preload("Place.Region").
		Offset(offset).Limit(limit).Order("id DESC").Find(&list).Error
	return list, total, err
}

func (r *estabRepo) ListByOwner(ctx context.Context, ownerID uint, offset, limit int) ([]models.Establishment, int64, error) {
	var total int64
	r.db.WithContext(ctx).Model(&models.Establishment{}).Where("owner_id = ?", ownerID).Count(&total)
	var list []models.Establishment
	err := r.db.WithContext(ctx).Preload("Place").Preload("Place.Region").Preload("Place.Images").
		Where("owner_id = ?", ownerID).
		Offset(offset).Limit(limit).Order("id DESC").Find(&list).Error
	return list, total, err
}

func (r *estabRepo) Create(ctx context.Context, e *models.Establishment) error {
	return r.db.WithContext(ctx).Create(e).Error
}

func (r *estabRepo) Update(ctx context.Context, e *models.Establishment) error {
	return r.db.WithContext(ctx).Save(e).Error
}

func (r *estabRepo) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&models.Establishment{}, id).Error
}

func (r *estabRepo) SetAvailable(ctx context.Context, id uint, available bool) error {
	return r.db.WithContext(ctx).Model(&models.Establishment{}).Where("id = ?", id).Update("is_available", available).Error
}

func (r *estabRepo) Search(ctx context.Context, query string, limit int) ([]models.Establishment, error) {
	var list []models.Establishment
	err := r.db.WithContext(ctx).Preload("Place").Preload("Place.Region").
		Joins("JOIN places ON places.id = establishments.place_id").
		Where("establishments.is_available = ? AND places.name ILIKE ?", true, "%"+query+"%").
		Limit(limit).Find(&list).Error
	return list, err
}

func (r *estabRepo) NearBy(ctx context.Context, lat, lng, radiusKm float64, limit int) ([]models.Establishment, error) {
	var list []models.Establishment
	delta := radiusKm / 111.0
	err := r.db.WithContext(ctx).
		Preload("Place").Preload("Place.Region").Preload("Place.Images").
		Joins("JOIN places ON places.id = establishments.place_id").
		Where("establishments.is_available = ?", true).
		Where("places.latitude BETWEEN ? AND ? AND places.longitude BETWEEN ? AND ?",
			lat-delta, lat+delta, lng-delta, lng+delta).
		Where("haversine_distance(places.latitude, places.longitude, ?, ?) <= ?", lat, lng, radiusKm).
		Order(gorm.Expr("haversine_distance(places.latitude, places.longitude, ?, ?)", lat, lng)).
		Limit(limit).Find(&list).Error
	return list, err
}
