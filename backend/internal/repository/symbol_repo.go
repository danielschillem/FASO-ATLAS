package repository

import (
	"context"

	"github.com/faso-atlas/backend/internal/models"
	"gorm.io/gorm"
)

type SymbolRepository interface {
	List(ctx context.Context) ([]models.Symbol, error)
}

type symbolRepo struct{ db *gorm.DB }

func NewSymbolRepository(db *gorm.DB) SymbolRepository { return &symbolRepo{db: db} }

func (r *symbolRepo) List(ctx context.Context) ([]models.Symbol, error) {
	var symbols []models.Symbol
	err := r.db.WithContext(ctx).Order("sort_order ASC").Find(&symbols).Error
	return symbols, err
}
