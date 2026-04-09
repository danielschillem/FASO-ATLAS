package models

type Itinerary struct {
	Base
	UserID       uint   `gorm:"not null" json:"userId"`
	User         User   `json:"user,omitempty"`
	Title        string `gorm:"not null" json:"title"`
	Description  string `json:"description"`
	DurationDays int    `json:"durationDays"`
	Difficulty   string `gorm:"default:'modéré'" json:"difficulty"`
	BudgetFCFA   int64  `json:"budgetFcfa"`
	IsPublic     bool   `gorm:"default:false" json:"isPublic"`

	Stops []ItineraryStop `gorm:"foreignKey:ItineraryID;constraint:OnDelete:CASCADE" json:"stops,omitempty"`
}

type ItineraryStop struct {
	Base
	ItineraryID uint   `gorm:"not null" json:"itineraryId"`
	PlaceID     uint   `gorm:"not null" json:"placeId"`
	Place       Place  `json:"place,omitempty"`
	Order       int    `gorm:"not null" json:"order"`
	DayNumber   int    `gorm:"not null" json:"dayNumber"`
	Duration    string `json:"duration"`
	Notes       string `json:"notes"`
}
