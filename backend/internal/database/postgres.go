package database

import (
	"log/slog"
	"os"
	"path/filepath"
	"sort"
	"strings"
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
		&models.Favorite{},
	)
	if err != nil {
		slog.Error("AutoMigrate failed", "error", err)
		panic("database migration failed")
	}
	slog.Info("Database migration completed")
}

// RunSQLMigrations reads and executes all .sql files from the given directory
// Files are executed in alphabetical order (001_, 002_, etc.)
func RunSQLMigrations(db *gorm.DB, dir string) error {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return err
	}

	var files []string
	for _, e := range entries {
		if !e.IsDir() && strings.HasSuffix(e.Name(), ".sql") {
			files = append(files, e.Name())
		}
	}
	sort.Strings(files)

	for _, f := range files {
		path := filepath.Join(dir, f)
		content, err := os.ReadFile(path)
		if err != nil {
			slog.Error("Failed to read migration file", "file", f, "error", err)
			return err
		}
		if err := db.Exec(string(content)).Error; err != nil {
			slog.Error("Failed to execute migration", "file", f, "error", err)
			return err
		}
		slog.Info("Executed SQL migration", "file", f)
	}
	return nil
}
