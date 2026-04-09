package middleware

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	pkgjwt "github.com/faso-atlas/backend/pkg/jwt"
	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func init() {
	gin.SetMode(gin.TestMode)
}

func setupRouter(jwtManager *pkgjwt.Manager) *gin.Engine {
	r := gin.New()
	r.Use(Auth(jwtManager))
	r.GET("/protected", func(c *gin.Context) {
		userID := c.GetUint(UserIDKey)
		role, _ := c.Get(UserRoleKey)
		c.JSON(200, gin.H{"userId": userID, "role": role})
	})
	return r
}

func TestAuth_ValidToken(t *testing.T) {
	m := pkgjwt.NewManager("test-secret")
	r := setupRouter(m)

	token, _ := m.GenerateAccessToken(42, "tourist")

	req := httptest.NewRequest(http.MethodGet, "/protected", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Fatalf("status = %d, want 200", w.Code)
	}

	var body map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &body)

	if uint(body["userId"].(float64)) != 42 {
		t.Errorf("userId = %v, want 42", body["userId"])
	}
	if body["role"] != "tourist" {
		t.Errorf("role = %v, want tourist", body["role"])
	}
}

func TestAuth_MissingHeader(t *testing.T) {
	m := pkgjwt.NewManager("test-secret")
	r := setupRouter(m)

	req := httptest.NewRequest(http.MethodGet, "/protected", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != 401 {
		t.Fatalf("status = %d, want 401", w.Code)
	}
}

func TestAuth_InvalidFormat(t *testing.T) {
	m := pkgjwt.NewManager("test-secret")
	r := setupRouter(m)

	req := httptest.NewRequest(http.MethodGet, "/protected", nil)
	req.Header.Set("Authorization", "Token abc")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != 401 {
		t.Fatalf("status = %d, want 401", w.Code)
	}
}

func TestAuth_InvalidToken(t *testing.T) {
	m := pkgjwt.NewManager("test-secret")
	r := setupRouter(m)

	req := httptest.NewRequest(http.MethodGet, "/protected", nil)
	req.Header.Set("Authorization", "Bearer invalid.token.here")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != 401 {
		t.Fatalf("status = %d, want 401", w.Code)
	}
}

func TestRequireRole_Allowed(t *testing.T) {
	m := pkgjwt.NewManager("test-secret")

	r := gin.New()
	r.Use(Auth(m))
	r.GET("/admin", RequireRole("admin"), func(c *gin.Context) {
		c.JSON(200, gin.H{"ok": true})
	})

	token, _ := m.GenerateAccessToken(1, "admin")

	req := httptest.NewRequest(http.MethodGet, "/admin", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Fatalf("status = %d, want 200", w.Code)
	}
}

func TestRequireRole_Denied(t *testing.T) {
	m := pkgjwt.NewManager("test-secret")

	r := gin.New()
	r.Use(Auth(m))
	r.GET("/admin", RequireRole("admin"), func(c *gin.Context) {
		c.JSON(200, gin.H{"ok": true})
	})

	token, _ := m.GenerateAccessToken(1, "tourist")

	req := httptest.NewRequest(http.MethodGet, "/admin", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != 403 {
		t.Fatalf("status = %d, want 403", w.Code)
	}
}

func TestRequireRole_MultipleRoles(t *testing.T) {
	m := pkgjwt.NewManager("test-secret")

	r := gin.New()
	r.Use(Auth(m))
	r.GET("/manage", RequireRole("owner", "admin"), func(c *gin.Context) {
		c.JSON(200, gin.H{"ok": true})
	})

	token, _ := m.GenerateAccessToken(1, "owner")

	req := httptest.NewRequest(http.MethodGet, "/manage", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Fatalf("status = %d, want 200 for owner", w.Code)
	}
}

func TestRequestID(t *testing.T) {
	r := gin.New()
	r.Use(RequestID())
	r.GET("/test", func(c *gin.Context) {
		c.JSON(200, gin.H{"ok": true})
	})

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	rid := w.Header().Get("X-Request-ID")
	if rid == "" {
		t.Fatal("expected X-Request-ID header")
	}
	if len(rid) < 30 {
		t.Errorf("X-Request-ID looks too short: %q", rid)
	}
}

func TestRecovery_PanicHandled(t *testing.T) {
	r := gin.New()
	r.Use(RequestID())
	r.Use(Recovery())
	r.GET("/panic", func(c *gin.Context) {
		panic("test panic")
	})

	req := httptest.NewRequest(http.MethodGet, "/panic", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != 500 {
		t.Fatalf("status = %d, want 500", w.Code)
	}

	var body map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &body)
	if body["code"] != "INTERNAL_ERROR" {
		t.Errorf("code = %v, want INTERNAL_ERROR", body["code"])
	}
}

func TestPrometheusMetrics_CollectsApplicationRequests(t *testing.T) {
	r := gin.New()
	r.Use(PrometheusMetrics())
	r.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"ok": true})
	})
	r.GET("/metrics", gin.WrapH(promhttp.Handler()))

	appReq := httptest.NewRequest(http.MethodGet, "/test", nil)
	appW := httptest.NewRecorder()
	r.ServeHTTP(appW, appReq)

	metricsReq := httptest.NewRequest(http.MethodGet, "/metrics", nil)
	metricsW := httptest.NewRecorder()
	r.ServeHTTP(metricsW, metricsReq)

	if metricsW.Code != http.StatusOK {
		t.Fatalf("metrics status = %d, want 200", metricsW.Code)
	}

	body := metricsW.Body.String()
	if !strings.Contains(body, "faso_atlas_http_requests_total") {
		t.Fatal("expected custom request counter in metrics output")
	}
	if !strings.Contains(body, "route=\"/test\"") {
		t.Fatal("expected /test route label in metrics output")
	}
	if strings.Contains(body, "route=\"/metrics\"") {
		t.Fatal("/metrics endpoint should not be instrumented as an application route")
	}
}
