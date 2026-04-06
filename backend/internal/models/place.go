package models

import (
	"github.com/lib/pq"
	"gorm.io/gorm"
)

type PlaceType string

const (
	PlaceSite    PlaceType = "site"
	PlaceHotel   PlaceType = "hotel"
	PlaceNature  PlaceType = "nature"
	PlaceCulture PlaceType = "culture"
)

type Place struct {
	gorm.Model
	Name        string    `gorm:"not null" json:"name"`
	Slug        string    `gorm:"uniqueIndex" json:"slug"`
	Type        PlaceType `gorm:"not null" json:"type"`
	Description string    `json:"description"`
	Latitude    float64   `gorm:"not null" json:"lat"`
	Longitude   float64   `gorm:"not null" json:"lng"`
	RegionID    *uint     `json:"regionId"`
	Region      Region    `json:"region,omitempty"`
	Images      []PlaceImage `json:"images,omitempty"`
	Rating      float64   `gorm:"default:0" json:"rating"`
	ReviewCount int       `gorm:"default:0" json:"reviewCount"`
	Tags        pq.StringArray `gorm:"type:text[]" json:"tags"`
	IsActive    bool      `gorm:"default:true" json:"isActive"`
}

type PlaceImage struct {
	gorm.Model
	PlaceID   uint   `gorm:"not null" json:"placeId"`
	URL       string `gorm:"not null" json:"url"`
	Caption   string `json:"caption"`
	SortOrder int    `gorm:"default:0" json:"sortOrder"`
}
