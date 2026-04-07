package main

import (
	"flag"
	"log/slog"
	"os"

	"github.com/faso-atlas/backend/internal/config"
	"github.com/faso-atlas/backend/internal/database"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
	slog.SetDefault(logger)

	dir := flag.String("dir", "migrations", "Directory containing SQL migration files")
	flag.Parse()

	cfg := config.Load()
	db := database.ConnectPostgres(cfg)

	logger.Info("Running SQL migrations", "dir", *dir)
	if err := database.RunSQLMigrations(db, *dir); err != nil {
		logger.Error("Seed failed", "error", err)
		os.Exit(1)
	}
	logger.Info("All SQL migrations executed successfully")
}
