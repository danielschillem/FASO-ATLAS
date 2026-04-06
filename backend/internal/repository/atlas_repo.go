package repository

import (
	"context"

	"github.com/faso-atlas/backend/internal/models"
	"gorm.io/gorm"
)

type AtlasRepository interface {
	ListEvents(ctx context.Context, era string) ([]models.AtlasEvent, error)
}

type atlasRepo struct{ db *gorm.DB }

func NewAtlasRepository(db *gorm.DB) AtlasRepository { return &atlasRepo{db: db} }

func (r *atlasRepo) ListEvents(ctx context.Context, era string) ([]models.AtlasEvent, error) {
	query := r.db.WithContext(ctx).Model(&models.AtlasEvent{}).Order("sort_order ASC, year ASC")
	if era != "" {
		query = query.Where("era = ?", era)
	}
	var events []models.AtlasEvent
	err := query.Find(&events).Error
	return events, err
}
