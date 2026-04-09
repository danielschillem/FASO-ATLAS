package models

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
)

// NotificationType defines the kind of notification.
type NotificationType string

const (
	NotifReservationConfirmed NotificationType = "reservation_confirmed"
	NotifReservationCancelled NotificationType = "reservation_cancelled"
	NotifDepartureReminder    NotificationType = "departure_reminder"
	NotifReviewReply          NotificationType = "review_reply"
	NotifNewReview            NotificationType = "new_review"
)

// Notification is a user-facing notification.
type Notification struct {
	Base
	UserID uint             `gorm:"not null" json:"userId"`
	Type   NotificationType `gorm:"not null" json:"type"`
	Title  string           `gorm:"not null" json:"title"`
	Body   string           `gorm:"not null" json:"body"`
	Data   JSONMap          `gorm:"type:jsonb;default:'{}'" json:"data"`
	IsRead bool             `gorm:"default:false" json:"isRead"`
}

// JSONMap is a map for JSONB columns.
type JSONMap map[string]interface{}

func (j JSONMap) Value() (driver.Value, error) {
	if j == nil {
		return "{}", nil
	}
	b, err := json.Marshal(j)
	return string(b), err
}

func (j *JSONMap) Scan(value interface{}) error {
	if value == nil {
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("JSONMap: cannot scan type %T", value)
	}
	return json.Unmarshal(bytes, j)
}
