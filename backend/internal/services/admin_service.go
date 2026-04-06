package services

import (
	"context"
	"log/slog"

	"github.com/faso-atlas/backend/internal/models"
	"github.com/faso-atlas/backend/internal/repository"
	"github.com/faso-atlas/backend/pkg/apperror"
)

type AdminService struct {
	users repository.UserRepository
	places repository.PlaceRepository
	wiki  repository.WikiRepository
	logger *slog.Logger
}

func NewAdminService(users repository.UserRepository, places repository.PlaceRepository, wiki repository.WikiRepository, logger *slog.Logger) *AdminService {
	return &AdminService{users: users, places: places, wiki: wiki, logger: logger}
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

type DashboardStats struct {
	TotalUsers          int64 `json:"totalUsers"`
	TotalPlaces         int64 `json:"totalPlaces"`
	TotalArticles       int64 `json:"totalArticles"`
	PendingArticles     int64 `json:"pendingArticles"`
}

func (s *AdminService) GetStats(ctx context.Context) (*DashboardStats, *apperror.AppError) {
	users, _, err := s.users.List(ctx, 0, 1)
	if err != nil {
		return nil, apperror.Internal("failed to fetch stats")
	}
	_ = users

	// We reuse repository List calls with minimal offset/limit and access totals
	_, totalUsers, _ := s.users.List(ctx, 0, 1)
	_, totalPlaces, _ := s.places.List(ctx, 0, 1, repository.PlaceFilters{})
	_, totalArticles, _ := s.wiki.ListArticles(ctx, 0, 1, "")

	return &DashboardStats{
		TotalUsers:    totalUsers,
		TotalPlaces:   totalPlaces,
		TotalArticles: totalArticles,
	}, nil
}
