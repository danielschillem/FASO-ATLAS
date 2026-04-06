package models

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"

	"github.com/lib/pq"
	"gorm.io/gorm"
)

type InfoboxData map[string]string

func (i InfoboxData) Value() (driver.Value, error) {
	if i == nil {
		return nil, nil
	}
	b, err := json.Marshal(i)
	return string(b), err
}

func (i *InfoboxData) Scan(value interface{}) error {
	if value == nil {
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("InfoboxData: cannot scan type %T", value)
	}
	return json.Unmarshal(bytes, i)
}

type WikiArticle struct {
	gorm.Model
	Slug        string         `gorm:"uniqueIndex;not null" json:"slug"`
	Title       string         `gorm:"not null" json:"title"`
	Subtitle    string         `json:"subtitle"`
	Category    string         `json:"category"`
	LeadText    string         `json:"leadText"`
	BodyHTML    string         `json:"bodyHtml"`
	InfoboxData InfoboxData    `gorm:"type:jsonb" json:"infoboxData"`
	Tags        pq.StringArray `gorm:"type:text[]" json:"tags"`
	AuthorID    *uint          `json:"authorId"`
	Author      User           `json:"author,omitempty"`
	IsApproved  bool           `gorm:"default:false" json:"isApproved"`
	ViewCount   int            `gorm:"default:0" json:"viewCount"`

	Revisions []WikiRevision `gorm:"foreignKey:ArticleID" json:"revisions,omitempty"`
}

type WikiRevision struct {
	gorm.Model
	ArticleID uint   `gorm:"not null" json:"articleId"`
	AuthorID  uint   `gorm:"not null" json:"authorId"`
	Author    User   `json:"author,omitempty"`
	BodyHTML  string `json:"bodyHtml"`
	Summary   string `json:"summary"`
}
