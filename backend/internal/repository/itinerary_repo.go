package repository

import (
	"context"

	"github.com/faso-atlas/backend/internal/models"
	"gorm.io/gorm"
)

type ItineraryRepository interface {
	List(ctx context.Context, offset, limit int, filters ItineraryFilters) ([]models.Itinerary, int64, error)
	ListAll(ctx context.Context, offset, limit int) ([]models.Itinerary, int64, error)
	GetByID(ctx context.Context, id uint) (*models.Itinerary, error)
	Create(ctx context.Context, it *models.Itinerary) error
	Update(ctx context.Context, it *models.Itinerary) error
	Delete(ctx context.Context, id uint) error
	SetPublic(ctx context.Context, id uint, public bool) error
	CreateStop(ctx context.Context, stop *models.ItineraryStop) error
	DeleteStop(ctx context.Context, stopID, itineraryID uint) error
	Search(ctx context.Context, query string, limit int) ([]models.Itinerary, error)
}

type ItineraryFilters struct {
	Difficulty  string
	MaxDuration int
}

type itinRepo struct{ db *gorm.DB }

func NewItineraryRepository(db *gorm.DB) ItineraryRepository { return &itinRepo{db: db} }

func (r *itinRepo) List(ctx context.Context, offset, limit int, f ItineraryFilters) ([]models.Itinerary, int64, error) {
	query := r.db.WithContext(ctx).Model(&models.Itinerary{}).Where("is_public = ?", true)
	if f.Difficulty != "" {
		query = query.Where("difficulty = ?", f.Difficulty)
	}
	if f.MaxDuration > 0 {
		query = query.Where("duration_days <= ?", f.MaxDuration)
	}
	var total int64
	query.Count(&total)
	var list []models.Itinerary
	err := query.Preload("Stops").Preload("Stops.Place").
		Offset(offset).Limit(limit).Order("created_at DESC").Find(&list).Error
	return list, total, err
}

func (r *itinRepo) GetByID(ctx context.Context, id uint) (*models.Itinerary, error) {
	var it models.Itinerary
	err := r.db.WithContext(ctx).Preload("Stops", func(db *gorm.DB) *gorm.DB {
		return db.Order("\"order\" ASC")
	}).Preload("Stops.Place").Preload("Stops.Place.Region").First(&it, id).Error
	return &it, err
}

func (r *itinRepo) Create(ctx context.Context, it *models.Itinerary) error {
	return r.db.WithContext(ctx).Create(it).Error
}

func (r *itinRepo) Update(ctx context.Context, it *models.Itinerary) error {
	return r.db.WithContext(ctx).Save(it).Error
}

func (r *itinRepo) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Select("Stops").Delete(&models.Itinerary{}, id).Error
}

func (r *itinRepo) ListAll(ctx context.Context, offset, limit int) ([]models.Itinerary, int64, error) {
	var total int64
	r.db.WithContext(ctx).Model(&models.Itinerary{}).Count(&total)
	var list []models.Itinerary
	err := r.db.WithContext(ctx).Preload("Stops").Preload("Stops.Place").
		Offset(offset).Limit(limit).Order("created_at DESC").Find(&list).Error
	return list, total, err
}

func (r *itinRepo) SetPublic(ctx context.Context, id uint, public bool) error {
	return r.db.WithContext(ctx).Model(&models.Itinerary{}).Where("id = ?", id).Update("is_public", public).Error
}

func (r *itinRepo) CreateStop(ctx context.Context, stop *models.ItineraryStop) error {
	return r.db.WithContext(ctx).Create(stop).Error
}

func (r *itinRepo) DeleteStop(ctx context.Context, stopID, itineraryID uint) error {
	return r.db.WithContext(ctx).Where("id = ? AND itinerary_id = ?", stopID, itineraryID).
		Delete(&models.ItineraryStop{}).Error
}

func (r *itinRepo) Search(ctx context.Context, query string, limit int) ([]models.Itinerary, error) {
	var list []models.Itinerary
	err := r.db.WithContext(ctx).Where("is_public = ? AND title ILIKE ?", true, "%"+query+"%").
		Limit(limit).Find(&list).Error
	return list, err
}
