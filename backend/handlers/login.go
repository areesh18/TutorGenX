package handlers

import (
	"encoding/json"
	"net/http"
	"strings"
	"tutor_genX/db"
	"tutor_genX/models"
	"tutor_genX/utils"

	"golang.org/x/crypto/bcrypt"
)

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func HandleLogin(w http.ResponseWriter, r *http.Request) {

	w.Header().Set("Content-type", "application/json")

	var req LoginRequest
	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request"}`, http.StatusBadRequest)
		return
	}

	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	if err := db.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		http.Error(w, `{"error":"Email not found"}`, http.StatusUnauthorized)
		return
	}

	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		http.Error(w, `{"error":"Incorrect password"}`, http.StatusUnauthorized)
		return
	}

	tokenString, err := utils.CreateToken(user.Email, user.Name)
	if err != nil {
		http.Error(w, `{"error":"Failed to generate token"}`, http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Login successful",
		"name":    user.Name,
		"token":   tokenString,
	})
}
