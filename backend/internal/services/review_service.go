package services

import (
	"context"
	"log/slog"

	"github.com/faso-atlas/backend/internal/models"
	"github.com/faso-atlas/backend/internal/repository"
	"github.com/faso-atlas/backend/pkg/apperror"
	"github.com/faso-atlas/backend/pkg/validator"
)

type ReviewService struct {
	reviews repository.ReviewRepository
	places  repository.PlaceRepository
	logger  *slog.Logger
}

func NewReviewService(reviews repository.ReviewRepository, places repository.PlaceRepository, logger *slog.Logger) *ReviewService {
	return &ReviewService{reviews: reviews, places: places, logger: logger}
}

type CreateReviewInput struct {
	UserID          uint
	PlaceID         *uint
	EstablishmentID *uint
	Rating          int
	Comment         string
}

func (s *ReviewService) Create(ctx context.Context, input CreateReviewInput) (*models.Review, *apperror.AppError) {
	if input.PlaceID == nil && input.EstablishmentID == nil {
		return nil, apperror.BadRequest("placeId or establishmentId is required")
	}
	if input.Rating < 1 || input.Rating > 5 {
		return nil, apperror.BadRequest("rating must be between 1 and 5")
	}

	review := models.Review{
		UserID:          input.UserID,
		PlaceID:         input.PlaceID,
		EstablishmentID: input.EstablishmentID,
		Rating:          input.Rating,
		Comment:         validator.SanitizeString(input.Comment, 2000),
	}

	if err := s.reviews.Create(ctx, &review); err != nil {
		s.logger.ErrorContext(ctx, "failed to create review", "error", err)
		return nil, apperror.Internal("failed to create review")
	}

	// Update average rating on place
	if input.PlaceID != nil {
		s.updatePlaceRating(ctx, *input.PlaceID)
	}

	s.logger.InfoContext(ctx, "review created", "reviewID", review.ID, "userID", input.UserID)
	return &review, nil
}

func (s *ReviewService) ListByPlace(ctx context.Context, placeID uint, offset, limit int) ([]models.Review, int64, *apperror.AppError) {
	reviews, total, err := s.reviews.ListByPlace(ctx, placeID, offset, limit)
	if err != nil {
		return nil, 0, apperror.Internal("failed to fetch reviews")
	}
	return reviews, total, nil
}

func (s *ReviewService) ListByEstablishment(ctx context.Context, estabID uint, offset, limit int) ([]models.Review, int64, *apperror.AppError) {
	reviews, total, err := s.reviews.ListByEstablishment(ctx, estabID, offset, limit)
	if err != nil {
		return nil, 0, apperror.Internal("failed to fetch reviews")
	}
	return reviews, total, nil
}

func (s *ReviewService) Update(ctx context.Context, id, userID uint, rating int, comment string) (*models.Review, *apperror.AppError) {
	review, err := s.reviews.GetByID(ctx, id)
	if err != nil {
		return nil, apperror.NotFound("review")
	}
	if review.UserID != userID {
		return nil, apperror.Forbidden("access denied")
	}
	if rating < 1 || rating > 5 {
		return nil, apperror.BadRequest("rating must be between 1 and 5")
	}

	review.Rating = rating
	review.Comment = validator.SanitizeString(comment, 2000)
	if err := s.reviews.Update(ctx, review); err != nil {
		return nil, apperror.Internal("failed to update review")
	}

	if review.PlaceID != nil {
		s.updatePlaceRating(ctx, *review.PlaceID)
	}

	return review, nil
}

func (s *ReviewService) Delete(ctx context.Context, id, userID uint, isAdmin bool) *apperror.AppError {
	review, err := s.reviews.GetByID(ctx, id)
	if err != nil {
		return apperror.NotFound("review")
	}
	if review.UserID != userID && !isAdmin {
		return apperror.Forbidden("access denied")
	}

	placeID := review.PlaceID
	if err := s.reviews.Delete(ctx, id); err != nil {
		return apperror.Internal("failed to delete review")
	}

	if placeID != nil {
		s.updatePlaceRating(ctx, *placeID)
	}
	return nil
}

func (s *ReviewService) updatePlaceRating(ctx context.Context, placeID uint) {
	avg, count, err := s.reviews.AverageRating(ctx, &placeID, nil)
	if err != nil {
		return
	}
	place, err := s.places.GetByID(ctx, placeID)
	if err != nil {
		return
	}
	place.Rating = avg
	place.ReviewCount = int(count)
	_ = s.places.Update(ctx, place)
}
