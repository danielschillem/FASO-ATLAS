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
	mu            sync.Mutex
	refreshTokens []models.RefreshToken
	verifyTokens  []models.VerificationToken
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

func (m *mockPlaceRepo) Delete(_ context.Context, id uint) error {
	for i, p := range m.places {
		if p.ID == id {
			m.places = append(m.places[:i], m.places[i+1:]...)
			return nil
		}
	}
	return gorm.ErrRecordNotFound
}

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
	result := make([]models.Place, 0)
	for _, p := range m.places {
		if len(result) >= limit {
			break
		}
		result = append(result, p)
	}
	return result, nil
}

func contains(s, sub string) bool {
	return len(s) >= len(sub) && (s == sub || len(sub) == 0 ||
		func() bool {
			for i := 0; i <= len(s)-len(sub); i++ {
				if s[i:i+len(sub)] == sub {
					return true
				}
			}
			return false
		}())
}

// ---- Mock FavoriteRepository ----

type mockFavoriteRepo struct {
	mu        sync.Mutex
	favorites []models.Favorite
}

func (m *mockFavoriteRepo) Add(_ context.Context, fav *models.Favorite) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	fav.ID = uint(len(m.favorites) + 1)
	m.favorites = append(m.favorites, *fav)
	return nil
}

func (m *mockFavoriteRepo) Remove(_ context.Context, userID, targetID uint, targetType models.FavoriteType) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	for i, f := range m.favorites {
		if f.UserID == userID && f.TargetID == targetID && f.TargetType == targetType {
			m.favorites = append(m.favorites[:i], m.favorites[i+1:]...)
			return nil
		}
	}
	return nil
}

func (m *mockFavoriteRepo) ListByUser(_ context.Context, userID uint, targetType models.FavoriteType, offset, limit int) ([]models.Favorite, int64, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	var filtered []models.Favorite
	for _, f := range m.favorites {
		if f.UserID == userID && (targetType == "" || f.TargetType == targetType) {
			filtered = append(filtered, f)
		}
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

func (m *mockFavoriteRepo) Exists(_ context.Context, userID, targetID uint, targetType models.FavoriteType) (bool, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	for _, f := range m.favorites {
		if f.UserID == userID && f.TargetID == targetID && f.TargetType == targetType {
			return true, nil
		}
	}
	return false, nil
}

// ---- Mock ItineraryRepository ----

type mockItineraryRepo struct {
	mu          sync.Mutex
	itineraries []models.Itinerary
	stops       []models.ItineraryStop
}

func (m *mockItineraryRepo) List(_ context.Context, offset, limit int, f repository.ItineraryFilters) ([]models.Itinerary, int64, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	var filtered []models.Itinerary
	for _, it := range m.itineraries {
		if f.Difficulty != "" && it.Difficulty != f.Difficulty {
			continue
		}
		if f.MaxDuration > 0 && it.DurationDays > f.MaxDuration {
			continue
		}
		filtered = append(filtered, it)
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

func (m *mockItineraryRepo) GetByID(_ context.Context, id uint) (*models.Itinerary, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	for _, it := range m.itineraries {
		if it.ID == id {
			return &it, nil
		}
	}
	return nil, gorm.ErrRecordNotFound
}

func (m *mockItineraryRepo) Create(_ context.Context, it *models.Itinerary) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	it.ID = uint(len(m.itineraries) + 1)
	m.itineraries = append(m.itineraries, *it)
	return nil
}

func (m *mockItineraryRepo) CreateStop(_ context.Context, stop *models.ItineraryStop) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	stop.ID = uint(len(m.stops) + 1)
	m.stops = append(m.stops, *stop)
	return nil
}

func (m *mockItineraryRepo) DeleteStop(_ context.Context, stopID, itineraryID uint) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	for i, s := range m.stops {
		if s.ID == stopID && s.ItineraryID == itineraryID {
			m.stops = append(m.stops[:i], m.stops[i+1:]...)
			return nil
		}
	}
	return nil
}

func (m *mockItineraryRepo) Update(_ context.Context, it *models.Itinerary) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	for i, existing := range m.itineraries {
		if existing.ID == it.ID {
			m.itineraries[i] = *it
			return nil
		}
	}
	return nil
}

func (m *mockItineraryRepo) Delete(_ context.Context, id uint) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	for i, it := range m.itineraries {
		if it.ID == id {
			m.itineraries = append(m.itineraries[:i], m.itineraries[i+1:]...)
			return nil
		}
	}
	return nil
}

func (m *mockItineraryRepo) Search(_ context.Context, query string, limit int) ([]models.Itinerary, error) {
	result := make([]models.Itinerary, 0)
	for _, it := range m.itineraries {
		if len(result) >= limit {
			break
		}
		result = append(result, it)
	}
	return result, nil
}

// ---- Mock AtlasRepository ----

type mockAtlasRepo struct {
	events []models.AtlasEvent
}

func (m *mockAtlasRepo) ListEvents(_ context.Context, era string) ([]models.AtlasEvent, error) {
	if era == "" {
		return m.events, nil
	}
	var filtered []models.AtlasEvent
	for _, e := range m.events {
		if string(e.Era) == era {
			filtered = append(filtered, e)
		}
	}
	return filtered, nil
}

// ---- Mock SymbolRepository ----

type mockSymbolRepo struct {
	symbols []models.Symbol
}

func (m *mockSymbolRepo) List(_ context.Context) ([]models.Symbol, error) {
	return m.symbols, nil
}

// ---- Mock EstablishmentRepository ----

type mockEstablishmentRepo struct {
	establishments []models.Establishment
}

func (m *mockEstablishmentRepo) List(_ context.Context, offset, limit int, f repository.EstablishmentFilters) ([]models.Establishment, int64, error) {
	var filtered []models.Establishment
	for _, e := range m.establishments {
		if f.Type != "" && string(e.Type) != f.Type {
			continue
		}
		if f.MinStars > 0 && e.Stars < f.MinStars {
			continue
		}
		filtered = append(filtered, e)
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

func (m *mockEstablishmentRepo) GetByID(_ context.Context, id uint) (*models.Establishment, error) {
	for _, e := range m.establishments {
		if e.ID == id {
			return &e, nil
		}
	}
	return nil, gorm.ErrRecordNotFound
}

func (m *mockEstablishmentRepo) Search(_ context.Context, query string, limit int) ([]models.Establishment, error) {
	result := make([]models.Establishment, 0)
	for _, e := range m.establishments {
		if len(result) >= limit {
			break
		}
		result = append(result, e)
	}
	return result, nil
}

// ---- Mock ReviewRepository ----

type mockReviewRepo struct {
	mu      sync.Mutex
	reviews []models.Review
}

func (m *mockReviewRepo) Create(_ context.Context, review *models.Review) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	review.ID = uint(len(m.reviews) + 1)
	m.reviews = append(m.reviews, *review)
	return nil
}

func (m *mockReviewRepo) GetByID(_ context.Context, id uint) (*models.Review, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	for _, r := range m.reviews {
		if r.ID == id {
			return &r, nil
		}
	}
	return nil, gorm.ErrRecordNotFound
}

func (m *mockReviewRepo) ListByPlace(_ context.Context, placeID uint, offset, limit int) ([]models.Review, int64, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	var filtered []models.Review
	for _, r := range m.reviews {
		if r.PlaceID != nil && *r.PlaceID == placeID {
			filtered = append(filtered, r)
		}
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

func (m *mockReviewRepo) ListByEstablishment(_ context.Context, estabID uint, offset, limit int) ([]models.Review, int64, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	var filtered []models.Review
	for _, r := range m.reviews {
		if r.EstablishmentID != nil && *r.EstablishmentID == estabID {
			filtered = append(filtered, r)
		}
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

func (m *mockReviewRepo) Update(_ context.Context, review *models.Review) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	for i, r := range m.reviews {
		if r.ID == review.ID {
			m.reviews[i] = *review
			return nil
		}
	}
	return gorm.ErrRecordNotFound
}

func (m *mockReviewRepo) Delete(_ context.Context, id uint) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	for i, r := range m.reviews {
		if r.ID == id {
			m.reviews = append(m.reviews[:i], m.reviews[i+1:]...)
			return nil
		}
	}
	return gorm.ErrRecordNotFound
}

func (m *mockReviewRepo) AverageRating(_ context.Context, placeID *uint, estabID *uint) (float64, int64, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	var sum, count int64
	for _, r := range m.reviews {
		if placeID != nil && r.PlaceID != nil && *r.PlaceID == *placeID {
			sum += int64(r.Rating)
			count++
		}
		if estabID != nil && r.EstablishmentID != nil && *r.EstablishmentID == *estabID {
			sum += int64(r.Rating)
			count++
		}
	}
	if count == 0 {
		return 0, 0, nil
	}
	return float64(sum) / float64(count), count, nil
}

// ---- Mock ReservationRepository ----

type mockReservationRepo struct {
	mu           sync.Mutex
	reservations []models.Reservation
}

func (m *mockReservationRepo) Create(_ context.Context, r *models.Reservation) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	r.ID = uint(len(m.reservations) + 1)
	m.reservations = append(m.reservations, *r)
	return nil
}

func (m *mockReservationRepo) GetByID(_ context.Context, id uint) (*models.Reservation, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	for _, r := range m.reservations {
		if r.ID == id {
			return &r, nil
		}
	}
	return nil, gorm.ErrRecordNotFound
}

func (m *mockReservationRepo) ListByUser(_ context.Context, userID uint) ([]models.Reservation, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	var result []models.Reservation
	for _, r := range m.reservations {
		if r.UserID == userID {
			result = append(result, r)
		}
	}
	return result, nil
}

func (m *mockReservationRepo) UpdateStatus(_ context.Context, id uint, status models.ReservationStatus) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	for i, r := range m.reservations {
		if r.ID == id {
			m.reservations[i].Status = status
			return nil
		}
	}
	return gorm.ErrRecordNotFound
}

func (m *mockReservationRepo) ListByOwner(_ context.Context, ownerID uint) ([]models.Reservation, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	var result []models.Reservation
	for _, r := range m.reservations {
		if r.EstablishmentID == ownerID {
			result = append(result, r)
		}
	}
	return result, nil
}

func (m *mockReservationRepo) Count(_ context.Context) (int64, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	return int64(len(m.reservations)), nil
}

func (m *mockReservationRepo) UpdatePayment(_ context.Context, id uint, intentID string, status models.PaymentStatus) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	for i, r := range m.reservations {
		if r.ID == id {
			m.reservations[i].PaymentIntentID = intentID
			m.reservations[i].PaymentStatus = status
			return nil
		}
	}
	return gorm.ErrRecordNotFound
}

// ---- Mock WikiRepository ----

type mockWikiRepo struct {
	mu        sync.Mutex
	articles  []models.WikiArticle
	revisions []models.WikiRevision
}

func (m *mockWikiRepo) ListArticles(_ context.Context, offset, limit int, category string) ([]models.WikiArticle, int64, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	var filtered []models.WikiArticle
	for _, a := range m.articles {
		if category != "" && a.Category != category {
			continue
		}
		filtered = append(filtered, a)
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

func (m *mockWikiRepo) GetArticleBySlug(_ context.Context, slug string) (*models.WikiArticle, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	for _, a := range m.articles {
		if a.Slug == slug {
			return &a, nil
		}
	}
	return nil, gorm.ErrRecordNotFound
}

func (m *mockWikiRepo) CreateArticle(_ context.Context, a *models.WikiArticle) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	for _, existing := range m.articles {
		if existing.Slug == a.Slug {
			return errors.New("duplicate slug")
		}
	}
	a.ID = uint(len(m.articles) + 1)
	m.articles = append(m.articles, *a)
	return nil
}

func (m *mockWikiRepo) IncrementViewCount(_ context.Context, id uint) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	for i, a := range m.articles {
		if a.ID == id {
			m.articles[i].ViewCount++
			return nil
		}
	}
	return nil
}

func (m *mockWikiRepo) SetApproved(_ context.Context, id uint, approved bool) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	for i, a := range m.articles {
		if a.ID == id {
			m.articles[i].IsApproved = approved
			return nil
		}
	}
	return gorm.ErrRecordNotFound
}

func (m *mockWikiRepo) CreateRevision(_ context.Context, rev *models.WikiRevision) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	rev.ID = uint(len(m.revisions) + 1)
	m.revisions = append(m.revisions, *rev)
	return nil
}

func (m *mockWikiRepo) GetRevisionByID(_ context.Context, id uint) (*models.WikiRevision, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	for _, rev := range m.revisions {
		if rev.ID == id {
			return &rev, nil
		}
	}
	return nil, gorm.ErrRecordNotFound
}

func (m *mockWikiRepo) ApplyRevision(_ context.Context, articleID uint, bodyHTML string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	for i, a := range m.articles {
		if a.ID == articleID {
			m.articles[i].BodyHTML = bodyHTML
			return nil
		}
	}
	return gorm.ErrRecordNotFound
}

func (m *mockWikiRepo) SearchArticles(_ context.Context, query string, limit int) ([]models.WikiArticle, error) {
	result := make([]models.WikiArticle, 0)
	for _, a := range m.articles {
		if len(result) >= limit {
			break
		}
		result = append(result, a)
	}
	return result, nil
}

// ---- Mock MapRepository ----

type mockMapRepo struct {
	places  []models.Place
	regions []models.Region
}

func (m *mockMapRepo) GetPlaces(_ context.Context, placeType, regionID string) ([]models.Place, error) {
	return m.places, nil
}

func (m *mockMapRepo) GetPlaceByID(_ context.Context, id uint) (*models.Place, error) {
	for _, p := range m.places {
		if p.ID == id {
			return &p, nil
		}
	}
	return nil, gorm.ErrRecordNotFound
}

func (m *mockMapRepo) GetRegions(_ context.Context) ([]models.Region, error) {
	return m.regions, nil
}

func (m *mockMapRepo) GetCached(_ context.Context, key string) ([]byte, error) {
	return nil, gorm.ErrRecordNotFound
}

func (m *mockMapRepo) SetCached(_ context.Context, key string, data []byte, ttl time.Duration) error {
	return nil
}
