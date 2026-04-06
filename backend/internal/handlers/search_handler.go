package handlers

import (
	"net/http"

	"github.com/faso-atlas/backend/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type SearchHandler struct {
	db *gorm.DB
}

func NewSearchHandler(db *gorm.DB) *SearchHandler {
	return &SearchHandler{db: db}
}

func (h *SearchHandler) Search(c *gin.Context) {
	q := c.Query("q")
	if q == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "query parameter 'q' is required"})
		return
	}

	searchType := c.Query("type")
	tsQuery := "plainto_tsquery('french', ?)"

	result := gin.H{}

	if searchType == "" || searchType == "place" {
		var places []models.Place
		h.db.Preload("Region").
			Where("is_active = ? AND (search_vec @@ "+tsQuery+" OR name ILIKE ?)", true, q, "%"+q+"%").
			Order("ts_rank(search_vec, " + tsQuery + ") DESC").
			Limit(10).
			Find(&places, q, q)
		result["places"] = places
	}

	if searchType == "" || searchType == "establishment" {
		var establishments []models.Establishment
		h.db.Preload("Place").Preload("Place.Region").
			Joins("JOIN places ON places.id = establishments.place_id").
			Where("establishments.is_available = ? AND places.name ILIKE ?", true, "%"+q+"%").
			Limit(10).
			Find(&establishments)
		result["establishments"] = establishments
	}

	if searchType == "" || searchType == "wiki" {
		var articles []models.WikiArticle
		h.db.Where("is_approved = ? AND (search_vec @@ "+tsQuery+" OR title ILIKE ?)", true, q, "%"+q+"%").
			Select("id, slug, title, subtitle, category, lead_text").
			Limit(10).
			Find(&articles, q)
		result["wiki"] = articles
	}

	if searchType == "" || searchType == "itinerary" {
		var itineraries []models.Itinerary
		h.db.Where("is_public = ? AND title ILIKE ?", true, "%"+q+"%").
			Limit(10).
			Find(&itineraries)
		result["itineraries"] = itineraries
	}

	c.JSON(http.StatusOK, result)
}
