package database

import (
	"log"

	"github.com/faso-atlas/backend/internal/config"
	"github.com/faso-atlas/backend/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func ConnectPostgres(cfg *config.Config) *gorm.DB {
	db, err := gorm.Open(postgres.Open(cfg.DatabaseURL), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf("Failed to connect to PostgreSQL: %v", err)
	}
	log.Println("Connected to PostgreSQL")
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
	)
	if err != nil {
		log.Fatalf("AutoMigrate failed: %v", err)
	}
	log.Println("Database migration completed")
}
