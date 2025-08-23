package models

import (
	"gorm.io/gorm"
)

// Explanation is the model for a user's generated topic explanation.
type Content struct {
	gorm.Model
	UserID string `gorm:"uniqueIndex:idx_user_topic" json:"user_id"`
	Topic  string `gorm:"uniqueIndex:idx_user_topic" json:"topic"`

	Explanation           string `gorm:"type:text" json:"explanation"`
	SimplifiedExplanation string `gorm:"type:text" json:"simplified_explanation"`
	Examples              string `gorm:"type:text" json:"examples"`
	Quiz                  string `gorm:"type:text" json:"quiz"`
}
