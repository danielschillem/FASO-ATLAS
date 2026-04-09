package router

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestBuildReadinessResponse_Ready(t *testing.T) {
	status, payload := buildReadinessResponse(
		context.Background(),
		func(context.Context) error { return nil },
		func(context.Context) error { return nil },
	)

	if status != http.StatusOK {
		t.Fatalf("status = %d, want %d", status, http.StatusOK)
	}

	if payload["status"] != "ready" {
		t.Fatalf("payload status = %v, want ready", payload["status"])
	}
}

func TestBuildReadinessResponse_NotReady(t *testing.T) {
	status, payload := buildReadinessResponse(
		context.Background(),
		func(context.Context) error { return errors.New("postgres down") },
		func(context.Context) error { return nil },
	)

	if status != http.StatusServiceUnavailable {
		t.Fatalf("status = %d, want %d", status, http.StatusServiceUnavailable)
	}

	if payload["status"] != "not_ready" {
		t.Fatalf("payload status = %v, want not_ready", payload["status"])
	}
}

func TestRegisterSystemRoutes_DocsAndOpenAPI(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	originalVersion := os.Getenv("APP_VERSION")
	originalCommit := os.Getenv("APP_COMMIT")
	originalBuildDate := os.Getenv("APP_BUILD_DATE")
	defer func() {
		_ = os.Setenv("APP_VERSION", originalVersion)
		_ = os.Setenv("APP_COMMIT", originalCommit)
		_ = os.Setenv("APP_BUILD_DATE", originalBuildDate)
	}()

	_ = os.Setenv("APP_VERSION", "1.1.0")
	_ = os.Setenv("APP_COMMIT", "abc1234")
	_ = os.Setenv("APP_BUILD_DATE", "2026-04-08")

	backendDir, err := filepath.Abs(filepath.Join("..", ".."))
	if err != nil {
		t.Fatalf("resolve backend dir: %v", err)
	}

	originalWD, err := os.Getwd()
	if err != nil {
		t.Fatalf("getwd: %v", err)
	}
	defer func() { _ = os.Chdir(originalWD) }()

	if err := os.Chdir(backendDir); err != nil {
		t.Fatalf("chdir backend dir: %v", err)
	}

	registerSystemRoutes(
		r,
		func(context.Context) error { return nil },
		func(context.Context) error { return nil },
	)

	docsReq := httptest.NewRequest(http.MethodGet, "/docs", nil)
	docsW := httptest.NewRecorder()
	r.ServeHTTP(docsW, docsReq)

	if docsW.Code != http.StatusOK {
		t.Fatalf("/docs status = %d, want %d", docsW.Code, http.StatusOK)
	}
	if !strings.Contains(docsW.Body.String(), "/openapi.yaml") {
		t.Fatalf("/docs body does not reference openapi.yaml: %s", docsW.Body.String())
	}

	openapiReq := httptest.NewRequest(http.MethodGet, "/openapi.yaml", nil)
	openapiW := httptest.NewRecorder()
	r.ServeHTTP(openapiW, openapiReq)

	if openapiW.Code != http.StatusOK {
		t.Fatalf("/openapi.yaml status = %d, want %d", openapiW.Code, http.StatusOK)
	}
	if !strings.Contains(openapiW.Body.String(), "openapi: 3.0.3") {
		t.Fatalf("/openapi.yaml body does not look like an OpenAPI document")
	}

	versionReq := httptest.NewRequest(http.MethodGet, "/version", nil)
	versionW := httptest.NewRecorder()
	r.ServeHTTP(versionW, versionReq)

	if versionW.Code != http.StatusOK {
		t.Fatalf("/version status = %d, want %d", versionW.Code, http.StatusOK)
	}
	if !strings.Contains(versionW.Body.String(), "\"version\":\"1.1.0\"") {
		t.Fatalf("/version body does not expose APP_VERSION: %s", versionW.Body.String())
	}
}
