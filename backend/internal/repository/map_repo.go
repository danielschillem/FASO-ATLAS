package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/faso-atlas/backend/internal/models"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type MapRepository interface {
	GetPlaces(ctx context.Context, placeType, regionID string) ([]models.Place, error)
	GetPlaceByID(ctx context.Context, id uint) (*models.Place, error)
	GetRegions(ctx context.Context) ([]models.Region, error)
	GetCached(ctx context.Context, key string) ([]byte, error)
	SetCached(ctx context.Context, key string, data []byte, ttl time.Duration) error
}

type mapRepo struct {
	db  *gorm.DB
	rdb *redis.Client
}

func NewMapRepository(db *gorm.DB, rdb *redis.Client) MapRepository {
	return &mapRepo{db: db, rdb: rdb}
}

func (r *mapRepo) GetPlaces(ctx context.Context, placeType, regionID string) ([]models.Place, error) {
	query := r.db.WithContext(ctx).Model(&models.Place{}).
		Preload("Region").Preload("Images").
		Where("is_active = ?", true)
	if placeType != "" && placeType != "all" {
		query = query.Where("type = ?", placeType)
	}
	if regionID != "" {
		query = query.Where("region_id = ?", regionID)
	}
	var places []models.Place
	err := query.Find(&places).Error
	return places, err
}

func (r *mapRepo) GetPlaceByID(ctx context.Context, id uint) (*models.Place, error) {
	var p models.Place
	err := r.db.WithContext(ctx).Preload("Region").Preload("Images").First(&p, id).Error
	return &p, err
}

func (r *mapRepo) GetRegions(ctx context.Context) ([]models.Region, error) {
	var regions []models.Region
	err := r.db.WithContext(ctx).Find(&regions).Error
	return regions, err
}

func (r *mapRepo) GetCached(ctx context.Context, key string) ([]byte, error) {
	return r.rdb.Get(ctx, key).Bytes()
}

func (r *mapRepo) SetCached(ctx context.Context, key string, data []byte, ttl time.Duration) error {
	return r.rdb.Set(ctx, key, data, ttl).Err()
}

func MapCacheKey(placeType, regionID string) string {
	return fmt.Sprintf("map:places:type=%s:region=%s", placeType, regionID)
}
