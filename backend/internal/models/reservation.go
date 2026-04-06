package models

import (
	"time"
	"gorm.io/gorm"
)

type ReservationStatus string

const (
	StatusPending   ReservationStatus = "pending"
	StatusConfirmed ReservationStatus = "confirmed"
	StatusCancelled ReservationStatus = "cancelled"
	StatusCompleted ReservationStatus = "completed"
)

type Reservation struct {
	gorm.Model
	UserID          uint              `gorm:"not null" json:"userId"`
	User            User              `json:"user,omitempty"`
	EstablishmentID uint              `gorm:"not null" json:"establishmentId"`
	Establishment   Establishment     `json:"establishment,omitempty"`
	CheckInDate     time.Time         `gorm:"not null" json:"checkInDate"`
	CheckOutDate    *time.Time        `json:"checkOutDate"`
	GuestsCount     int               `gorm:"default:1" json:"guestsCount"`
	TotalPriceFCFA  int64             `json:"totalPriceFcfa"`
	Status          ReservationStatus `gorm:"default:pending" json:"status"`
	SpecialRequests string            `json:"specialRequests"`
}
