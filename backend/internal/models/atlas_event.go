package models

import "github.com/lib/pq"

type HistoricalEra string

const (
	EraMossi        HistoricalEra = "mossi"
	EraBobo         HistoricalEra = "bobo"
	EraColonial     HistoricalEra = "colonial"
	EraIndependance HistoricalEra = "independance"
	EraSankara      HistoricalEra = "sankara"
)

type AtlasEvent struct {
	Base
	Era         HistoricalEra  `gorm:"not null" json:"era"`
	Year        int            `json:"year"`
	Title       string         `gorm:"not null" json:"title"`
	Subtitle    string         `json:"subtitle"`
	Description string         `json:"description"`
	Tags        pq.StringArray `gorm:"type:text[]" json:"tags"`
	ImageURL    string         `json:"imageUrl"`
	GradientCSS string         `json:"gradientCss"`
	SortOrder   int            `json:"sortOrder"`
}
