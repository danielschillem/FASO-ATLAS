package services

import (
	"context"
	"log/slog"

	"github.com/faso-atlas/backend/internal/models"
	"github.com/faso-atlas/backend/internal/repository"
	"github.com/faso-atlas/backend/pkg/apperror"
)

type AdminService struct {
	users  repository.UserRepository
	places repository.PlaceRepository
	wiki   repository.WikiRepository
	estabs repository.EstablishmentRepository
	itins  repository.ItineraryRepository
	resas  repository.ReservationRepository
	logger *slog.Logger
}

func NewAdminService(users repository.UserRepository, places repository.PlaceRepository, wiki repository.WikiRepository, estabs repository.EstablishmentRepository, itins repository.ItineraryRepository, resas repository.ReservationRepository, logger *slog.Logger) *AdminService {
	return &AdminService{users: users, places: places, wiki: wiki, estabs: estabs, itins: itins, resas: resas, logger: logger}
}

func (s *AdminService) ListUsers(ctx context.Context, offset, limit int) ([]models.User, int64, *apperror.AppError) {
	users, total, err := s.users.List(ctx, offset, limit)
	if err != nil {
		return nil, 0, apperror.Internal("failed to fetch users")
	}
	return users, total, nil
}

func (s *AdminService) UpdateUserRole(ctx context.Context, userID uint, role models.UserRole) (*models.User, *apperror.AppError) {
	validRoles := map[models.UserRole]bool{
		models.RoleTourist: true,
		models.RoleOwner:   true,
		models.RoleAdmin:   true,
	}
	if !validRoles[role] {
		return nil, apperror.BadRequest("invalid role")
	}

	user, err := s.users.GetByID(ctx, userID)
	if err != nil {
		return nil, apperror.NotFound("user")
	}
	user.Role = role
	if err := s.users.Update(ctx, user); err != nil {
		return nil, apperror.Internal("failed to update role")
	}

	s.logger.InfoContext(ctx, "user role updated", "userID", userID, "newRole", role)
	return user, nil
}

func (s *AdminService) DeleteUser(ctx context.Context, userID uint) *apperror.AppError {
	if err := s.users.Delete(ctx, userID); err != nil {
		return apperror.Internal("failed to delete user")
	}
	s.logger.InfoContext(ctx, "user deleted", "userID", userID)
	return nil
}

func (s *AdminService) TogglePlaceActive(ctx context.Context, placeID uint, active bool) *apperror.AppError {
	if err := s.places.SetActive(ctx, placeID, active); err != nil {
		return apperror.Internal("failed to update place")
	}
	s.logger.InfoContext(ctx, "place active toggled", "placeID", placeID, "active", active)
	return nil
}

func (s *AdminService) ToggleArticleApproved(ctx context.Context, articleID uint, approved bool) *apperror.AppError {
	if err := s.wiki.SetApproved(ctx, articleID, approved); err != nil {
		return apperror.Internal("failed to update article")
	}
	s.logger.InfoContext(ctx, "article approval toggled", "articleID", articleID, "approved", approved)
	return nil
}

// ─── Admin Place CRUD ───

func (s *AdminService) ListPlaces(ctx context.Context, offset, limit int) ([]models.Place, int64, *apperror.AppError) {
	places, total, err := s.places.List(ctx, offset, limit, repository.PlaceFilters{})
	if err != nil {
		return nil, 0, apperror.Internal("failed to fetch places")
	}
	return places, total, nil
}

func (s *AdminService) GetPlace(ctx context.Context, id uint) (*models.Place, *apperror.AppError) {
	place, err := s.places.GetByID(ctx, id)
	if err != nil {
		return nil, apperror.NotFound("place")
	}
	return place, nil
}

type CreatePlaceInput struct {
	Name        string   `json:"name"`
	Slug        string   `json:"slug"`
	Type        string   `json:"type"`
	Description string   `json:"description"`
	Lat         float64  `json:"lat"`
	Lng         float64  `json:"lng"`
	RegionID    *uint    `json:"regionId"`
	Tags        []string `json:"tags"`
	IsActive    bool     `json:"isActive"`
}

func (s *AdminService) CreatePlace(ctx context.Context, input CreatePlaceInput) (*models.Place, *apperror.AppError) {
	if input.Name == "" || input.Slug == "" || input.Type == "" {
		return nil, apperror.BadRequest("name, slug and type are required")
	}
	validTypes := map[models.PlaceType]bool{
		models.PlaceSite: true, models.PlaceHotel: true,
		models.PlaceNature: true, models.PlaceCulture: true,
	}
	if !validTypes[models.PlaceType(input.Type)] {
		return nil, apperror.BadRequest("invalid place type")
	}

	place := &models.Place{
		Name:        input.Name,
		Slug:        input.Slug,
		Type:        models.PlaceType(input.Type),
		Description: input.Description,
		Latitude:    input.Lat,
		Longitude:   input.Lng,
		RegionID:    input.RegionID,
		Tags:        input.Tags,
		IsActive:    input.IsActive,
	}
	if err := s.places.Create(ctx, place); err != nil {
		return nil, apperror.Internal("failed to create place")
	}
	s.logger.InfoContext(ctx, "place created", "placeID", place.ID, "name", place.Name)
	return place, nil
}

func (s *AdminService) UpdatePlace(ctx context.Context, id uint, input CreatePlaceInput) (*models.Place, *apperror.AppError) {
	place, err := s.places.GetByID(ctx, id)
	if err != nil {
		return nil, apperror.NotFound("place")
	}
	if input.Name != "" {
		place.Name = input.Name
	}
	if input.Slug != "" {
		place.Slug = input.Slug
	}
	if input.Type != "" {
		validTypes := map[models.PlaceType]bool{
			models.PlaceSite: true, models.PlaceHotel: true,
			models.PlaceNature: true, models.PlaceCulture: true,
		}
		if !validTypes[models.PlaceType(input.Type)] {
			return nil, apperror.BadRequest("invalid place type")
		}
		place.Type = models.PlaceType(input.Type)
	}
	if input.Description != "" {
		place.Description = input.Description
	}
	if input.Lat != 0 {
		place.Latitude = input.Lat
	}
	if input.Lng != 0 {
		place.Longitude = input.Lng
	}
	if input.RegionID != nil {
		place.RegionID = input.RegionID
	}
	if input.Tags != nil {
		place.Tags = input.Tags
	}
	place.IsActive = input.IsActive

	if err := s.places.Update(ctx, place); err != nil {
		return nil, apperror.Internal("failed to update place")
	}
	s.logger.InfoContext(ctx, "place updated", "placeID", place.ID)
	return place, nil
}

func (s *AdminService) DeletePlace(ctx context.Context, id uint) *apperror.AppError {
	if _, err := s.places.GetByID(ctx, id); err != nil {
		return apperror.NotFound("place")
	}
	if err := s.places.Delete(ctx, id); err != nil {
		return apperror.Internal("failed to delete place")
	}
	s.logger.InfoContext(ctx, "place deleted", "placeID", id)
	return nil
}

type DashboardStats struct {
	TotalUsers          int64 `json:"totalUsers"`
	TotalPlaces         int64 `json:"totalPlaces"`
	TotalEstablishments int64 `json:"totalEstablishments"`
	TotalItineraries    int64 `json:"totalItineraries"`
	TotalArticles       int64 `json:"totalArticles"`
	TotalReservations   int64 `json:"totalReservations"`
	PendingArticles     int64 `json:"pendingArticles"`
}

func (s *AdminService) GetStats(ctx context.Context) (*DashboardStats, *apperror.AppError) {
	_, totalUsers, _ := s.users.List(ctx, 0, 1)
	_, totalPlaces, _ := s.places.List(ctx, 0, 1, repository.PlaceFilters{})
	_, totalArticles, _ := s.wiki.ListArticles(ctx, 0, 1, "")
	_, totalEstabs, _ := s.estabs.List(ctx, 0, 1, repository.EstablishmentFilters{})
	_, totalItins, _ := s.itins.List(ctx, 0, 1, repository.ItineraryFilters{})
	totalResas, _ := s.resas.Count(ctx)

	return &DashboardStats{
		TotalUsers:          totalUsers,
		TotalPlaces:         totalPlaces,
		TotalEstablishments: totalEstabs,
		TotalItineraries:    totalItins,
		TotalArticles:       totalArticles,
		TotalReservations:   totalResas,
	}, nil
}
