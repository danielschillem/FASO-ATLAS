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
	pkgjwt "github.com/faso-atlas/backend/pkg/jwt"
	"github.com/gin-gonic/gin"
)

func init() {
	gin.SetMode(gin.TestMode)
}

// --- Auth handler integration tests using real AuthService with mock repos ---

func setupAuthRouter(authH *AuthHandler, jwtManager *pkgjwt.Manager) *gin.Engine {
	r := gin.New()
	auth := r.Group("/api/v1/auth")
	auth.POST("/register", authH.Register)
	auth.POST("/login", authH.Login)
	auth.POST("/refresh", authH.Refresh)
	auth.GET("/me", middleware.Auth(jwtManager), authH.Me)
	return r
}

func TestRegister_Success(t *testing.T) {
	userRepo := &mockUserRepo{}
	tokenRepo := &mockTokenRepo{}
	jwtManager := pkgjwt.NewManager("test-secret")
	authSvc := services.NewAuthService(userRepo, tokenRepo, jwtManager, nil, testLogger())
	authH := NewAuthHandler(authSvc)
	r := setupAuthRouter(authH, jwtManager)

	body := `{"email":"test@example.com","password":"MyP@ssw0rd!","firstName":"John"}`
	req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("status = %d, want %d, body: %s", w.Code, http.StatusCreated, w.Body.String())
	}

	var result map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &result)
	if result["accessToken"] == nil || result["accessToken"] == "" {
		t.Error("expected accessToken in response")
	}
	if result["user"] == nil {
		t.Error("expected user in response")
	}
}

func TestRegister_WeakPassword(t *testing.T) {
	userRepo := &mockUserRepo{}
	tokenRepo := &mockTokenRepo{}
	jwtManager := pkgjwt.NewManager("test-secret")
	authSvc := services.NewAuthService(userRepo, tokenRepo, jwtManager, nil, testLogger())
	authH := NewAuthHandler(authSvc)
	r := setupAuthRouter(authH, jwtManager)

	body := `{"email":"test@example.com","password":"weak","firstName":"John"}`
	req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnprocessableEntity {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusUnprocessableEntity)
	}
}

func TestRegister_MissingEmail(t *testing.T) {
	userRepo := &mockUserRepo{}
	tokenRepo := &mockTokenRepo{}
	jwtManager := pkgjwt.NewManager("test-secret")
	authSvc := services.NewAuthService(userRepo, tokenRepo, jwtManager, nil, testLogger())
	authH := NewAuthHandler(authSvc)
	r := setupAuthRouter(authH, jwtManager)

	body := `{"password":"MyP@ssw0rd!","firstName":"John"}`
	req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}
}

func TestLogin_Success(t *testing.T) {
	userRepo := &mockUserRepo{}
	tokenRepo := &mockTokenRepo{}
	jwtManager := pkgjwt.NewManager("test-secret")
	authSvc := services.NewAuthService(userRepo, tokenRepo, jwtManager, nil, testLogger())
	authH := NewAuthHandler(authSvc)
	r := setupAuthRouter(authH, jwtManager)

	// First register
	regBody := `{"email":"login@example.com","password":"MyP@ssw0rd!","firstName":"Test"}`
	regReq := httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", bytes.NewBufferString(regBody))
	regReq.Header.Set("Content-Type", "application/json")
	regW := httptest.NewRecorder()
	r.ServeHTTP(regW, regReq)

	if regW.Code != http.StatusCreated {
		t.Fatalf("register failed: %d %s", regW.Code, regW.Body.String())
	}

	// Then login
	loginBody := `{"email":"login@example.com","password":"MyP@ssw0rd!"}`
	loginReq := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewBufferString(loginBody))
	loginReq.Header.Set("Content-Type", "application/json")
	loginW := httptest.NewRecorder()
	r.ServeHTTP(loginW, loginReq)

	if loginW.Code != http.StatusOK {
		t.Fatalf("login status = %d, want %d, body: %s", loginW.Code, http.StatusOK, loginW.Body.String())
	}

	var result map[string]interface{}
	json.Unmarshal(loginW.Body.Bytes(), &result)
	if result["accessToken"] == nil {
		t.Error("expected accessToken")
	}
	if result["refreshToken"] == nil {
		t.Error("expected refreshToken")
	}
}

func TestLogin_InvalidCredentials(t *testing.T) {
	userRepo := &mockUserRepo{}
	tokenRepo := &mockTokenRepo{}
	jwtManager := pkgjwt.NewManager("test-secret")
	authSvc := services.NewAuthService(userRepo, tokenRepo, jwtManager, nil, testLogger())
	authH := NewAuthHandler(authSvc)
	r := setupAuthRouter(authH, jwtManager)

	body := `{"email":"nobody@example.com","password":"MyP@ssw0rd!"}`
	req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusUnauthorized)
	}
}

func TestMe_Authenticated(t *testing.T) {
	userRepo := &mockUserRepo{}
	tokenRepo := &mockTokenRepo{}
	jwtManager := pkgjwt.NewManager("test-secret")
	authSvc := services.NewAuthService(userRepo, tokenRepo, jwtManager, nil, testLogger())
	authH := NewAuthHandler(authSvc)
	r := setupAuthRouter(authH, jwtManager)

	// Register first
	regBody := `{"email":"me@example.com","password":"MyP@ssw0rd!","firstName":"Me"}`
	regReq := httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", bytes.NewBufferString(regBody))
	regReq.Header.Set("Content-Type", "application/json")
	regW := httptest.NewRecorder()
	r.ServeHTTP(regW, regReq)

	var regResult map[string]interface{}
	json.Unmarshal(regW.Body.Bytes(), &regResult)
	accessToken := regResult["accessToken"].(string)

	// Call /me
	meReq := httptest.NewRequest(http.MethodGet, "/api/v1/auth/me", nil)
	meReq.Header.Set("Authorization", "Bearer "+accessToken)
	meW := httptest.NewRecorder()
	r.ServeHTTP(meW, meReq)

	if meW.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d, body: %s", meW.Code, http.StatusOK, meW.Body.String())
	}
}

func TestMe_Unauthenticated(t *testing.T) {
	userRepo := &mockUserRepo{}
	tokenRepo := &mockTokenRepo{}
	jwtManager := pkgjwt.NewManager("test-secret")
	authSvc := services.NewAuthService(userRepo, tokenRepo, jwtManager, nil, testLogger())
	authH := NewAuthHandler(authSvc)
	r := setupAuthRouter(authH, jwtManager)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/me", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusUnauthorized)
	}
}

// --- Destination handler tests with mock PlaceRepository ---

func setupDestinationRouter(destH *DestinationHandler) *gin.Engine {
	r := gin.New()
	dest := r.Group("/api/v1/destinations")
	dest.GET("/", destH.List)
	dest.GET("/:slug", destH.Get)
	return r
}

func TestDestinations_List(t *testing.T) {
	places := &mockPlaceRepo{
		places: []models.Place{
			{Base: models.Base{ID: 1}, Name: "Nazinga", Slug: "nazinga", Type: models.PlaceNature, IsActive: true},
			{Base: models.Base{ID: 2}, Name: "Banfora", Slug: "banfora", Type: models.PlaceSite, IsActive: true},
		},
	}
	destH := NewDestinationHandler(places)
	r := setupDestinationRouter(destH)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/destinations/", nil)
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

func TestDestinations_GetBySlug(t *testing.T) {
	places := &mockPlaceRepo{
		places: []models.Place{
			{Base: models.Base{ID: 1}, Name: "Nazinga", Slug: "nazinga", Type: models.PlaceNature, IsActive: true},
		},
	}
	destH := NewDestinationHandler(places)
	r := setupDestinationRouter(destH)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/destinations/nazinga", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusOK)
	}

	var result map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &result)
	if result["name"] != "Nazinga" {
		t.Errorf("name = %v, want Nazinga", result["name"])
	}
}

func TestDestinations_GetNotFound(t *testing.T) {
	places := &mockPlaceRepo{places: []models.Place{}}
	destH := NewDestinationHandler(places)
	r := setupDestinationRouter(destH)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/destinations/nonexistent", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusNotFound)
	}
}
