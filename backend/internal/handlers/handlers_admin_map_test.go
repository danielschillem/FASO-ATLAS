package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/faso-atlas/backend/internal/middleware"
	"github.com/faso-atlas/backend/internal/models"
	"github.com/faso-atlas/backend/internal/services"
	"github.com/gin-gonic/gin"
)

// ====================== Admin Handler Tests ======================

func setupAdminRouter(adminH *AdminHandler) *gin.Engine {
	r := gin.New()
	admin := r.Group("/api/v1/admin")
	admin.Use(func(c *gin.Context) {
		c.Set(middleware.UserIDKey, uint(1))
		c.Set(middleware.UserRoleKey, "admin")
		c.Next()
	})
	admin.GET("/users", adminH.ListUsers)
	admin.PUT("/users/:id/role", adminH.UpdateUserRole)
	admin.DELETE("/users/:id", adminH.DeleteUser)
	admin.PUT("/places/:id/active", adminH.TogglePlaceActive)
	admin.PUT("/wiki/:id/approve", adminH.ToggleArticleApproved)
	admin.GET("/stats", adminH.GetStats)
	return r
}

func newAdminHandler(userRepo *mockUserRepo, placeRepo *mockPlaceRepo, wikiRepo *mockWikiRepo) *AdminHandler {
	svc := services.NewAdminService(userRepo, placeRepo, wikiRepo, &mockEstablishmentRepo{}, &mockItineraryRepo{}, &mockReservationRepo{}, testLogger())
	return NewAdminHandler(svc)
}

func TestAdmin_ListUsers(t *testing.T) {
	userRepo := &mockUserRepo{users: []models.User{
		{Base: models.Base{ID: 1}, FirstName: "Alice", Email: "alice@mail.com", Role: models.RoleTourist},
		{Base: models.Base{ID: 2}, FirstName: "Bob", Email: "bob@mail.com", Role: models.RoleAdmin},
	}}
	h := newAdminHandler(userRepo, &mockPlaceRepo{}, &mockWikiRepo{})
	r := setupAdminRouter(h)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/users", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d, body: %s", w.Code, http.StatusOK, w.Body.String())
	}
	var result map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &result)
	if result["total"].(float64) != 2 {
		t.Errorf("total = %v, want 2", result["total"])
	}
}

func TestAdmin_ListUsers_Empty(t *testing.T) {
	h := newAdminHandler(&mockUserRepo{}, &mockPlaceRepo{}, &mockWikiRepo{})
	r := setupAdminRouter(h)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/users", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusOK)
	}
}

func TestAdmin_UpdateUserRole_Success(t *testing.T) {
	userRepo := &mockUserRepo{users: []models.User{
		{Base: models.Base{ID: 1}, FirstName: "Alice", Email: "alice@mail.com", Role: models.RoleTourist},
	}}
	h := newAdminHandler(userRepo, &mockPlaceRepo{}, &mockWikiRepo{})
	r := setupAdminRouter(h)

	body := `{"role":"admin"}`
	req := httptest.NewRequest(http.MethodPut, "/api/v1/admin/users/1/role", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d, body: %s", w.Code, http.StatusOK, w.Body.String())
	}
	var user map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &user)
	if user["role"] != "admin" {
		t.Errorf("role = %v, want admin", user["role"])
	}
}

func TestAdmin_UpdateUserRole_InvalidRole(t *testing.T) {
	userRepo := &mockUserRepo{users: []models.User{
		{Base: models.Base{ID: 1}, FirstName: "Alice", Email: "alice@mail.com", Role: models.RoleTourist},
	}}
	h := newAdminHandler(userRepo, &mockPlaceRepo{}, &mockWikiRepo{})
	r := setupAdminRouter(h)

	body := `{"role":"superadmin"}`
	req := httptest.NewRequest(http.MethodPut, "/api/v1/admin/users/1/role", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}
}

func TestAdmin_UpdateUserRole_NotFound(t *testing.T) {
	h := newAdminHandler(&mockUserRepo{}, &mockPlaceRepo{}, &mockWikiRepo{})
	r := setupAdminRouter(h)

	body := `{"role":"admin"}`
	req := httptest.NewRequest(http.MethodPut, "/api/v1/admin/users/999/role", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusNotFound)
	}
}

func TestAdmin_UpdateUserRole_InvalidID(t *testing.T) {
	h := newAdminHandler(&mockUserRepo{}, &mockPlaceRepo{}, &mockWikiRepo{})
	r := setupAdminRouter(h)

	body := `{"role":"admin"}`
	req := httptest.NewRequest(http.MethodPut, "/api/v1/admin/users/abc/role", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}
}

func TestAdmin_DeleteUser_Success(t *testing.T) {
	userRepo := &mockUserRepo{users: []models.User{
		{Base: models.Base{ID: 1}, FirstName: "Alice", Email: "alice@mail.com"},
	}}
	h := newAdminHandler(userRepo, &mockPlaceRepo{}, &mockWikiRepo{})
	r := setupAdminRouter(h)

	req := httptest.NewRequest(http.MethodDelete, "/api/v1/admin/users/1", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d, body: %s", w.Code, http.StatusOK, w.Body.String())
	}
	var result map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &result)
	if result["message"] != "user deleted" {
		t.Errorf("message = %v", result["message"])
	}
}

func TestAdmin_DeleteUser_InvalidID(t *testing.T) {
	h := newAdminHandler(&mockUserRepo{}, &mockPlaceRepo{}, &mockWikiRepo{})
	r := setupAdminRouter(h)

	req := httptest.NewRequest(http.MethodDelete, "/api/v1/admin/users/notanumber", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}
}

func TestAdmin_TogglePlaceActive(t *testing.T) {
	placeRepo := &mockPlaceRepo{places: []models.Place{
		{Base: models.Base{ID: 1}, Name: "Nazinga", Slug: "nazinga", IsActive: false},
	}}
	h := newAdminHandler(&mockUserRepo{}, placeRepo, &mockWikiRepo{})
	r := setupAdminRouter(h)

	body := `{"active":true}`
	req := httptest.NewRequest(http.MethodPut, "/api/v1/admin/places/1/active", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d, body: %s", w.Code, http.StatusOK, w.Body.String())
	}
}

func TestAdmin_TogglePlaceActive_InvalidID(t *testing.T) {
	h := newAdminHandler(&mockUserRepo{}, &mockPlaceRepo{}, &mockWikiRepo{})
	r := setupAdminRouter(h)

	body := `{"active":true}`
	req := httptest.NewRequest(http.MethodPut, "/api/v1/admin/places/xyz/active", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}
}

func TestAdmin_ToggleArticleApproved(t *testing.T) {
	wikiRepo := &mockWikiRepo{articles: []models.WikiArticle{
		{Base: models.Base{ID: 1}, Slug: "mossi", Title: "Empire Mossi", IsApproved: false},
	}}
	h := newAdminHandler(&mockUserRepo{}, &mockPlaceRepo{}, wikiRepo)
	r := setupAdminRouter(h)

	body := `{"approved":true}`
	req := httptest.NewRequest(http.MethodPut, "/api/v1/admin/wiki/1/approve", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d, body: %s", w.Code, http.StatusOK, w.Body.String())
	}
}

func TestAdmin_GetStats(t *testing.T) {
	userRepo := &mockUserRepo{users: []models.User{
		{Base: models.Base{ID: 1}, FirstName: "Alice", Email: "a@m.com"},
		{Base: models.Base{ID: 2}, FirstName: "Bob", Email: "b@m.com"},
	}}
	placeRepo := &mockPlaceRepo{places: []models.Place{
		{Base: models.Base{ID: 1}, Name: "P1", IsActive: true},
	}}
	wikiRepo := &mockWikiRepo{articles: []models.WikiArticle{
		{Base: models.Base{ID: 1}, Slug: "a1"},
		{Base: models.Base{ID: 2}, Slug: "a2"},
		{Base: models.Base{ID: 3}, Slug: "a3"},
	}}
	h := newAdminHandler(userRepo, placeRepo, wikiRepo)
	r := setupAdminRouter(h)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/stats", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d, body: %s", w.Code, http.StatusOK, w.Body.String())
	}
	var stats map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &stats)
	if stats["totalUsers"].(float64) != 2 {
		t.Errorf("totalUsers = %v, want 2", stats["totalUsers"])
	}
	if stats["totalPlaces"].(float64) != 1 {
		t.Errorf("totalPlaces = %v, want 1", stats["totalPlaces"])
	}
	if stats["totalArticles"].(float64) != 3 {
		t.Errorf("totalArticles = %v, want 3", stats["totalArticles"])
	}
}

// ====================== Map Handler Tests ======================

func setupMapRouter(mapH *MapHandler) *gin.Engine {
	r := gin.New()
	m := r.Group("/api/v1/map")
	m.GET("/places", mapH.GetPlaces)
	m.GET("/places/:id", mapH.GetPlace)
	m.GET("/regions", mapH.GetRegions)
	return r
}

func TestMap_GetPlaces(t *testing.T) {
	repo := &mockMapRepo{
		places: []models.Place{
			{Base: models.Base{ID: 1}, Name: "Nazinga", Slug: "nazinga", Latitude: 11.15, Longitude: -1.59},
			{Base: models.Base{ID: 2}, Name: "Banfora", Slug: "banfora", Latitude: 10.63, Longitude: -4.76},
		},
	}
	svc := services.NewMapService(repo, testLogger())
	h := NewMapHandler(svc)
	r := setupMapRouter(h)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/map/places", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d, body: %s", w.Code, http.StatusOK, w.Body.String())
	}
	var result map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &result)
	if result["type"] != "FeatureCollection" {
		t.Errorf("type = %v, want FeatureCollection", result["type"])
	}
	features := result["features"].([]interface{})
	if len(features) != 2 {
		t.Errorf("features count = %d, want 2", len(features))
	}
}

func TestMap_GetPlace(t *testing.T) {
	repo := &mockMapRepo{
		places: []models.Place{
			{Base: models.Base{ID: 1}, Name: "Nazinga", Slug: "nazinga"},
		},
	}
	svc := services.NewMapService(repo, testLogger())
	h := NewMapHandler(svc)
	r := setupMapRouter(h)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/map/places/1", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusOK)
	}
}

func TestMap_GetPlace_NotFound(t *testing.T) {
	repo := &mockMapRepo{}
	svc := services.NewMapService(repo, testLogger())
	h := NewMapHandler(svc)
	r := setupMapRouter(h)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/map/places/999", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusNotFound)
	}
}

func TestMap_GetPlace_InvalidID(t *testing.T) {
	repo := &mockMapRepo{}
	svc := services.NewMapService(repo, testLogger())
	h := NewMapHandler(svc)
	r := setupMapRouter(h)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/map/places/abc", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}
}

func TestMap_GetRegions(t *testing.T) {
	repo := &mockMapRepo{
		regions: []models.Region{
			{Base: models.Base{ID: 1}, Name: "Centre"},
			{Base: models.Base{ID: 2}, Name: "Hauts-Bassins"},
		},
	}
	svc := services.NewMapService(repo, testLogger())
	h := NewMapHandler(svc)
	r := setupMapRouter(h)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/map/regions", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusOK)
	}
	var regions []map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &regions)
	if len(regions) != 2 {
		t.Errorf("regions count = %d, want 2", len(regions))
	}
}

func TestMap_GetRegions_Empty(t *testing.T) {
	repo := &mockMapRepo{}
	svc := services.NewMapService(repo, testLogger())
	h := NewMapHandler(svc)
	r := setupMapRouter(h)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/map/regions", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusOK)
	}
}
