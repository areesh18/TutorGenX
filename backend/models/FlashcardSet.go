package models

import "gorm.io/gorm"

// FlashcardSet is a model for a user's generated flashcards from a PDF.
type FlashcardSet struct {
	gorm.Model
	UserEmail  string `json:"user_email"`
	Title      string `json:"title"`
	PDFText    string `gorm:"type:text" json:"pdf_text"`
	Flashcards string `gorm:"type:text" json:"flashcards"`
}
