package handlers

import (
	"net/http"

	"github.com/faso-atlas/backend/internal/repository"
	"github.com/faso-atlas/backend/pkg/apperror"
	"github.com/gin-gonic/gin"
)

type PublicStats struct {
	TotalPlaces         int64 `json:"totalPlaces"`
	TotalRegions        int64 `json:"totalRegions"`
	TotalEstablishments int64 `json:"totalEstablishments"`
	TotalItineraries    int64 `json:"totalItineraries"`
	TotalSymbols        int64 `json:"totalSymbols"`
	TotalEvents         int64 `json:"totalEvents"`
	TotalArticles       int64 `json:"totalArticles"`
}

type StatsHandler struct {
	places  repository.PlaceRepository
	estabs  repository.EstablishmentRepository
	itins   repository.ItineraryRepository
	symbols repository.SymbolRepository
	atlas   repository.AtlasRepository
	wiki    repository.WikiRepository
	maps    repository.MapRepository
}

func NewStatsHandler(
	places repository.PlaceRepository,
	estabs repository.EstablishmentRepository,
	itins repository.ItineraryRepository,
	symbols repository.SymbolRepository,
	atlas repository.AtlasRepository,
	wiki repository.WikiRepository,
	maps repository.MapRepository,
) *StatsHandler {
	return &StatsHandler{
		places:  places,
		estabs:  estabs,
		itins:   itins,
		symbols: symbols,
		atlas:   atlas,
		wiki:    wiki,
		maps:    maps,
	}
}

func (h *StatsHandler) GetPublicStats(c *gin.Context) {
	ctx := c.Request.Context()

	active := true
	_, totalPlaces, err := h.places.List(ctx, 0, 1, repository.PlaceFilters{Active: &active})
	if err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to fetch stats"))
		return
	}

	regions, err := h.maps.GetRegions(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to fetch stats"))
		return
	}

	_, totalEstabs, err := h.estabs.List(ctx, 0, 1, repository.EstablishmentFilters{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to fetch stats"))
		return
	}

	_, totalItins, err := h.itins.List(ctx, 0, 1, repository.ItineraryFilters{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to fetch stats"))
		return
	}

	symbols, err := h.symbols.List(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to fetch stats"))
		return
	}

	events, err := h.atlas.ListEvents(ctx, "")
	if err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to fetch stats"))
		return
	}

	_, totalArticles, err := h.wiki.ListArticles(ctx, 0, 1, "")
	if err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to fetch stats"))
		return
	}

	c.JSON(http.StatusOK, PublicStats{
		TotalPlaces:         totalPlaces,
		TotalRegions:        int64(len(regions)),
		TotalEstablishments: totalEstabs,
		TotalItineraries:    totalItins,
		TotalSymbols:        int64(len(symbols)),
		TotalEvents:         int64(len(events)),
		TotalArticles:       totalArticles,
	})
}
