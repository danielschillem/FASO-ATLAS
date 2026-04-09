package services

import (
	"context"
	"log/slog"

	"github.com/faso-atlas/backend/internal/models"
	"github.com/faso-atlas/backend/internal/repository"
	"github.com/faso-atlas/backend/pkg/apperror"
)

type NotificationService struct {
	notifs repository.NotificationRepository
	logger *slog.Logger
}

func NewNotificationService(notifs repository.NotificationRepository, logger *slog.Logger) *NotificationService {
	return &NotificationService{notifs: notifs, logger: logger}
}

func (s *NotificationService) Create(ctx context.Context, userID uint, ntype models.NotificationType, title, body string, data models.JSONMap) error {
	notif := models.Notification{
		UserID: userID,
		Type:   ntype,
		Title:  title,
		Body:   body,
		Data:   data,
	}
	if err := s.notifs.Create(ctx, &notif); err != nil {
		s.logger.ErrorContext(ctx, "failed to create notification", "error", err)
		return err
	}
	return nil
}

func (s *NotificationService) List(ctx context.Context, userID uint, offset, limit int) ([]models.Notification, int64, *apperror.AppError) {
	notifs, total, err := s.notifs.ListByUser(ctx, userID, offset, limit)
	if err != nil {
		return nil, 0, apperror.Internal("failed to fetch notifications")
	}
	return notifs, total, nil
}

func (s *NotificationService) UnreadCount(ctx context.Context, userID uint) (int64, *apperror.AppError) {
	count, err := s.notifs.UnreadCount(ctx, userID)
	if err != nil {
		return 0, apperror.Internal("failed to count notifications")
	}
	return count, nil
}

func (s *NotificationService) MarkRead(ctx context.Context, id, userID uint) *apperror.AppError {
	if err := s.notifs.MarkRead(ctx, id, userID); err != nil {
		return apperror.Internal("failed to mark notification read")
	}
	return nil
}

func (s *NotificationService) MarkAllRead(ctx context.Context, userID uint) *apperror.AppError {
	if err := s.notifs.MarkAllRead(ctx, userID); err != nil {
		return apperror.Internal("failed to mark all notifications read")
	}
	return nil
}

// NotifyReservationConfirmed sends a notification for a confirmed reservation.
func (s *NotificationService) NotifyReservationConfirmed(ctx context.Context, userID uint, placeName string, reservationID uint) {
	_ = s.Create(ctx, userID, models.NotifReservationConfirmed,
		"Réservation confirmée",
		"Votre réservation à "+placeName+" a été confirmée.",
		models.JSONMap{"reservationId": reservationID},
	)
}

// NotifyReservationCancelled sends a notification for a cancelled reservation.
func (s *NotificationService) NotifyReservationCancelled(ctx context.Context, userID uint, placeName string, reservationID uint) {
	_ = s.Create(ctx, userID, models.NotifReservationCancelled,
		"Réservation annulée",
		"Votre réservation à "+placeName+" a été annulée.",
		models.JSONMap{"reservationId": reservationID},
	)
}

// NotifyDepartureReminder sends a departure reminder.
func (s *NotificationService) NotifyDepartureReminder(ctx context.Context, userID uint, placeName, checkIn string, reservationID uint) {
	_ = s.Create(ctx, userID, models.NotifDepartureReminder,
		"Rappel de départ",
		"Votre séjour à "+placeName+" commence le "+checkIn+". Bon voyage !",
		models.JSONMap{"reservationId": reservationID},
	)
}

// NotifyNewReview notifies an owner about a new review.
func (s *NotificationService) NotifyNewReview(ctx context.Context, ownerID uint, placeName string, rating int) {
	_ = s.Create(ctx, ownerID, models.NotifNewReview,
		"Nouvel avis",
		"Un voyageur a laissé un avis sur "+placeName+".",
		models.JSONMap{"rating": rating},
	)
}
