package models

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"gorm.io/gorm"
)

type GeoJSON map[string]interface{}

func (g GeoJSON) Value() (driver.Value, error) {
	if g == nil {
		return nil, nil
	}
	b, err := json.Marshal(g)
	return string(b), err
}

func (g *GeoJSON) Scan(value interface{}) error {
	if value == nil {
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("GeoJSON: cannot scan type %T", value)
	}
	return json.Unmarshal(bytes, g)
}

type Region struct {
	gorm.Model
	Name    string  `gorm:"not null" json:"name"`
	Capital string  `json:"capital"`
	Code    string  `gorm:"uniqueIndex" json:"code"`
	GeoJSON GeoJSON `gorm:"type:jsonb" json:"geojson,omitempty"`

	Places []Place `json:"-"`
}
