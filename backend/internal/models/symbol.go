package models

type Symbol struct {
	Base
	Name        string `gorm:"not null" json:"name"`
	Category    string `json:"category"`
	Description string `json:"description"`
	SVGPath     string `gorm:"column:svg_path" json:"svgPath"`
	SortOrder   int    `json:"sortOrder"`
}
