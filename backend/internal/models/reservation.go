package models

import "time"

type ReservationStatus string

const (
	StatusPending   ReservationStatus = "pending"
	StatusConfirmed ReservationStatus = "confirmed"
	StatusCancelled ReservationStatus = "cancelled"
	StatusCompleted ReservationStatus = "completed"
)

type PaymentStatus string

const (
	PaymentNone      PaymentStatus = "none"
	PaymentPending   PaymentStatus = "pending"
	PaymentSucceeded PaymentStatus = "succeeded"
	PaymentFailed    PaymentStatus = "failed"
	PaymentRefunded  PaymentStatus = "refunded"
)

type Reservation struct {
	Base
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
	PaymentIntentID string            `gorm:"index" json:"paymentIntentId,omitempty"`
	PaymentStatus   PaymentStatus     `gorm:"default:none" json:"paymentStatus"`
}
