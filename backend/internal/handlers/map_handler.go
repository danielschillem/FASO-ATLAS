package handlers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/faso-atlas/backend/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type MapHandler struct {
	db  *gorm.DB
	rdb *redis.Client
}

func NewMapHandler(db *gorm.DB, rdb *redis.Client) *MapHandler {
	return &MapHandler{db: db, rdb: rdb}
}

func (h *MapHandler) GetPlaces(c *gin.Context) {
	placeType := c.Query("type")
	regionID := c.Query("region_id")

	cacheKey := fmt.Sprintf("map:places:type=%s:region=%s", placeType, regionID)

	// Try cache first
	if cached, err := h.rdb.Get(c, cacheKey).Bytes(); err == nil {
		c.Data(http.StatusOK, "application/json", cached)
		return
	}

	query := h.db.Model(&models.Place{}).
		Preload("Region").
		Preload("Images").
		Where("is_active = ?", true)

	if placeType != "" && placeType != "all" {
		query = query.Where("type = ?", placeType)
	}
	if regionID != "" {
		query = query.Where("region_id = ?", regionID)
	}

	var places []models.Place
	if err := query.Find(&places).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch places"})
		return
	}

	// Build GeoJSON FeatureCollection
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

	// Cache for 5 minutes
	if data, err := marshalJSON(resp); err == nil {
		h.rdb.Set(c, cacheKey, data, 5*time.Minute)
	}

	c.JSON(http.StatusOK, resp)
}

func (h *MapHandler) GetPlace(c *gin.Context) {
	var place models.Place
	if err := h.db.Preload("Region").Preload("Images").First(&place, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "place not found"})
		return
	}
	c.JSON(http.StatusOK, place)
}

func (h *MapHandler) GetRegions(c *gin.Context) {
	var regions []models.Region
	if err := h.db.Find(&regions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch regions"})
		return
	}
	c.JSON(http.StatusOK, regions)
}
