package services

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"time"

	"github.com/faso-atlas/backend/internal/models"
	"github.com/faso-atlas/backend/internal/repository"
	"github.com/faso-atlas/backend/pkg/apperror"
	"github.com/gin-gonic/gin"
)

type MapService struct {
	repo   repository.MapRepository
	logger *slog.Logger
}

func NewMapService(repo repository.MapRepository, logger *slog.Logger) *MapService {
	return &MapService{repo: repo, logger: logger}
}

func (s *MapService) GetPlaces(ctx context.Context, placeType, regionID string) (gin.H, *apperror.AppError) {
	cacheKey := repository.MapCacheKey(placeType, regionID)

	if cached, err := s.repo.GetCached(ctx, cacheKey); err == nil {
		var result gin.H
		if json.Unmarshal(cached, &result) == nil {
			return result, nil
		}
	}

	places, err := s.repo.GetPlaces(ctx, placeType, regionID)
	if err != nil {
		s.logger.ErrorContext(ctx, "failed to fetch map places", "error", err)
		return nil, apperror.Internal("failed to fetch places")
	}

	features := make([]gin.H, len(places))
	for i, p := range places {
		features[i] = gin.H{
			"type": "Feature",
			"geometry": gin.H{
				"type":        "Point",
				"coordinates": []float64{p.Longitude, p.Latitude},
			},
			"properties": gin.H{
				"id":          p.ID,
				"name":        p.Name,
				"slug":        p.Slug,
				"type":        p.Type,
				"description": p.Description,
				"rating":      p.Rating,
				"reviewCount": p.ReviewCount,
				"tags":        p.Tags,
				"region":      p.Region.Name,
				"images":      p.Images,
			},
		}
	}

	resp := gin.H{
		"type":     "FeatureCollection",
		"features": features,
	}

	if data, err := json.Marshal(resp); err == nil {
		_ = s.repo.SetCached(ctx, cacheKey, data, 5*time.Minute)
	}

	return resp, nil
}

func (s *MapService) GetPlace(ctx context.Context, id uint) (*models.Place, *apperror.AppError) {
	place, err := s.repo.GetPlaceByID(ctx, id)
	if err != nil {
		return nil, apperror.NotFound("place")
	}
	return place, nil
}

func (s *MapService) GetRegions(ctx context.Context) ([]models.Region, *apperror.AppError) {
	regions, err := s.repo.GetRegions(ctx)
	if err != nil {
		s.logger.ErrorContext(ctx, "failed to fetch regions", "error", err)
		return nil, apperror.Internal("failed to fetch regions")
	}
	return regions, nil
}

// InvalidateMapCache removes all map caches (called when places are updated).
func (s *MapService) InvalidateMapCache(ctx context.Context, placeType, regionID string) {
	key := fmt.Sprintf("map:places:type=%s:region=%s", placeType, regionID)
	_ = s.repo.SetCached(ctx, key, nil, 0)
}
