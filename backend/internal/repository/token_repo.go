package repository

import (
	"context"
	"time"

	"github.com/faso-atlas/backend/internal/models"
	"gorm.io/gorm"
)

type TokenRepository interface {
	CreateRefresh(ctx context.Context, token *models.RefreshToken) error
	FindValidTokens(ctx context.Context) ([]models.RefreshToken, error)
	Revoke(ctx context.Context, id uint) error
	RevokeAllForUser(ctx context.Context, userID uint) error
	CreateVerification(ctx context.Context, token *models.VerificationToken) error
	FindVerificationByToken(ctx context.Context, token string) (*models.VerificationToken, error)
	MarkVerificationUsed(ctx context.Context, id uint) error
}

type tokenRepo struct{ db *gorm.DB }

func NewTokenRepository(db *gorm.DB) TokenRepository { return &tokenRepo{db: db} }

func (r *tokenRepo) CreateRefresh(ctx context.Context, token *models.RefreshToken) error {
	return r.db.WithContext(ctx).Create(token).Error
}
func (r *tokenRepo) FindValidTokens(ctx context.Context) ([]models.RefreshToken, error) {
	var tokens []models.RefreshToken
	err := r.db.WithContext(ctx).Where("revoked = ? AND expires_at > ?", false, time.Now().Unix()).Find(&tokens).Error
	return tokens, err
}
func (r *tokenRepo) Revoke(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Model(&models.RefreshToken{}).Where("id = ?", id).Update("revoked", true).Error
}
func (r *tokenRepo) RevokeAllForUser(ctx context.Context, userID uint) error {
	return r.db.WithContext(ctx).Model(&models.RefreshToken{}).Where("user_id = ? AND revoked = ?", userID, false).Update("revoked", true).Error
}
func (r *tokenRepo) CreateVerification(ctx context.Context, token *models.VerificationToken) error {
	return r.db.WithContext(ctx).Create(token).Error
}
func (r *tokenRepo) FindVerificationByToken(ctx context.Context, token string) (*models.VerificationToken, error) {
	var vt models.VerificationToken
	err := r.db.WithContext(ctx).Where("token = ? AND used = ? AND expires_at > now()", token, false).First(&vt).Error
	return &vt, err
}
func (r *tokenRepo) MarkVerificationUsed(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Model(&models.VerificationToken{}).Where("id = ?", id).Update("used", true).Error
}
