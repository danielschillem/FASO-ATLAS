package models

import (
	"time"

	"github.com/lib/pq"
)

type AdPlacement string

const (
	AdPlacementBanner  AdPlacement = "banner"
	AdPlacementCard    AdPlacement = "card"
	AdPlacementSidebar AdPlacement = "sidebar"
)

type Ad struct {
	Base
	Title       string         `gorm:"not null" json:"title"`
	PartnerName string         `gorm:"not null" json:"partnerName"`
	Placement   AdPlacement    `gorm:"not null" json:"placement"`
	ImageURL    string         `gorm:"not null" json:"imageUrl"`
	LinkURL     string         `gorm:"not null" json:"linkUrl"`
	AltText     string         `gorm:"default:''" json:"altText"`
	Pages       pq.StringArray `gorm:"type:text[]" json:"pages"`
	Priority    int            `gorm:"default:0" json:"priority"`
	Impressions int64          `gorm:"default:0" json:"impressions"`
	Clicks      int64          `gorm:"default:0" json:"clicks"`
	IsActive    bool           `gorm:"default:true" json:"isActive"`
	StartsAt    *time.Time     `json:"startsAt"`
	EndsAt      *time.Time     `json:"endsAt"`
}
