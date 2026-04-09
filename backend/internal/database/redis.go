package database

import (
	"context"
	"log/slog"

	"github.com/faso-atlas/backend/internal/config"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/redis/go-redis/v9"
)

// redisCollector exposes go-redis pool stats as Prometheus metrics.
type redisCollector struct {
	client     *redis.Client
	totalConns *prometheus.Desc
	idleConns  *prometheus.Desc
	staleConns *prometheus.Desc
	hits       *prometheus.Desc
	misses     *prometheus.Desc
	timeouts   *prometheus.Desc
}

func newRedisCollector(rdb *redis.Client) *redisCollector {
	const ns = "faso_atlas_redis"
	return &redisCollector{
		client:     rdb,
		totalConns: prometheus.NewDesc(ns+"_pool_total_conns", "Total connections in Redis pool", nil, nil),
		idleConns:  prometheus.NewDesc(ns+"_pool_idle_conns", "Idle connections in Redis pool", nil, nil),
		staleConns: prometheus.NewDesc(ns+"_pool_stale_conns", "Stale connections removed from Redis pool", nil, nil),
		hits:       prometheus.NewDesc(ns+"_pool_hits_total", "Redis pool connection hits (reused)", nil, nil),
		misses:     prometheus.NewDesc(ns+"_pool_misses_total", "Redis pool connection misses (new conn)", nil, nil),
		timeouts:   prometheus.NewDesc(ns+"_pool_timeouts_total", "Redis pool wait timeouts", nil, nil),
	}
}

func (c *redisCollector) Describe(ch chan<- *prometheus.Desc) {
	ch <- c.totalConns
	ch <- c.idleConns
	ch <- c.staleConns
	ch <- c.hits
	ch <- c.misses
	ch <- c.timeouts
}

func (c *redisCollector) Collect(ch chan<- prometheus.Metric) {
	stats := c.client.PoolStats()
	ch <- prometheus.MustNewConstMetric(c.totalConns, prometheus.GaugeValue, float64(stats.TotalConns))
	ch <- prometheus.MustNewConstMetric(c.idleConns, prometheus.GaugeValue, float64(stats.IdleConns))
	ch <- prometheus.MustNewConstMetric(c.staleConns, prometheus.GaugeValue, float64(stats.StaleConns))
	ch <- prometheus.MustNewConstMetric(c.hits, prometheus.CounterValue, float64(stats.Hits))
	ch <- prometheus.MustNewConstMetric(c.misses, prometheus.CounterValue, float64(stats.Misses))
	ch <- prometheus.MustNewConstMetric(c.timeouts, prometheus.CounterValue, float64(stats.Timeouts))
}

func ConnectRedis(cfg *config.Config) *redis.Client {
	opt, err := redis.ParseURL(cfg.RedisURL)
	if err != nil {
		slog.Error("Failed to parse Redis URL", "error", err)
		panic("failed to parse Redis URL")
	}

	rdb := redis.NewClient(opt)

	if err := rdb.Ping(context.Background()).Err(); err != nil {
		slog.Error("Failed to connect to Redis", "error", err)
		panic("failed to connect to Redis")
	}
	// Register Redis pool metrics with Prometheus
	if err := prometheus.Register(newRedisCollector(rdb)); err != nil {
		slog.Warn("Redis collector already registered", "error", err)
	}

	slog.Info("Connected to Redis")
	return rdb
}
