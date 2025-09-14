package models

import "gorm.io/gorm"

// QuizSet is a model for a user's generated quiz from a PDF.
type QuizSet struct {
	gorm.Model
	UserEmail string `json:"user_email"`
	PDFText   string `gorm:"type:text" json:"pdf_text"`
	Quiz      string `gorm:"type:text" json:"quiz"`
}
