package repository

import (
	"context"

	"github.com/faso-atlas/backend/internal/models"
	"gorm.io/gorm"
)

type PlaceRepository interface {
	List(ctx context.Context, offset, limit int, filters PlaceFilters) ([]models.Place, int64, error)
	GetBySlug(ctx context.Context, slug string) (*models.Place, error)
	GetByID(ctx context.Context, id uint) (*models.Place, error)
	Create(ctx context.Context, place *models.Place) error
	Update(ctx context.Context, place *models.Place) error
	Delete(ctx context.Context, id uint) error
	SetActive(ctx context.Context, id uint, active bool) error
	Search(ctx context.Context, query string, limit int) ([]models.Place, error)
}

type PlaceFilters struct {
	Type     string
	RegionID string
	Active   *bool
}

type placeRepo struct{ db *gorm.DB }

func NewPlaceRepository(db *gorm.DB) PlaceRepository { return &placeRepo{db: db} }

func (r *placeRepo) List(ctx context.Context, offset, limit int, f PlaceFilters) ([]models.Place, int64, error) {
	query := r.db.WithContext(ctx).Model(&models.Place{}).Preload("Region").Preload("Images")
	if f.Active != nil {
		query = query.Where("is_active = ?", *f.Active)
	}
	if f.Type != "" {
		query = query.Where("type = ?", f.Type)
	}
	if f.RegionID != "" {
		query = query.Where("region_id = ?", f.RegionID)
	}
	var total int64
	query.Count(&total)
	var places []models.Place
	err := query.Offset(offset).Limit(limit).Order("rating DESC").Find(&places).Error
	return places, total, err
}

func (r *placeRepo) GetBySlug(ctx context.Context, slug string) (*models.Place, error) {
	var p models.Place
	err := r.db.WithContext(ctx).Preload("Region").Preload("Images").
		Where("slug = ? AND is_active = ?", slug, true).First(&p).Error
	return &p, err
}

func (r *placeRepo) GetByID(ctx context.Context, id uint) (*models.Place, error) {
	var p models.Place
	err := r.db.WithContext(ctx).Preload("Region").Preload("Images").First(&p, id).Error
	return &p, err
}

func (r *placeRepo) Create(ctx context.Context, place *models.Place) error {
	return r.db.WithContext(ctx).Create(place).Error
}

func (r *placeRepo) Update(ctx context.Context, place *models.Place) error {
	return r.db.WithContext(ctx).Save(place).Error
}

func (r *placeRepo) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&models.Place{}, id).Error
}

func (r *placeRepo) SetActive(ctx context.Context, id uint, active bool) error {
	return r.db.WithContext(ctx).Model(&models.Place{}).Where("id = ?", id).Update("is_active", active).Error
}

func (r *placeRepo) Search(ctx context.Context, query string, limit int) ([]models.Place, error) {
	var places []models.Place
	tsQuery := "plainto_tsquery('french', ?)"
	err := r.db.WithContext(ctx).Preload("Region").
		Where("is_active = ? AND search_vec @@ "+tsQuery, true, query).
		Order(gorm.Expr("ts_rank(search_vec, "+tsQuery+") DESC", query)).
		Limit(limit).Find(&places).Error
	if err != nil {
		return places, err
	}
	// Fallback to ILIKE if tsvector returns no results
	if len(places) == 0 {
		err = r.db.WithContext(ctx).Preload("Region").
			Where("is_active = ? AND name ILIKE ?", true, "%"+query+"%").
			Order("rating DESC").Limit(limit).Find(&places).Error
	}
	return places, err
}
