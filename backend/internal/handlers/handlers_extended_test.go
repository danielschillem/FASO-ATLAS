package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/faso-atlas/backend/internal/middleware"
	"github.com/faso-atlas/backend/internal/models"
	"github.com/faso-atlas/backend/internal/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ====================== Favorite Handler Tests ======================

func setupFavoriteRouter(favH *FavoriteHandler) *gin.Engine {
	r := gin.New()
	fav := r.Group("/api/v1/favorites")
	fav.Use(func(c *gin.Context) { c.Set("userID", uint(1)); c.Next() })
	fav.POST("/toggle", favH.Toggle)
	fav.GET("/", favH.List)
	fav.GET("/check/:targetId", favH.Check)
	return r
}

func TestFavorite_Toggle_Add(t *testing.T) {
	repo := &mockFavoriteRepo{}
	h := NewFavoriteHandler(repo)
	r := setupFavoriteRouter(h)

	body := `{"targetId":1,"targetType":"place"}`
	req := httptest.NewRequest(http.MethodPost, "/api/v1/favorites/toggle", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("status = %d, want %d, body: %s", w.Code, http.StatusCreated, w.Body.String())
	}
	var result map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &result)
	if result["favorited"] != true {
		t.Errorf("favorited = %v, want true", result["favorited"])
	}
}

func TestFavorite_Toggle_Remove(t *testing.T) {
	repo := &mockFavoriteRepo{
		favorites: []models.Favorite{
			{Base: models.Base{ID: 1}, UserID: 1, TargetID: 1, TargetType: models.FavoritePlace},
		},
	}
	h := NewFavoriteHandler(repo)
	r := setupFavoriteRouter(h)

	body := `{"targetId":1,"targetType":"place"}`
	req := httptest.NewRequest(http.MethodPost, "/api/v1/favorites/toggle", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d, body: %s", w.Code, http.StatusOK, w.Body.String())
	}
	var result map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &result)
	if result["favorited"] != false {
		t.Errorf("favorited = %v, want false", result["favorited"])
	}
}

func TestFavorite_Toggle_InvalidType(t *testing.T) {
	repo := &mockFavoriteRepo{}
	h := NewFavoriteHandler(repo)
	r := setupFavoriteRouter(h)

	body := `{"targetId":1,"targetType":"invalid"}`
	req := httptest.NewRequest(http.MethodPost, "/api/v1/favorites/toggle", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}
}

func TestFavorite_List(t *testing.T) {
	repo := &mockFavoriteRepo{
		favorites: []models.Favorite{
			{Base: models.Base{ID: 1}, UserID: 1, TargetID: 1, TargetType: models.FavoritePlace},
			{Base: models.Base{ID: 2}, UserID: 1, TargetID: 2, TargetType: models.FavoritePlace},
		},
	}
	h := NewFavoriteHandler(repo)
	r := setupFavoriteRouter(h)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/favorites/", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusOK)
	}
	var result map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &result)
	if result["total"].(float64) != 2 {
		t.Errorf("total = %v, want 2", result["total"])
	}
}

func TestFavorite_Check(t *testing.T) {
	repo := &mockFavoriteRepo{
		favorites: []models.Favorite{
			{Base: models.Base{ID: 1}, UserID: 1, TargetID: 5, TargetType: models.FavoritePlace},
		},
	}
	h := NewFavoriteHandler(repo)
	r := setupFavoriteRouter(h)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/favorites/check/5?type=place", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusOK)
	}
	var result map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &result)
	if result["favorited"] != true {
		t.Errorf("favorited = %v, want true", result["favorited"])
	}
}

// ====================== Itinerary Handler Tests ======================

func setupItineraryRouter(itH *ItineraryHandler) *gin.Engine {
	r := gin.New()
	it := r.Group("/api/v1/itineraries")
	it.GET("/", itH.List)
	it.GET("/:id", itH.Get)
	it.POST("/", func(c *gin.Context) { c.Set(middleware.UserIDKey, uint(1)); c.Next() }, itH.Create)
	return r
}

func TestItinerary_List(t *testing.T) {
	repo := &mockItineraryRepo{
		itineraries: []models.Itinerary{
			{Base: models.Base{ID: 1}, Title: "Route des Cascades", DurationDays: 3, Difficulty: "moyen"},
			{Base: models.Base{ID: 2}, Title: "Sahel Adventure", DurationDays: 7, Difficulty: "difficile"},
		},
	}
	h := NewItineraryHandler(repo)
	r := setupItineraryRouter(h)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/itineraries/", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d, body: %s", w.Code, http.StatusOK, w.Body.String())
	}
}

func TestItinerary_Get(t *testing.T) {
	repo := &mockItineraryRepo{
		itineraries: []models.Itinerary{
			{Base: models.Base{ID: 1}, Title: "Route des Cascades"},
		},
	}
	h := NewItineraryHandler(repo)
	r := setupItineraryRouter(h)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/itineraries/1", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusOK)
	}
}

func TestItinerary_GetNotFound(t *testing.T) {
	repo := &mockItineraryRepo{}
	h := NewItineraryHandler(repo)
	r := setupItineraryRouter(h)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/itineraries/999", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusNotFound)
	}
}

func TestItinerary_Create(t *testing.T) {
	repo := &mockItineraryRepo{}
	h := NewItineraryHandler(repo)
	r := setupItineraryRouter(h)

	body := `{"title":"Mon Itinéraire","durationDays":5,"difficulty":"facile"}`
	req := httptest.NewRequest(http.MethodPost, "/api/v1/itineraries/", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("status = %d, want %d, body: %s", w.Code, http.StatusCreated, w.Body.String())
	}
}

func TestItinerary_Create_MissingTitle(t *testing.T) {
	repo := &mockItineraryRepo{}
	h := NewItineraryHandler(repo)
	r := setupItineraryRouter(h)

	body := `{"durationDays":5}`
	req := httptest.NewRequest(http.MethodPost, "/api/v1/itineraries/", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}
}

// ====================== Atlas Handler Tests ======================

func TestAtlas_GetEvents(t *testing.T) {
	repo := &mockAtlasRepo{
		events: []models.AtlasEvent{
			{Base: models.Base{ID: 1}, Era: "mossi", Title: "Fondation du Mogho Naba"},
			{Base: models.Base{ID: 2}, Era: "colonial", Title: "Colonisation française"},
		},
	}
	h := NewAtlasHandler(repo)
	r := gin.New()
	r.GET("/api/v1/atlas/events", h.GetEvents)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/atlas/events", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusOK)
	}
	var events []map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &events)
	if len(events) != 2 {
		t.Errorf("events count = %d, want 2", len(events))
	}
}

func TestAtlas_GetEvents_FilterByEra(t *testing.T) {
	repo := &mockAtlasRepo{
		events: []models.AtlasEvent{
			{Base: models.Base{ID: 1}, Era: "mossi", Title: "Fondation"},
			{Base: models.Base{ID: 2}, Era: "colonial", Title: "Colonisation"},
		},
	}
	h := NewAtlasHandler(repo)
	r := gin.New()
	r.GET("/api/v1/atlas/events", h.GetEvents)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/atlas/events?era=mossi", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusOK)
	}
	var events []map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &events)
	if len(events) != 1 {
		t.Errorf("events count = %d, want 1", len(events))
	}
}

// ====================== Symbol Handler Tests ======================

func TestSymbol_List(t *testing.T) {
	repo := &mockSymbolRepo{
		symbols: []models.Symbol{
			{Base: models.Base{ID: 1}, Name: "Masque Bobo", Category: "masques"},
			{Base: models.Base{ID: 2}, Name: "Balafon", Category: "instruments"},
		},
	}
	h := NewSymbolHandler(repo)
	r := gin.New()
	r.GET("/api/v1/symbols", h.List)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/symbols", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusOK)
	}
	var symbols []map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &symbols)
	if len(symbols) != 2 {
		t.Errorf("symbols count = %d, want 2", len(symbols))
	}
}

// ====================== Establishment Handler Tests ======================

func setupEstablishmentRouter(estH *EstablishmentHandler) *gin.Engine {
	r := gin.New()
	est := r.Group("/api/v1/establishments")
	est.GET("/", estH.List)
	est.GET("/:id", estH.Get)
	return r
}

func TestEstablishment_List(t *testing.T) {
	repo := &mockEstablishmentRepo{
		establishments: []models.Establishment{
			{Base: models.Base{ID: 1}, Type: "hotel", Stars: 3, IsAvailable: true},
			{Base: models.Base{ID: 2}, Type: "gite", Stars: 2, IsAvailable: true},
		},
	}
	h := NewEstablishmentHandler(repo)
	r := setupEstablishmentRouter(h)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/establishments/", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d, body: %s", w.Code, http.StatusOK, w.Body.String())
	}
}

func TestEstablishment_Get(t *testing.T) {
	repo := &mockEstablishmentRepo{
		establishments: []models.Establishment{
			{Base: models.Base{ID: 1}, Type: "hotel", Stars: 4},
		},
	}
	h := NewEstablishmentHandler(repo)
	r := setupEstablishmentRouter(h)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/establishments/1", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusOK)
	}
}

func TestEstablishment_GetNotFound(t *testing.T) {
	repo := &mockEstablishmentRepo{}
	h := NewEstablishmentHandler(repo)
	r := setupEstablishmentRouter(h)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/establishments/999", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusNotFound)
	}
}

// ====================== Search Handler Tests ======================

func TestSearch_All(t *testing.T) {
	searchH := NewSearchHandler(
		&mockPlaceRepo{places: []models.Place{{Name: "Nazinga", Slug: "nazinga"}}},
		&mockEstablishmentRepo{},
		&mockWikiRepo{},
		&mockItineraryRepo{},
	)
	r := gin.New()
	r.GET("/api/v1/search", searchH.Search)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/search?q=test", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusOK)
	}
	var result map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &result)
	if result["places"] == nil {
		t.Error("expected places key in result")
	}
	if result["establishments"] == nil {
		t.Error("expected establishments key in result")
	}
	if result["wiki"] == nil {
		t.Error("expected wiki key in result")
	}
	if result["itineraries"] == nil {
		t.Error("expected itineraries key in result")
	}
}

func TestSearch_MissingQuery(t *testing.T) {
	searchH := NewSearchHandler(
		&mockPlaceRepo{}, &mockEstablishmentRepo{}, &mockWikiRepo{}, &mockItineraryRepo{},
	)
	r := gin.New()
	r.GET("/api/v1/search", searchH.Search)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/search", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}
}

func TestSearch_ByType(t *testing.T) {
	searchH := NewSearchHandler(
		&mockPlaceRepo{places: []models.Place{{Name: "Nazinga"}}},
		&mockEstablishmentRepo{},
		&mockWikiRepo{},
		&mockItineraryRepo{},
	)
	r := gin.New()
	r.GET("/api/v1/search", searchH.Search)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/search?q=test&type=place", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusOK)
	}
	var result map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &result)
	if result["places"] == nil {
		t.Error("expected places in filtered result")
	}
	// Other keys should NOT exist when filtered by type
	if result["wiki"] != nil {
		t.Error("wiki should not be present when type=place")
	}
}

// ====================== Stats Handler Tests ======================

func TestStats_GetPublicStats(t *testing.T) {
	statsH := NewStatsHandler(
		&mockPlaceRepo{places: []models.Place{
			{Base: models.Base{ID: 1}, Name: "P1", IsActive: true},
			{Base: models.Base{ID: 2}, Name: "P2", IsActive: true},
		}},
		&mockEstablishmentRepo{establishments: []models.Establishment{
			{Base: models.Base{ID: 1}},
		}},
		&mockItineraryRepo{itineraries: []models.Itinerary{
			{Base: models.Base{ID: 1}},
		}},
		&mockSymbolRepo{symbols: []models.Symbol{
			{Base: models.Base{ID: 1}},
			{Base: models.Base{ID: 2}},
		}},
		&mockAtlasRepo{events: []models.AtlasEvent{
			{Base: models.Base{ID: 1}},
		}},
		&mockWikiRepo{articles: []models.WikiArticle{
			{Base: models.Base{ID: 1}},
			{Base: models.Base{ID: 2}},
			{Base: models.Base{ID: 3}},
		}},
		&mockMapRepo{regions: []models.Region{
			{Base: models.Base{ID: 1}, Name: "Kadiogo"},
		}},
	)
	r := gin.New()
	r.GET("/api/v1/stats", statsH.GetPublicStats)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/stats", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d, body: %s", w.Code, http.StatusOK, w.Body.String())
	}
	var stats PublicStats
	json.Unmarshal(w.Body.Bytes(), &stats)
	if stats.TotalPlaces != 2 {
		t.Errorf("TotalPlaces = %d, want 2", stats.TotalPlaces)
	}
	if stats.TotalRegions != 1 {
		t.Errorf("TotalRegions = %d, want 1", stats.TotalRegions)
	}
	if stats.TotalSymbols != 2 {
		t.Errorf("TotalSymbols = %d, want 2", stats.TotalSymbols)
	}
	if stats.TotalArticles != 3 {
		t.Errorf("TotalArticles = %d, want 3", stats.TotalArticles)
	}
}

// ====================== Review Handler Tests (via service) ======================

func setupReviewRouter(revH *ReviewHandler) *gin.Engine {
	r := gin.New()
	rev := r.Group("/api/v1/reviews")
	rev.Use(func(c *gin.Context) {
		c.Set(middleware.UserIDKey, uint(1))
		c.Set(middleware.UserRoleKey, "user")
		c.Next()
	})
	rev.POST("/", revH.Create)
	rev.GET("/place/:placeId", revH.ListByPlace)
	rev.GET("/establishment/:establishmentId", revH.ListByEstablishment)
	rev.PUT("/:id", revH.Update)
	rev.DELETE("/:id", revH.Delete)
	return r
}

func TestReview_Create(t *testing.T) {
	reviewRepo := &mockReviewRepo{}
	placeRepo := &mockPlaceRepo{places: []models.Place{
		{Base: models.Base{ID: 1}, Name: "Nazinga", IsActive: true},
	}}
	svc := services.NewReviewService(reviewRepo, placeRepo, testLogger())
	h := NewReviewHandler(svc)
	r := setupReviewRouter(h)

	body := `{"placeId":1,"rating":4,"comment":"Super lieu"}`
	req := httptest.NewRequest(http.MethodPost, "/api/v1/reviews/", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("status = %d, want %d, body: %s", w.Code, http.StatusCreated, w.Body.String())
	}
}

func TestReview_Create_InvalidRating(t *testing.T) {
	reviewRepo := &mockReviewRepo{}
	placeRepo := &mockPlaceRepo{}
	svc := services.NewReviewService(reviewRepo, placeRepo, testLogger())
	h := NewReviewHandler(svc)
	r := setupReviewRouter(h)

	body := `{"placeId":1,"rating":6,"comment":"Trop"}`
	req := httptest.NewRequest(http.MethodPost, "/api/v1/reviews/", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}
}

func TestReview_ListByPlace(t *testing.T) {
	placeID := uint(1)
	reviewRepo := &mockReviewRepo{reviews: []models.Review{
		{Base: models.Base{ID: 1}, UserID: 1, PlaceID: &placeID, Rating: 5},
	}}
	placeRepo := &mockPlaceRepo{}
	svc := services.NewReviewService(reviewRepo, placeRepo, testLogger())
	h := NewReviewHandler(svc)
	r := setupReviewRouter(h)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/reviews/place/1", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusOK)
	}
}

func TestReview_Delete_Own(t *testing.T) {
	placeID := uint(1)
	reviewRepo := &mockReviewRepo{reviews: []models.Review{
		{Base: models.Base{ID: 1}, UserID: 1, PlaceID: &placeID, Rating: 4},
	}}
	placeRepo := &mockPlaceRepo{places: []models.Place{
		{Base: models.Base{ID: 1}, Name: "Nazinga", IsActive: true},
	}}
	svc := services.NewReviewService(reviewRepo, placeRepo, testLogger())
	h := NewReviewHandler(svc)
	r := setupReviewRouter(h)

	req := httptest.NewRequest(http.MethodDelete, "/api/v1/reviews/1", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d, body: %s", w.Code, http.StatusOK, w.Body.String())
	}
}

func TestReview_Delete_Forbidden(t *testing.T) {
	placeID := uint(1)
	reviewRepo := &mockReviewRepo{reviews: []models.Review{
		{Base: models.Base{ID: 1}, UserID: 99, PlaceID: &placeID, Rating: 4},
	}}
	placeRepo := &mockPlaceRepo{}
	svc := services.NewReviewService(reviewRepo, placeRepo, testLogger())
	h := NewReviewHandler(svc)
	r := setupReviewRouter(h)

	req := httptest.NewRequest(http.MethodDelete, "/api/v1/reviews/1", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusForbidden {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusForbidden)
	}
}

// ====================== Reservation Handler Tests (via service) ======================

func setupReservationRouter(resH *ReservationHandler) *gin.Engine {
	r := gin.New()
	res := r.Group("/api/v1/reservations")
	res.Use(func(c *gin.Context) {
		c.Set(middleware.UserIDKey, uint(1))
		c.Set(middleware.UserRoleKey, "user")
		c.Next()
	})
	res.POST("/", resH.Create)
	res.GET("/", resH.MyReservations)
	res.GET("/:id", resH.Get)
	res.PUT("/:id/cancel", resH.Cancel)
	return r
}

func TestReservation_Create(t *testing.T) {
	resRepo := &mockReservationRepo{}
	estRepo := &mockEstablishmentRepo{establishments: []models.Establishment{
		{Base: models.Base{ID: 1}, Type: "hotel", PriceMinFCFA: 25000, IsAvailable: true},
	}}
	svc := services.NewReservationService(resRepo, estRepo, testLogger())
	h := NewReservationHandler(svc)
	r := setupReservationRouter(h)

	body := fmt.Sprintf(`{"establishmentId":1,"checkInDate":"%s","checkOutDate":"%s","guestsCount":2}`,
		"2027-01-15", "2027-01-17")
	req := httptest.NewRequest(http.MethodPost, "/api/v1/reservations/", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("status = %d, want %d, body: %s", w.Code, http.StatusCreated, w.Body.String())
	}
}

func TestReservation_Create_NotAvailable(t *testing.T) {
	resRepo := &mockReservationRepo{}
	estRepo := &mockEstablishmentRepo{establishments: []models.Establishment{
		{Base: models.Base{ID: 1}, Type: "hotel", IsAvailable: false},
	}}
	svc := services.NewReservationService(resRepo, estRepo, testLogger())
	h := NewReservationHandler(svc)
	r := setupReservationRouter(h)

	body := `{"establishmentId":1,"checkInDate":"2027-01-15","guestsCount":2}`
	req := httptest.NewRequest(http.MethodPost, "/api/v1/reservations/", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusConflict {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusConflict)
	}
}

func TestReservation_MyReservations(t *testing.T) {
	resRepo := &mockReservationRepo{reservations: []models.Reservation{
		{Base: models.Base{ID: 1}, UserID: 1, Status: models.StatusPending},
	}}
	estRepo := &mockEstablishmentRepo{}
	svc := services.NewReservationService(resRepo, estRepo, testLogger())
	h := NewReservationHandler(svc)
	r := setupReservationRouter(h)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/reservations/", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusOK)
	}
}

func TestReservation_Cancel(t *testing.T) {
	resRepo := &mockReservationRepo{reservations: []models.Reservation{
		{Base: models.Base{ID: 1}, UserID: 1, Status: models.StatusPending},
	}}
	estRepo := &mockEstablishmentRepo{}
	svc := services.NewReservationService(resRepo, estRepo, testLogger())
	h := NewReservationHandler(svc)
	r := setupReservationRouter(h)

	req := httptest.NewRequest(http.MethodPut, "/api/v1/reservations/1/cancel", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d, body: %s", w.Code, http.StatusOK, w.Body.String())
	}
}

// ====================== Wiki Handler Tests (via service) ======================

func setupWikiRouter(wH *WikiHandler) *gin.Engine {
	r := gin.New()
	wiki := r.Group("/api/v1/wiki")
	wiki.GET("/articles", wH.ListArticles)
	wiki.GET("/articles/:slug", wH.GetArticle)
	wiki.POST("/articles", func(c *gin.Context) {
		c.Set(middleware.UserIDKey, uint(1))
		c.Next()
	}, wH.CreateArticle)
	return r
}

func TestWiki_ListArticles(t *testing.T) {
	repo := &mockWikiRepo{articles: []models.WikiArticle{
		{Base: models.Base{ID: 1}, Slug: "mossi", Title: "Empire Mossi", Category: "histoire"},
		{Base: models.Base{ID: 2}, Slug: "bobo", Title: "Peuple Bobo", Category: "peuples"},
	}}
	svc := services.NewWikiService(repo, testLogger())
	h := NewWikiHandler(svc)
	r := setupWikiRouter(h)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/wiki/articles", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusOK)
	}
}

func TestWiki_GetArticle(t *testing.T) {
	repo := &mockWikiRepo{articles: []models.WikiArticle{
		{Base: models.Base{ID: 1}, Slug: "mossi", Title: "Empire Mossi"},
	}}
	svc := services.NewWikiService(repo, testLogger())
	h := NewWikiHandler(svc)
	r := setupWikiRouter(h)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/wiki/articles/mossi", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusOK)
	}
}

func TestWiki_GetArticle_NotFound(t *testing.T) {
	repo := &mockWikiRepo{}
	svc := services.NewWikiService(repo, testLogger())
	h := NewWikiHandler(svc)
	r := setupWikiRouter(h)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/wiki/articles/unknown", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusNotFound)
	}
}

func TestWiki_CreateArticle(t *testing.T) {
	repo := &mockWikiRepo{}
	svc := services.NewWikiService(repo, testLogger())
	h := NewWikiHandler(svc)
	r := setupWikiRouter(h)

	body := `{"title":"Nouveau","slug":"nouveau","category":"test","bodyHtml":"<p>contenu</p>"}`
	req := httptest.NewRequest(http.MethodPost, "/api/v1/wiki/articles", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("status = %d, want %d, body: %s", w.Code, http.StatusCreated, w.Body.String())
	}
}

func TestWiki_CreateArticle_InvalidSlug(t *testing.T) {
	repo := &mockWikiRepo{}
	svc := services.NewWikiService(repo, testLogger())
	h := NewWikiHandler(svc)
	r := setupWikiRouter(h)

	body := `{"title":"Bad","slug":"BAD SLUG!!","bodyHtml":"<p>test</p>"}`
	req := httptest.NewRequest(http.MethodPost, "/api/v1/wiki/articles", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnprocessableEntity {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusUnprocessableEntity)
	}
}

// ---- suppress unused import warnings ----
var _ = gorm.ErrRecordNotFound
