package models

import "gorm.io/gorm"

type FavoriteType string

const (
	FavoritePlace     FavoriteType = "place"
	FavoriteItinerary FavoriteType = "itinerary"
)

type Favorite struct {
	gorm.Model
	UserID      uint         `gorm:"uniqueIndex:idx_user_favorite;not null" json:"userId"`
	TargetID    uint         `gorm:"uniqueIndex:idx_user_favorite;not null" json:"targetId"`
	TargetType  FavoriteType `gorm:"uniqueIndex:idx_user_favorite;not null" json:"targetType"`
}
