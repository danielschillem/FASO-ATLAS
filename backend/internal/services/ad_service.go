package services

import (
	"context"
	"log/slog"
	"net/url"

	"github.com/faso-atlas/backend/internal/models"
	"github.com/faso-atlas/backend/internal/repository"
	"github.com/faso-atlas/backend/pkg/apperror"
	"github.com/faso-atlas/backend/pkg/validator"
)

type AdService struct {
	ads    repository.AdRepository
	logger *slog.Logger
}

func NewAdService(ads repository.AdRepository, logger *slog.Logger) *AdService {
	return &AdService{ads: ads, logger: logger}
}

// Public: fetch active ads for a given placement + page, track impressions.
func (s *AdService) GetActiveAds(ctx context.Context, placement models.AdPlacement, page string, limit int) ([]models.Ad, *apperror.AppError) {
	if limit <= 0 || limit > 10 {
		limit = 3
	}
	ads, err := s.ads.ListActive(ctx, placement, page, limit)
	if err != nil {
		s.logger.ErrorContext(ctx, "failed to fetch active ads", "error", err)
		return nil, apperror.Internal("failed to fetch ads")
	}

	// Track impressions asynchronously
	if len(ads) > 0 {
		ids := make([]uint, len(ads))
		for i, a := range ads {
			ids[i] = a.ID
		}
		go func() {
			_ = s.ads.IncrementImpressions(context.Background(), ids)
		}()
	}

	return ads, nil
}

// Public: track a click on an ad.
func (s *AdService) TrackClick(ctx context.Context, id uint) *apperror.AppError {
	if err := s.ads.IncrementClicks(ctx, id); err != nil {
		return apperror.Internal("failed to track click")
	}
	return nil
}

// Admin: create a new ad.
type CreateAdInput struct {
	Title       string
	PartnerName string
	Placement   string
	ImageURL    string
	LinkURL     string
	AltText     string
	Pages       []string
	Priority    int
	StartsAt    string
	EndsAt      string
	IsActive    bool
}

func (s *AdService) Create(ctx context.Context, input CreateAdInput) (*models.Ad, *apperror.AppError) {
	if err := validateAdInput(input); err != nil {
		return nil, err
	}

	ad := models.Ad{
		Title:       validator.SanitizeString(input.Title, 120),
		PartnerName: validator.SanitizeString(input.PartnerName, 120),
		Placement:   models.AdPlacement(input.Placement),
		ImageURL:    input.ImageURL,
		LinkURL:     input.LinkURL,
		AltText:     validator.SanitizeString(input.AltText, 255),
		Pages:       input.Pages,
		Priority:    input.Priority,
		IsActive:    input.IsActive,
	}

	if err := s.ads.Create(ctx, &ad); err != nil {
		s.logger.ErrorContext(ctx, "failed to create ad", "error", err)
		return nil, apperror.Internal("failed to create ad")
	}

	s.logger.InfoContext(ctx, "ad created", "adID", ad.ID, "partner", ad.PartnerName)
	return &ad, nil
}

// Admin: update an existing ad.
func (s *AdService) Update(ctx context.Context, id uint, input CreateAdInput) (*models.Ad, *apperror.AppError) {
	ad, err := s.ads.GetByID(ctx, id)
	if err != nil {
		return nil, apperror.NotFound("ad")
	}

	if err := validateAdInput(input); err != nil {
		return nil, err
	}

	ad.Title = validator.SanitizeString(input.Title, 120)
	ad.PartnerName = validator.SanitizeString(input.PartnerName, 120)
	ad.Placement = models.AdPlacement(input.Placement)
	ad.ImageURL = input.ImageURL
	ad.LinkURL = input.LinkURL
	ad.AltText = validator.SanitizeString(input.AltText, 255)
	ad.Pages = input.Pages
	ad.Priority = input.Priority
	ad.IsActive = input.IsActive

	if dbErr := s.ads.Update(ctx, ad); dbErr != nil {
		s.logger.ErrorContext(ctx, "failed to update ad", "error", dbErr)
		return nil, apperror.Internal("failed to update ad")
	}

	s.logger.InfoContext(ctx, "ad updated", "adID", id)
	return ad, nil
}

// Admin: delete an ad (soft delete).
func (s *AdService) Delete(ctx context.Context, id uint) *apperror.AppError {
	if err := s.ads.Delete(ctx, id); err != nil {
		return apperror.Internal("failed to delete ad")
	}
	s.logger.InfoContext(ctx, "ad deleted", "adID", id)
	return nil
}

// Admin: list all ads with pagination.
func (s *AdService) List(ctx context.Context, offset, limit int) ([]models.Ad, int64, *apperror.AppError) {
	ads, total, err := s.ads.List(ctx, offset, limit)
	if err != nil {
		return nil, 0, apperror.Internal("failed to list ads")
	}
	return ads, total, nil
}

// Admin: get a single ad.
func (s *AdService) GetByID(ctx context.Context, id uint) (*models.Ad, *apperror.AppError) {
	ad, err := s.ads.GetByID(ctx, id)
	if err != nil {
		return nil, apperror.NotFound("ad")
	}
	return ad, nil
}

func validateAdInput(input CreateAdInput) *apperror.AppError {
	details := map[string]string{}

	if input.Title == "" {
		details["title"] = "required"
	}
	if input.PartnerName == "" {
		details["partnerName"] = "required"
	}
	validPlacements := map[string]bool{"banner": true, "card": true, "sidebar": true}
	if !validPlacements[input.Placement] {
		details["placement"] = "must be banner, card, or sidebar"
	}
	if input.ImageURL == "" {
		details["imageUrl"] = "required"
	} else if u, err := url.Parse(input.ImageURL); err != nil || u.Scheme == "" {
		details["imageUrl"] = "must be a valid URL"
	}
	if input.LinkURL == "" {
		details["linkUrl"] = "required"
	} else if u, err := url.Parse(input.LinkURL); err != nil || u.Scheme == "" {
		details["linkUrl"] = "must be a valid URL"
	}

	if len(details) > 0 {
		return apperror.Validation(details)
	}
	return nil
}
