package repository

import (
	"context"

	"github.com/faso-atlas/backend/internal/models"
	"gorm.io/gorm"
)

type FavoriteRepository interface {
	Add(ctx context.Context, fav *models.Favorite) error
	Remove(ctx context.Context, userID uint, targetID uint, targetType models.FavoriteType) error
	ListByUser(ctx context.Context, userID uint, targetType models.FavoriteType, offset, limit int) ([]models.Favorite, int64, error)
	Exists(ctx context.Context, userID uint, targetID uint, targetType models.FavoriteType) (bool, error)
}

type favoriteRepo struct{ db *gorm.DB }

func NewFavoriteRepository(db *gorm.DB) FavoriteRepository { return &favoriteRepo{db: db} }

func (r *favoriteRepo) Add(ctx context.Context, fav *models.Favorite) error {
	return r.db.WithContext(ctx).Create(fav).Error
}

func (r *favoriteRepo) Remove(ctx context.Context, userID uint, targetID uint, targetType models.FavoriteType) error {
	return r.db.WithContext(ctx).
		Where("user_id = ? AND target_id = ? AND target_type = ?", userID, targetID, targetType).
		Delete(&models.Favorite{}).Error
}

func (r *favoriteRepo) ListByUser(ctx context.Context, userID uint, targetType models.FavoriteType, offset, limit int) ([]models.Favorite, int64, error) {
	query := r.db.WithContext(ctx).Model(&models.Favorite{}).Where("user_id = ?", userID)
	if targetType != "" {
		query = query.Where("target_type = ?", targetType)
	}
	var total int64
	query.Count(&total)
	var favorites []models.Favorite
	err := query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&favorites).Error
	return favorites, total, err
}

func (r *favoriteRepo) Exists(ctx context.Context, userID uint, targetID uint, targetType models.FavoriteType) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&models.Favorite{}).
		Where("user_id = ? AND target_id = ? AND target_type = ?", userID, targetID, targetType).
		Count(&count).Error
	return count > 0, err
}
