package handlers

import (
	"encoding/json"
	"net/http"
	"tutor_genX/db"
	"tutor_genX/models"
	"tutor_genX/utils"

	"github.com/golang-jwt/jwt/v5"
	"gorm.io/gorm"
)

// GetUserQuizzesFromPdf fetches all quiz sets generated from PDFs for the current user.
func GetUserQuizzesFromPdf(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(utils.UserContextKey).(jwt.MapClaims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	userEmail := claims["email"].(string)

	var quizSets []models.QuizSet
	result := db.DB.Where("user_email = ?", userEmail).Order("created_at desc").Find(&quizSets)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			quizSets = []models.QuizSet{} // Return empty array instead of 404
		} else {
			http.Error(w, "Failed to fetch quiz sets", http.StatusInternalServerError)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(quizSets)
}

// GetUserFlashcardsFromPdf fetches all flashcard sets generated from PDFs for the current user.
func GetUserFlashcardsFromPdf(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(utils.UserContextKey).(jwt.MapClaims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	userEmail := claims["email"].(string)

	var flashcardSets []models.FlashcardSet
	result := db.DB.Where("user_email = ?", userEmail).Order("created_at desc").Find(&flashcardSets)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			flashcardSets = []models.FlashcardSet{} // Return empty array instead of 404
		} else {
			http.Error(w, "Failed to fetch flashcard sets", http.StatusInternalServerError)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(flashcardSets)
}
