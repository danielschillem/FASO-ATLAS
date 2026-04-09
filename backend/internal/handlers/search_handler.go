package handlers

import (
	"net/http"
	"sync"

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

	var (
		mu     sync.Mutex
		wg     sync.WaitGroup
		result = gin.H{}
	)

	if searchType == "" || searchType == "place" {
		wg.Add(1)
		go func() {
			defer wg.Done()
			places, _ := h.places.Search(ctx, q, 10)
			mu.Lock()
			result["places"] = places
			mu.Unlock()
		}()
	}

	if searchType == "" || searchType == "establishment" {
		wg.Add(1)
		go func() {
			defer wg.Done()
			estabs, _ := h.establishments.Search(ctx, q, 10)
			mu.Lock()
			result["establishments"] = estabs
			mu.Unlock()
		}()
	}

	if searchType == "" || searchType == "wiki" {
		wg.Add(1)
		go func() {
			defer wg.Done()
			articles, _ := h.wiki.SearchArticles(ctx, q, 10)
			mu.Lock()
			result["wiki"] = articles
			mu.Unlock()
		}()
	}

	if searchType == "" || searchType == "itinerary" {
		wg.Add(1)
		go func() {
			defer wg.Done()
			itins, _ := h.itineraries.Search(ctx, q, 10)
			mu.Lock()
			result["itineraries"] = itins
			mu.Unlock()
		}()
	}

	wg.Wait()

	c.JSON(http.StatusOK, result)
}
