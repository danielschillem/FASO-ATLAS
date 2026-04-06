package database

import (
	"context"
	"log/slog"

	"github.com/faso-atlas/backend/internal/config"
	"github.com/redis/go-redis/v9"
)

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
	slog.Info("Connected to Redis")
	return rdb
}
