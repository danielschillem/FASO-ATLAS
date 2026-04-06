package main

import (
	"log"

	"github.com/faso-atlas/backend/internal/config"
	"github.com/faso-atlas/backend/internal/database"
	"github.com/faso-atlas/backend/internal/router"
)

func main() {
	cfg := config.Load()

	db := database.ConnectPostgres(cfg)
	database.AutoMigrate(db)

	rdb := database.ConnectRedis(cfg)

	r := router.New(db, rdb, cfg)

	log.Printf("Faso Atlas API starting on :%s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
