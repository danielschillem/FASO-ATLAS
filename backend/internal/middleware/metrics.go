package middleware

import (
	"strconv"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus"
)

var (
	metricsOnce sync.Once

	httpRequestsTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "faso_atlas_http_requests_total",
			Help: "Total number of HTTP requests.",
		},
		[]string{"method", "route", "status"},
	)

	httpRequestDuration = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "faso_atlas_http_request_duration_seconds",
			Help:    "Duration of HTTP requests in seconds.",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "route", "status"},
	)

	httpRequestsInFlight = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: "faso_atlas_http_requests_in_flight",
			Help: "Number of in-flight HTTP requests.",
		},
	)
)

func initMetrics() {
	metricsOnce.Do(func() {
		prometheus.MustRegister(httpRequestsTotal, httpRequestDuration, httpRequestsInFlight)
	})
}

// PrometheusMetrics exposes generic HTTP metrics for the API.
func PrometheusMetrics() gin.HandlerFunc {
	initMetrics()

	return func(c *gin.Context) {
		if c.FullPath() == "/metrics" {
			c.Next()
			return
		}

		httpRequestsInFlight.Inc()
		start := time.Now()
		c.Next()
		httpRequestsInFlight.Dec()

		route := c.FullPath()
		if route == "" {
			route = "unmatched"
		}

		status := strconv.Itoa(c.Writer.Status())
		method := c.Request.Method
		duration := time.Since(start).Seconds()

		httpRequestsTotal.WithLabelValues(method, route, status).Inc()
		httpRequestDuration.WithLabelValues(method, route, status).Observe(duration)
	}
}
