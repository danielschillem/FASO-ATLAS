package repository

import (
	"context"

	"github.com/faso-atlas/backend/internal/models"
	"gorm.io/gorm"
)

type NotificationRepository interface {
	Create(ctx context.Context, notif *models.Notification) error
	ListByUser(ctx context.Context, userID uint, offset, limit int) ([]models.Notification, int64, error)
	UnreadCount(ctx context.Context, userID uint) (int64, error)
	MarkRead(ctx context.Context, id, userID uint) error
	MarkAllRead(ctx context.Context, userID uint) error
}

type notifRepo struct{ db *gorm.DB }

func NewNotificationRepository(db *gorm.DB) NotificationRepository { return &notifRepo{db: db} }

func (r *notifRepo) Create(ctx context.Context, notif *models.Notification) error {
	return r.db.WithContext(ctx).Create(notif).Error
}

func (r *notifRepo) ListByUser(ctx context.Context, userID uint, offset, limit int) ([]models.Notification, int64, error) {
	var notifs []models.Notification
	var total int64
	q := r.db.WithContext(ctx).Model(&models.Notification{}).Where("user_id = ?", userID)
	q.Count(&total)
	err := q.Offset(offset).Limit(limit).Order("created_at DESC").Find(&notifs).Error
	return notifs, total, err
}

func (r *notifRepo) UnreadCount(ctx context.Context, userID uint) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&models.Notification{}).
		Where("user_id = ? AND is_read = ?", userID, false).Count(&count).Error
	return count, err
}

func (r *notifRepo) MarkRead(ctx context.Context, id, userID uint) error {
	return r.db.WithContext(ctx).Model(&models.Notification{}).
		Where("id = ? AND user_id = ?", id, userID).Update("is_read", true).Error
}

func (r *notifRepo) MarkAllRead(ctx context.Context, userID uint) error {
	return r.db.WithContext(ctx).Model(&models.Notification{}).
		Where("user_id = ? AND is_read = ?", userID, false).Update("is_read", true).Error
}
