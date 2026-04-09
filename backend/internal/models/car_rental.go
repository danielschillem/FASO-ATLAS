package models

import "github.com/lib/pq"

type CarCategory string

const (
	CarEconomique  CarCategory = "economique"
	CarConfort     CarCategory = "confort"
	CarSUV         CarCategory = "suv"
	CarLuxe        CarCategory = "luxe"
	CarUtilitaire  CarCategory = "utilitaire"
)

type CarRental struct {
	Base
	OwnerID      *uint          `json:"ownerId"`
	Owner        User           `json:"owner,omitempty"`
	RegionID     *uint          `json:"regionId"`
	Region       Region         `json:"region,omitempty"`
	Brand        string         `gorm:"not null" json:"brand"`
	Model        string         `gorm:"not null" json:"model"`
	Year         int            `json:"year"`
	Category     CarCategory    `gorm:"not null" json:"category"`
	Seats        int            `gorm:"default:5" json:"seats"`
	Transmission string         `gorm:"default:manuelle" json:"transmission"`
	FuelType     string         `gorm:"default:essence" json:"fuelType"`
	PricePerDay  int64          `gorm:"not null" json:"pricePerDay"`
	DepositFCFA  int64          `gorm:"default:0" json:"depositFcfa"`
	Features     pq.StringArray `gorm:"type:text[]" json:"features"`
	ImageURL     string         `json:"imageUrl"`
	Phone        string         `json:"phone"`
	WhatsApp     string         `gorm:"column:whatsapp" json:"whatsapp"`
	IsAvailable  bool           `gorm:"default:true" json:"isAvailable"`
	Lat          float64        `json:"lat"`
	Lng          float64        `json:"lng"`
	City         string         `json:"city"`
}
