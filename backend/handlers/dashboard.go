package handlers

import (
	"encoding/json"
	"net/http"
	"tutor_genX/utils"

	"github.com/golang-jwt/jwt/v5"
)

func DashboardHandler(w http.ResponseWriter, r *http.Request) {
	// Get user claims from context
	claims, ok := r.Context().Value(utils.UserContextKey).(jwt.MapClaims)
	if !ok {
		http.Error(w, "User info not found in context", http.StatusInternalServerError)
		return
	}

	// Return claims as JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Welcome to your dashboard!",
		"user":    claims,
	})
}
