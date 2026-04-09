package repository

import (
	"context"

	"github.com/faso-atlas/backend/internal/models"
	"gorm.io/gorm"
)

type SymbolRepository interface {
	List(ctx context.Context) ([]models.Symbol, error)
	GetByID(ctx context.Context, id uint) (*models.Symbol, error)
	Create(ctx context.Context, s *models.Symbol) error
	Update(ctx context.Context, s *models.Symbol) error
	Delete(ctx context.Context, id uint) error
}

type symbolRepo struct{ db *gorm.DB }

func NewSymbolRepository(db *gorm.DB) SymbolRepository { return &symbolRepo{db: db} }

func (r *symbolRepo) List(ctx context.Context) ([]models.Symbol, error) {
	var symbols []models.Symbol
	err := r.db.WithContext(ctx).Order("sort_order ASC").Find(&symbols).Error
	return symbols, err
}

func (r *symbolRepo) GetByID(ctx context.Context, id uint) (*models.Symbol, error) {
	var s models.Symbol
	err := r.db.WithContext(ctx).First(&s, id).Error
	return &s, err
}

func (r *symbolRepo) Create(ctx context.Context, s *models.Symbol) error {
	return r.db.WithContext(ctx).Create(s).Error
}

func (r *symbolRepo) Update(ctx context.Context, s *models.Symbol) error {
	return r.db.WithContext(ctx).Save(s).Error
}

func (r *symbolRepo) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&models.Symbol{}, id).Error
}
