package handlers

import (
	"encoding/json"
	"net/http"
	"strings"
	"tutor_genX/db"
	"tutor_genX/models"

	"golang.org/x/crypto/bcrypt"
)

type SignupRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

func HandleSignup(w http.ResponseWriter, r *http.Request) {
	var req SignupRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err !=nil{
		http.Error(w, "Failed to hash password", http.StatusInternalServerError)
		return
	}

	user := models.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: string(hashedPassword),
	}

	if err := db.DB.Create(&user).Error; err != nil {
	if strings.Contains(err.Error(), "duplicate key value") {
		http.Error(w, "Email already registered", http.StatusConflict)
		return
	}
	http.Error(w, "Failed to create user", http.StatusInternalServerError)
	return
}

	//just for now,responding back with the same received data
	response := map[string]string{
		"name":  req.Name,
		"email": req.Email,
	}
	w.Header().Set("Content-type", "application/json")
	json.NewEncoder(w).Encode(response)
}
