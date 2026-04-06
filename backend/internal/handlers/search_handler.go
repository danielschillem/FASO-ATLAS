package handlers

import (
	"net/http"

	"github.com/faso-atlas/backend/internal/repository"
	"github.com/faso-atlas/backend/pkg/apperror"
	"github.com/gin-gonic/gin"
)

type SearchHandler struct {
	places         repository.PlaceRepository
	establishments repository.EstablishmentRepository
	wiki           repository.WikiRepository
	itineraries    repository.ItineraryRepository
}

func NewSearchHandler(
	places repository.PlaceRepository,
	estab repository.EstablishmentRepository,
	wiki repository.WikiRepository,
	itin repository.ItineraryRepository,
) *SearchHandler {
	return &SearchHandler{places: places, establishments: estab, wiki: wiki, itineraries: itin}
}

func (h *SearchHandler) Search(c *gin.Context) {
	q := c.Query("q")
	if q == "" {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("query parameter 'q' is required"))
		return
	}
	if len(q) > 200 {
		q = q[:200]
	}

	ctx := c.Request.Context()
	searchType := c.Query("type")
	result := gin.H{}

	if searchType == "" || searchType == "place" {
		places, _ := h.places.Search(ctx, q, 10)
		result["places"] = places
	}

	if searchType == "" || searchType == "establishment" {
		estabs, _ := h.establishments.Search(ctx, q, 10)
		result["establishments"] = estabs
	}

	if searchType == "" || searchType == "wiki" {
		articles, _ := h.wiki.SearchArticles(ctx, q, 10)
		result["wiki"] = articles
	}

	if searchType == "" || searchType == "itinerary" {
		itins, _ := h.itineraries.Search(ctx, q, 10)
		result["itineraries"] = itins
	}

	c.JSON(http.StatusOK, result)
}
