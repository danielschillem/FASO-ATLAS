package models

import "github.com/lib/pq"

type EstablishmentType string

const (
	TypeHotel      EstablishmentType = "hotel"
	TypeRestaurant EstablishmentType = "restaurant"
	TypeGite       EstablishmentType = "gite"
	TypeCamp       EstablishmentType = "camp"
)

type Establishment struct {
	Base
	PlaceID      uint              `gorm:"not null" json:"placeId"`
	Place        Place             `json:"place,omitempty"`
	OwnerID      *uint             `json:"ownerId"`
	Owner        User              `json:"owner,omitempty"`
	Type         EstablishmentType `gorm:"not null" json:"type"`
	PriceMinFCFA int64             `json:"priceMinFcfa"`
	PriceMaxFCFA int64             `json:"priceMaxFcfa"`
	Stars        int               `gorm:"check:stars >= 1 AND stars <= 5" json:"stars"`
	Amenities    pq.StringArray    `gorm:"type:text[]" json:"amenities"`
	PhoneNumber  string            `json:"phone"`
	Email        string            `json:"email"`
	Website      string            `json:"website"`
	IsAvailable  bool              `gorm:"default:true" json:"isAvailable"`

	Reservations []Reservation `json:"-"`
}

type Review struct {
	Base
	UserID          uint   `gorm:"not null" json:"userId"`
	User            User   `json:"user,omitempty"`
	PlaceID         *uint  `json:"placeId"`
	EstablishmentID *uint  `json:"establishmentId"`
	Rating          int    `gorm:"check:rating >= 1 AND rating <= 5" json:"rating"`
	Comment         string `json:"comment"`
}
