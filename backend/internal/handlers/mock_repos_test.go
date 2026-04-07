package handlers

import (
	"context"
	"errors"
	"log/slog"
	"os"
	"sync"
	"time"

	"github.com/faso-atlas/backend/internal/models"
	"github.com/faso-atlas/backend/internal/repository"
	"gorm.io/gorm"
)

func testLogger() *slog.Logger {
	return slog.New(slog.NewTextHandler(os.Stderr, &slog.HandlerOptions{Level: slog.LevelError}))
}

func gormModel(id uint) gorm.Model {
	return gorm.Model{ID: id, CreatedAt: time.Now(), UpdatedAt: time.Now()}
}

// ---- Mock UserRepository ----

type mockUserRepo struct {
	mu    sync.Mutex
	users []models.User
}

func (m *mockUserRepo) Create(_ context.Context, user *models.User) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	for _, u := range m.users {
		if u.Email == user.Email {
			return errors.New("email already in use")
		}
	}
	user.ID = uint(len(m.users) + 1)
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()
	m.users = append(m.users, *user)
	return nil
}

func (m *mockUserRepo) GetByID(_ context.Context, id uint) (*models.User, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	for _, u := range m.users {
		if u.ID == id {
			return &u, nil
		}
	}
	return nil, gorm.ErrRecordNotFound
}

func (m *mockUserRepo) GetByEmail(_ context.Context, email string) (*models.User, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	for _, u := range m.users {
		if u.Email == email {
			return &u, nil
		}
	}
	return nil, gorm.ErrRecordNotFound
}

func (m *mockUserRepo) Update(_ context.Context, user *models.User) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	for i, u := range m.users {
		if u.ID == user.ID {
			m.users[i] = *user
			return nil
		}
	}
	return gorm.ErrRecordNotFound
}

func (m *mockUserRepo) List(_ context.Context, offset, limit int) ([]models.User, int64, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	total := int64(len(m.users))
	end := offset + limit
	if end > len(m.users) {
		end = len(m.users)
	}
	if offset > len(m.users) {
		return nil, total, nil
	}
	return m.users[offset:end], total, nil
}

func (m *mockUserRepo) Delete(_ context.Context, id uint) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	for i, u := range m.users {
		if u.ID == id {
			m.users = append(m.users[:i], m.users[i+1:]...)
			return nil
		}
	}
	return gorm.ErrRecordNotFound
}

func (m *mockUserRepo) SetVerified(_ context.Context, id uint) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	for i, u := range m.users {
		if u.ID == id {
			m.users[i].IsVerified = true
			return nil
		}
	}
	return gorm.ErrRecordNotFound
}

// ---- Mock TokenRepository ----

type mockTokenRepo struct {
	mu             sync.Mutex
	refreshTokens  []models.RefreshToken
	verifyTokens   []models.VerificationToken
}

func (m *mockTokenRepo) CreateRefresh(_ context.Context, token *models.RefreshToken) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	token.ID = uint(len(m.refreshTokens) + 1)
	m.refreshTokens = append(m.refreshTokens, *token)
	return nil
}

func (m *mockTokenRepo) FindValidTokens(_ context.Context) ([]models.RefreshToken, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	var valid []models.RefreshToken
	now := time.Now().Unix()
	for _, t := range m.refreshTokens {
		if !t.Revoked && t.ExpiresAt > now {
			valid = append(valid, t)
		}
	}
	return valid, nil
}

func (m *mockTokenRepo) Revoke(_ context.Context, id uint) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	for i, t := range m.refreshTokens {
		if t.ID == id {
			m.refreshTokens[i].Revoked = true
			return nil
		}
	}
	return nil
}

func (m *mockTokenRepo) RevokeAllForUser(_ context.Context, userID uint) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	for i, t := range m.refreshTokens {
		if t.UserID == userID {
			m.refreshTokens[i].Revoked = true
		}
	}
	return nil
}

func (m *mockTokenRepo) CreateVerification(_ context.Context, token *models.VerificationToken) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	token.ID = uint(len(m.verifyTokens) + 1)
	m.verifyTokens = append(m.verifyTokens, *token)
	return nil
}

func (m *mockTokenRepo) FindVerificationByToken(_ context.Context, tokenStr string) (*models.VerificationToken, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	for _, vt := range m.verifyTokens {
		if vt.Token == tokenStr && !vt.Used && vt.ExpiresAt.After(time.Now()) {
			return &vt, nil
		}
	}
	return nil, gorm.ErrRecordNotFound
}

func (m *mockTokenRepo) MarkVerificationUsed(_ context.Context, id uint) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	for i, vt := range m.verifyTokens {
		if vt.ID == id {
			m.verifyTokens[i].Used = true
			return nil
		}
	}
	return nil
}

// ---- Mock PlaceRepository ----

type mockPlaceRepo struct {
	places []models.Place
}

func (m *mockPlaceRepo) List(_ context.Context, offset, limit int, f repository.PlaceFilters) ([]models.Place, int64, error) {
	var filtered []models.Place
	for _, p := range m.places {
		if f.Active != nil && p.IsActive != *f.Active {
			continue
		}
		if f.Type != "" && string(p.Type) != f.Type {
			continue
		}
		filtered = append(filtered, p)
	}
	total := int64(len(filtered))
	end := offset + limit
	if end > len(filtered) {
		end = len(filtered)
	}
	if offset > len(filtered) {
		return nil, total, nil
	}
	return filtered[offset:end], total, nil
}

func (m *mockPlaceRepo) GetBySlug(_ context.Context, slug string) (*models.Place, error) {
	for _, p := range m.places {
		if p.Slug == slug && p.IsActive {
			return &p, nil
		}
	}
	return nil, gorm.ErrRecordNotFound
}

func (m *mockPlaceRepo) GetByID(_ context.Context, id uint) (*models.Place, error) {
	for _, p := range m.places {
		if p.ID == id {
			return &p, nil
		}
	}
	return nil, gorm.ErrRecordNotFound
}

func (m *mockPlaceRepo) Create(_ context.Context, place *models.Place) error {
	place.ID = uint(len(m.places) + 1)
	m.places = append(m.places, *place)
	return nil
}

func (m *mockPlaceRepo) Update(_ context.Context, place *models.Place) error { return nil }

func (m *mockPlaceRepo) SetActive(_ context.Context, id uint, active bool) error {
	for i, p := range m.places {
		if p.ID == id {
			m.places[i].IsActive = active
			return nil
		}
	}
	return gorm.ErrRecordNotFound
}

func (m *mockPlaceRepo) Search(_ context.Context, query string, limit int) ([]models.Place, error) {
	return nil, nil
}
