package repository

import (
	"context"

	"github.com/faso-atlas/backend/internal/models"
	"gorm.io/gorm"
)

type ReservationRepository interface {
	Create(ctx context.Context, r *models.Reservation) error
	GetByID(ctx context.Context, id uint) (*models.Reservation, error)
	ListByUser(ctx context.Context, userID uint) ([]models.Reservation, error)
	UpdateStatus(ctx context.Context, id uint, status models.ReservationStatus) error
}

type resaRepo struct{ db *gorm.DB }

func NewReservationRepository(db *gorm.DB) ReservationRepository { return &resaRepo{db: db} }

func (r *resaRepo) Create(ctx context.Context, res *models.Reservation) error {
	return r.db.WithContext(ctx).Create(res).Error
}

func (r *resaRepo) GetByID(ctx context.Context, id uint) (*models.Reservation, error) {
	var res models.Reservation
	err := r.db.WithContext(ctx).Preload("Establishment").Preload("Establishment.Place").
		First(&res, id).Error
	return &res, err
}

func (r *resaRepo) ListByUser(ctx context.Context, userID uint) ([]models.Reservation, error) {
	var list []models.Reservation
	err := r.db.WithContext(ctx).Preload("Establishment").Preload("Establishment.Place").
		Where("user_id = ?", userID).Order("created_at DESC").Find(&list).Error
	return list, err
}

func (r *resaRepo) UpdateStatus(ctx context.Context, id uint, status models.ReservationStatus) error {
	return r.db.WithContext(ctx).Model(&models.Reservation{}).Where("id = ?", id).Update("status", status).Error
}
