package router

import (
	"context"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func buildReadinessResponse(ctx context.Context, pingPostgres func(context.Context) error, pingRedis func(context.Context) error) (int, gin.H) {
	checks := gin.H{}
	overallStatus := http.StatusOK

	if err := pingPostgres(ctx); err != nil {
		overallStatus = http.StatusServiceUnavailable
		checks["postgres"] = gin.H{"status": "error", "error": err.Error()}
	} else {
		checks["postgres"] = gin.H{"status": "ok"}
	}

	if err := pingRedis(ctx); err != nil {
		overallStatus = http.StatusServiceUnavailable
		checks["redis"] = gin.H{"status": "error", "error": err.Error()}
	} else {
		checks["redis"] = gin.H{"status": "ok"}
	}

	if overallStatus != http.StatusOK {
		return overallStatus, gin.H{"status": "not_ready", "checks": checks}
	}

	return http.StatusOK, gin.H{"status": "ready", "checks": checks}
}

func registerSystemRoutes(r *gin.Engine, pingPostgres func(context.Context) error, pingRedis func(context.Context) error) {
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "faso-atlas-api"})
	})

	r.GET("/ready", func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c.Request.Context(), systemCheckTimeout)
		defer cancel()

		status, payload := buildReadinessResponse(ctx, pingPostgres, pingRedis)
		c.JSON(status, payload)
	})

	r.GET("/metrics", gin.WrapH(promhttp.Handler()))
	r.GET("/openapi.yaml", func(c *gin.Context) {
		c.File("./openapi/openapi.yaml")
	})
	r.GET("/docs", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"name":    "Faso Atlas API contract",
			"openapi": "/openapi.yaml",
		})
	})
	r.GET("/version", func(c *gin.Context) {
		version := os.Getenv("APP_VERSION")
		if version == "" {
			version = "dev"
		}

		commit := os.Getenv("APP_COMMIT")
		if commit == "" {
			commit = "unknown"
		}

		buildDate := os.Getenv("APP_BUILD_DATE")
		if buildDate == "" {
			buildDate = "unknown"
		}

		c.JSON(http.StatusOK, gin.H{
			"service":   "faso-atlas-api",
			"version":   version,
			"commit":    commit,
			"buildDate": buildDate,
		})
	})
}