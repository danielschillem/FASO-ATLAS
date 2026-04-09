package services

import (
	"context"
	"log/slog"
	"time"

	"github.com/faso-atlas/backend/internal/models"
	"github.com/faso-atlas/backend/internal/repository"
	"github.com/faso-atlas/backend/pkg/apperror"
	"github.com/faso-atlas/backend/pkg/validator"
)

type ReservationService struct {
	reservations   repository.ReservationRepository
	establishments repository.EstablishmentRepository
	logger         *slog.Logger
}

func NewReservationService(r repository.ReservationRepository, e repository.EstablishmentRepository, logger *slog.Logger) *ReservationService {
	return &ReservationService{reservations: r, establishments: e, logger: logger}
}

type CreateReservationInput struct {
	UserID          uint
	EstablishmentID uint
	CheckInDate     string
	CheckOutDate    string
	GuestsCount     int
	SpecialRequests string
}

func (s *ReservationService) Create(ctx context.Context, input CreateReservationInput) (*models.Reservation, *apperror.AppError) {
	checkIn, err := time.Parse("2006-01-02", input.CheckInDate)
	if err != nil {
		return nil, apperror.BadRequest("invalid checkInDate format (YYYY-MM-DD)")
	}

	var checkOut time.Time
	if input.CheckOutDate != "" {
		checkOut, err = time.Parse("2006-01-02", input.CheckOutDate)
		if err != nil {
			return nil, apperror.BadRequest("invalid checkOutDate format (YYYY-MM-DD)")
		}
	}

	if dateErrs := validator.ValidateDateRange(checkIn, checkOut); len(dateErrs) > 0 {
		return nil, apperror.Validation(dateErrs)
	}

	estab, err := s.establishments.GetByID(ctx, input.EstablishmentID)
	if err != nil {
		return nil, apperror.NotFound("establishment")
	}
	if !estab.IsAvailable {
		return nil, apperror.Conflict("establishment is not available")
	}

	guests := input.GuestsCount
	if guests < 1 {
		guests = 1
	}
	if guests > 20 {
		return nil, apperror.BadRequest("maximum 20 guests allowed")
	}

	reservation := models.Reservation{
		UserID:          input.UserID,
		EstablishmentID: input.EstablishmentID,
		CheckInDate:     checkIn,
		GuestsCount:     guests,
		SpecialRequests: validator.SanitizeString(input.SpecialRequests, 500),
		Status:          models.StatusPending,
	}

	if !checkOut.IsZero() {
		reservation.CheckOutDate = &checkOut
		nights := checkOut.Sub(checkIn).Hours() / 24
		reservation.TotalPriceFCFA = int64(nights) * estab.PriceMinFCFA
	}

	if err := s.reservations.Create(ctx, &reservation); err != nil {
		s.logger.ErrorContext(ctx, "failed to create reservation", "error", err)
		return nil, apperror.Internal("failed to create reservation")
	}

	s.logger.InfoContext(ctx, "reservation created", "reservationID", reservation.ID, "userID", input.UserID)
	return &reservation, nil
}

func (s *ReservationService) MyReservations(ctx context.Context, userID uint) ([]models.Reservation, *apperror.AppError) {
	list, err := s.reservations.ListByUser(ctx, userID)
	if err != nil {
		return nil, apperror.Internal("failed to fetch reservations")
	}
	return list, nil
}

func (s *ReservationService) OwnerReservations(ctx context.Context, ownerID uint) ([]models.Reservation, *apperror.AppError) {
	list, err := s.reservations.ListByOwner(ctx, ownerID)
	if err != nil {
		return nil, apperror.Internal("failed to fetch owner reservations")
	}
	return list, nil
}

func (s *ReservationService) Get(ctx context.Context, id, userID uint) (*models.Reservation, *apperror.AppError) {
	r, err := s.reservations.GetByID(ctx, id)
	if err != nil {
		return nil, apperror.NotFound("reservation")
	}
	if r.UserID != userID {
		return nil, apperror.Forbidden("access denied")
	}
	return r, nil
}

func (s *ReservationService) Cancel(ctx context.Context, id, userID uint) (*models.Reservation, *apperror.AppError) {
	r, err := s.reservations.GetByID(ctx, id)
	if err != nil {
		return nil, apperror.NotFound("reservation")
	}
	if r.UserID != userID {
		return nil, apperror.Forbidden("access denied")
	}
	if r.Status == models.StatusCancelled {
		return nil, apperror.Conflict("reservation is already cancelled")
	}
	if err := s.reservations.UpdateStatus(ctx, id, models.StatusCancelled); err != nil {
		return nil, apperror.Internal("failed to cancel reservation")
	}
	r.Status = models.StatusCancelled
	return r, nil
}

func (s *ReservationService) UpdateStatus(ctx context.Context, id uint, status models.ReservationStatus) (*models.Reservation, *apperror.AppError) {
	validStatuses := map[models.ReservationStatus]bool{
		models.StatusPending:   true,
		models.StatusConfirmed: true,
		models.StatusCancelled: true,
		models.StatusCompleted: true,
	}
	if !validStatuses[status] {
		return nil, apperror.BadRequest("invalid status value")
	}

	r, err := s.reservations.GetByID(ctx, id)
	if err != nil {
		return nil, apperror.NotFound("reservation")
	}
	if err := s.reservations.UpdateStatus(ctx, id, status); err != nil {
		return nil, apperror.Internal("failed to update status")
	}
	r.Status = status
	return r, nil
}
