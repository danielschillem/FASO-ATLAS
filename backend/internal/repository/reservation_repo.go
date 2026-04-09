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
	ListByOwner(ctx context.Context, ownerID uint) ([]models.Reservation, error)
	UpdateStatus(ctx context.Context, id uint, status models.ReservationStatus) error
	UpdatePayment(ctx context.Context, id uint, intentID string, status models.PaymentStatus) error
	Count(ctx context.Context) (int64, error)
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

func (r *resaRepo) ListByOwner(ctx context.Context, ownerID uint) ([]models.Reservation, error) {
	var list []models.Reservation
	err := r.db.WithContext(ctx).
		Preload("Establishment").Preload("Establishment.Place").Preload("User").
		Joins("JOIN establishments ON establishments.id = reservations.establishment_id").
		Where("establishments.owner_id = ?", ownerID).
		Order("reservations.created_at DESC").
		Find(&list).Error
	return list, err
}

func (r *resaRepo) Count(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&models.Reservation{}).Count(&count).Error
	return count, err
}

func (r *resaRepo) UpdatePayment(ctx context.Context, id uint, intentID string, status models.PaymentStatus) error {
	return r.db.WithContext(ctx).Model(&models.Reservation{}).Where("id = ?", id).
		Updates(map[string]interface{}{"payment_intent_id": intentID, "payment_status": status}).Error
}
