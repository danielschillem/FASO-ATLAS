package database

import (
	"log/slog"
	"time"

	"github.com/faso-atlas/backend/internal/config"
	"github.com/faso-atlas/backend/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func ConnectPostgres(cfg *config.Config) *gorm.DB {
	logLevel := logger.Info
	if cfg.Environment == "production" {
		logLevel = logger.Warn
	}

	db, err := gorm.Open(postgres.Open(cfg.DatabaseURL), &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
	})
	if err != nil {
		slog.Error("Failed to connect to PostgreSQL", "error", err)
		panic("failed to connect to database")
	}

	sqlDB, err := db.DB()
	if err != nil {
		slog.Error("Failed to get underlying sql.DB", "error", err)
		panic("failed to get sql.DB")
	}

	// Connection pool settings
	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetConnMaxLifetime(30 * time.Minute)
	sqlDB.SetConnMaxIdleTime(5 * time.Minute)

	slog.Info("Connected to PostgreSQL")
	return db
}

func AutoMigrate(db *gorm.DB) {
	err := db.AutoMigrate(
		&models.User{},
		&models.Region{},
		&models.Place{},
		&models.PlaceImage{},
		&models.Establishment{},
		&models.Itinerary{},
		&models.ItineraryStop{},
		&models.Reservation{},
		&models.AtlasEvent{},
		&models.WikiArticle{},
		&models.WikiRevision{},
		&models.Symbol{},
		&models.Review{},
		&models.RefreshToken{},
		&models.VerificationToken{},
	)
	if err != nil {
		slog.Error("AutoMigrate failed", "error", err)
		panic("database migration failed")
	}
	slog.Info("Database migration completed")
}
