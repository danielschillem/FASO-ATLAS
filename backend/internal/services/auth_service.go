package services

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"log/slog"
	"time"

	"github.com/faso-atlas/backend/internal/models"
	"github.com/faso-atlas/backend/internal/repository"
	"github.com/faso-atlas/backend/pkg/apperror"
	pkgjwt "github.com/faso-atlas/backend/pkg/jwt"
	"github.com/faso-atlas/backend/pkg/validator"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthService struct {
	users      repository.UserRepository
	tokens     repository.TokenRepository
	jwtManager *pkgjwt.Manager
	email      *EmailService
	logger     *slog.Logger
}

func NewAuthService(users repository.UserRepository, tokens repository.TokenRepository, jwtManager *pkgjwt.Manager, email *EmailService, logger *slog.Logger) *AuthService {
	return &AuthService{users: users, tokens: tokens, jwtManager: jwtManager, email: email, logger: logger}
}

type RegisterInput struct {
	Email     string
	Password  string
	FirstName string
	LastName  string
	Role      models.UserRole
}

type AuthResult struct {
	AccessToken  string      `json:"accessToken"`
	RefreshToken string      `json:"refreshToken,omitempty"`
	User         models.User `json:"user"`
}

func (s *AuthService) Register(ctx context.Context, input RegisterInput) (*AuthResult, *apperror.AppError) {
	if pwErrs := validator.ValidatePassword(input.Password); len(pwErrs) > 0 {
		return nil, apperror.Validation(pwErrs)
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		s.logger.ErrorContext(ctx, "failed to hash password", "error", err)
		return nil, apperror.Internal("failed to hash password")
	}

	role := models.RoleTourist
	if input.Role == models.RoleOwner {
		role = models.RoleOwner
	}

	user := models.User{
		Email:        input.Email,
		PasswordHash: string(hash),
		FirstName:    validator.SanitizeString(input.FirstName, 100),
		LastName:     validator.SanitizeString(input.LastName, 100),
		Role:         role,
	}

	if err := s.users.Create(ctx, &user); err != nil {
		return nil, apperror.Conflict("email already in use")
	}

	token, err := s.jwtManager.GenerateAccessToken(user.ID, string(user.Role))
	if err != nil {
		s.logger.ErrorContext(ctx, "failed to generate access token", "error", err)
		return nil, apperror.Internal("failed to generate token")
	}

	s.logger.InfoContext(ctx, "user registered", "userID", user.ID, "email", user.Email)
	return &AuthResult{AccessToken: token, User: user}, nil
}

func (s *AuthService) Login(ctx context.Context, email, password string) (*AuthResult, *apperror.AppError) {
	user, err := s.users.GetByEmail(ctx, email)
	if err != nil {
		return nil, apperror.Unauthorized("invalid credentials")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, apperror.Unauthorized("invalid credentials")
	}

	accessToken, err := s.jwtManager.GenerateAccessToken(user.ID, string(user.Role))
	if err != nil {
		s.logger.ErrorContext(ctx, "failed to generate access token", "error", err)
		return nil, apperror.Internal("failed to generate token")
	}

	refreshStr, appErr := s.createRefreshToken(ctx, user.ID)
	if appErr != nil {
		return nil, appErr
	}

	s.logger.InfoContext(ctx, "user logged in", "userID", user.ID)
	return &AuthResult{AccessToken: accessToken, RefreshToken: refreshStr, User: *user}, nil
}

func (s *AuthService) Refresh(ctx context.Context, rawToken string) (*AuthResult, *apperror.AppError) {
	var tokens []models.RefreshToken
	tokens, _ = s.tokens.FindValidTokens(ctx)

	var matched *models.RefreshToken
	for i := range tokens {
		if err := bcrypt.CompareHashAndPassword([]byte(tokens[i].TokenHash), []byte(rawToken)); err == nil {
			matched = &tokens[i]
			break
		}
	}

	if matched == nil {
		return nil, apperror.Unauthorized("invalid or expired refresh token")
	}

	_ = s.tokens.Revoke(ctx, matched.ID)

	user, err := s.users.GetByID(ctx, matched.UserID)
	if err != nil {
		return nil, apperror.Unauthorized("user not found")
	}

	accessToken, err := s.jwtManager.GenerateAccessToken(user.ID, string(user.Role))
	if err != nil {
		s.logger.ErrorContext(ctx, "failed to generate access token", "error", err)
		return nil, apperror.Internal("failed to generate token")
	}

	refreshStr, appErr := s.createRefreshToken(ctx, user.ID)
	if appErr != nil {
		return nil, appErr
	}

	return &AuthResult{AccessToken: accessToken, RefreshToken: refreshStr, User: *user}, nil
}

func (s *AuthService) GetCurrentUser(ctx context.Context, userID uint) (*models.User, *apperror.AppError) {
	user, err := s.users.GetByID(ctx, userID)
	if err != nil {
		return nil, apperror.NotFound("user")
	}
	return user, nil
}

func (s *AuthService) RequestEmailVerification(ctx context.Context, userID uint) (string, *apperror.AppError) {
	tokenStr, err := generateSecureToken()
	if err != nil {
		s.logger.ErrorContext(ctx, "failed to generate verification token", "error", err)
		return "", apperror.Internal("failed to generate token")
	}

	vt := models.VerificationToken{
		UserID:    userID,
		Token:     tokenStr,
		Type:      models.TokenEmailVerification,
		ExpiresAt: time.Now().Add(24 * time.Hour),
	}
	if err := s.tokens.CreateVerification(ctx, &vt); err != nil {
		return "", apperror.Internal("failed to create verification token")
	}

	s.logger.InfoContext(ctx, "email verification requested", "userID", userID)

	// Send verification email
	if s.email != nil {
		user, _ := s.users.GetByID(ctx, userID)
		if user != nil {
			if err := s.email.SendVerificationEmail(ctx, user.Email, user.FirstName, tokenStr); err != nil {
				s.logger.ErrorContext(ctx, "failed to send verification email", "error", err, "userID", userID)
			}
		}
	}

	return tokenStr, nil
}

func (s *AuthService) VerifyEmail(ctx context.Context, tokenStr string) *apperror.AppError {
	vt, err := s.tokens.FindVerificationByToken(ctx, tokenStr)
	if err != nil {
		return apperror.BadRequest("invalid or expired verification token")
	}
	if vt.Type != models.TokenEmailVerification {
		return apperror.BadRequest("invalid token type")
	}

	if err := s.users.SetVerified(ctx, vt.UserID); err != nil {
		return apperror.Internal("failed to verify email")
	}
	_ = s.tokens.MarkVerificationUsed(ctx, vt.ID)

	s.logger.InfoContext(ctx, "email verified", "userID", vt.UserID)
	return nil
}

func (s *AuthService) RequestPasswordReset(ctx context.Context, email string) (string, *apperror.AppError) {
	user, err := s.users.GetByEmail(ctx, email)
	if err != nil {
		// Don't reveal if user exists
		return "", nil
	}

	tokenStr, err := generateSecureToken()
	if err != nil {
		s.logger.ErrorContext(ctx, "failed to generate reset token", "error", err)
		return "", apperror.Internal("failed to generate token")
	}

	vt := models.VerificationToken{
		UserID:    user.ID,
		Token:     tokenStr,
		Type:      models.TokenPasswordReset,
		ExpiresAt: time.Now().Add(1 * time.Hour),
	}
	if err := s.tokens.CreateVerification(ctx, &vt); err != nil {
		return "", apperror.Internal("failed to create reset token")
	}

	s.logger.InfoContext(ctx, "password reset requested", "userID", user.ID)

	// Send password reset email
	if s.email != nil {
		if err := s.email.SendPasswordResetEmail(ctx, user.Email, user.FirstName, tokenStr); err != nil {
			s.logger.ErrorContext(ctx, "failed to send password reset email", "error", err, "userID", user.ID)
		}
	}

	return tokenStr, nil
}

func (s *AuthService) ResetPassword(ctx context.Context, tokenStr, newPassword string) *apperror.AppError {
	if pwErrs := validator.ValidatePassword(newPassword); len(pwErrs) > 0 {
		return apperror.Validation(pwErrs)
	}

	vt, err := s.tokens.FindVerificationByToken(ctx, tokenStr)
	if err != nil {
		return apperror.BadRequest("invalid or expired reset token")
	}
	if vt.Type != models.TokenPasswordReset {
		return apperror.BadRequest("invalid token type")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return apperror.Internal("failed to hash password")
	}

	user, err := s.users.GetByID(ctx, vt.UserID)
	if err != nil {
		return apperror.NotFound("user")
	}
	user.PasswordHash = string(hash)
	if err := s.users.Update(ctx, user); err != nil {
		return apperror.Internal("failed to update password")
	}

	_ = s.tokens.MarkVerificationUsed(ctx, vt.ID)
	_ = s.tokens.RevokeAllForUser(ctx, vt.UserID)

	s.logger.InfoContext(ctx, "password reset completed", "userID", vt.UserID)
	return nil
}

type UpdateProfileInput struct {
	FirstName string
	LastName  string
	Phone     string
	AvatarURL string
}

func (s *AuthService) UpdateProfile(ctx context.Context, userID uint, input UpdateProfileInput) (*models.User, *apperror.AppError) {
	user, err := s.users.GetByID(ctx, userID)
	if err != nil {
		return nil, apperror.NotFound("user not found")
	}
	user.FirstName = input.FirstName
	user.LastName = input.LastName
	user.Phone = input.Phone
	if input.AvatarURL != "" {
		user.AvatarURL = input.AvatarURL
	}
	if err := s.users.Update(ctx, user); err != nil {
		return nil, apperror.Internal("failed to update profile")
	}
	s.logger.InfoContext(ctx, "profile updated", "userID", userID)
	return user, nil
}

func (s *AuthService) ChangePassword(ctx context.Context, userID uint, currentPassword, newPassword string) *apperror.AppError {
	user, err := s.users.GetByID(ctx, userID)
	if err != nil {
		return apperror.NotFound("user not found")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(currentPassword)); err != nil {
		return apperror.Unauthorized("current password is incorrect")
	}
	if pwErrs := validator.ValidatePassword(newPassword); len(pwErrs) > 0 {
		return apperror.Validation(pwErrs)
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return apperror.Internal("failed to hash password")
	}
	user.PasswordHash = string(hash)
	if err := s.users.Update(ctx, user); err != nil {
		return apperror.Internal("failed to update password")
	}
	s.logger.InfoContext(ctx, "password changed", "userID", userID)
	return nil
}

func (s *AuthService) createRefreshToken(ctx context.Context, userID uint) (string, *apperror.AppError) {
	rawToken := make([]byte, 32)
	if _, err := rand.Read(rawToken); err != nil {
		return "", apperror.Internal("failed to generate refresh token")
	}
	tokenStr := hex.EncodeToString(rawToken)

	hashBytes, _ := bcrypt.GenerateFromPassword([]byte(tokenStr), bcrypt.MinCost)
	rt := models.RefreshToken{
		UserID:    userID,
		TokenHash: string(hashBytes),
		ExpiresAt: time.Now().Add(s.jwtManager.RefreshTokenTTL()).Unix(),
	}
	if err := s.tokens.CreateRefresh(ctx, &rt); err != nil {
		return "", apperror.Internal("failed to store refresh token")
	}
	return tokenStr, nil
}

func generateSecureToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

// IsNotFound checks if an error is a GORM record not found error.
func IsNotFound(err error) bool {
	return errors.Is(err, gorm.ErrRecordNotFound)
}
