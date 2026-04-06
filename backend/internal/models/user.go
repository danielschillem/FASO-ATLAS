package models

import (
	"time"

	"gorm.io/gorm"
)

type UserRole string

const (
	RoleTourist UserRole = "tourist"
	RoleOwner   UserRole = "owner"
	RoleAdmin   UserRole = "admin"
)

type User struct {
	gorm.Model
	Email        string   `gorm:"uniqueIndex;not null" json:"email"`
	PasswordHash string   `gorm:"not null" json:"-"`
	FirstName    string   `json:"firstName"`
	LastName     string   `json:"lastName"`
	Phone        string   `json:"phone"`
	Role         UserRole `gorm:"default:tourist" json:"role"`
	AvatarURL    string   `json:"avatarUrl"`
	IsVerified   bool     `gorm:"default:false" json:"isVerified"`

	Reservations []Reservation `json:"-"`
	Itineraries  []Itinerary   `json:"-"`
}

type RefreshToken struct {
	gorm.Model
	UserID    uint   `gorm:"not null"`
	TokenHash string `gorm:"uniqueIndex;not null"`
	ExpiresAt int64  `gorm:"not null"`
	Revoked   bool   `gorm:"default:false"`
}

type VerificationTokenType string

const (
	TokenEmailVerification VerificationTokenType = "email_verification"
	TokenPasswordReset     VerificationTokenType = "password_reset"
)

type VerificationToken struct {
	gorm.Model
	UserID    uint                  `gorm:"not null"`
	Token     string                `gorm:"uniqueIndex;not null"`
	Type      VerificationTokenType `gorm:"not null"`
	ExpiresAt time.Time             `gorm:"not null"`
	Used      bool                  `gorm:"default:false"`
}
