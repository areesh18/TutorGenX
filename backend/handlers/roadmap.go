package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"tutor_genX/db"
	"tutor_genX/models"
	"tutor_genX/utils"

	"github.com/golang-jwt/jwt/v5"
	"github.com/sashabaranov/go-openai"
)

type RoadmapRequest struct {
	Goal string `json:"goal"`
}

/* type RoadmapItem struct {
	Week  int    `json:"week"`
	Topic string `json:"topic"`
} */
/* type RoadmapResponse struct {
	Goal    string        `json:"goal"`
	Roadmap []RoadmapItem `json:"roadmap"`
} */
type RoadmapWeek struct {
	Week   int      `json:"week"`
	Title  string   `json:"title"`
	Topics []string `json:"topics"`
}

/*
	 func HandleRoadmap(w http.ResponseWriter, r *http.Request) {
		//getting user info from jwt
		_, ok := r.Context().Value(utils.UserContextKey).(jwt.MapClaims)
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		var req RoadmapRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid Request", http.StatusBadRequest)
			return
		}
		apiKey := os.Getenv("GROQ_API_KEY")
		if apiKey == "" {
			http.Error(w, "GROQ_API_KEY not set in .env", http.StatusInternalServerError)
			return
		}
		cfg := openai.DefaultConfig(apiKey)
		cfg.BaseURL = "https://api.groq.com/openai/v1" // Important: use Groq base URL

		client := openai.NewClientWithConfig(cfg)

		prompt := `You are an expert career coach.
		If the following input is not a valid career or learning goal, respond only with {"error": "Invalid goal"}.

Otherwise,Create a structured weekly learning roadmap in JSON format for the following goal:

"` + req.Goal + `"

Respond ONLY with JSON in this format:

[

	{
	  "week": 1,
	  "title": "Topic Name",
	  "topics": [
	    "One thing to learn",
	    "Another topic to cover",
	    "Optional assignments"
	  ]
	},
	...

]
`

		resp, err := client.CreateChatCompletion(
			context.Background(),
			openai.ChatCompletionRequest{
				Model: "llama-3.3-70b-versatile",
				Messages: []openai.ChatCompletionMessage{
					{
						Role:    openai.ChatMessageRoleUser,
						Content: prompt,
					},
				},
			},
		)

		if err != nil {
			http.Error(w, "Failed to generate roadmap: "+err.Error(), http.StatusInternalServerError)
			return
		}
		var roadmap []RoadmapWeek
		if err := json.Unmarshal([]byte(resp.Choices[0].Message.Content), &roadmap); err != nil {
			http.Error(w, "Failed to parse roadmap JSON: "+err.Error(), http.StatusInternalServerError)
			return
		}
		claims := r.Context().Value(utils.UserContextKey).(jwt.MapClaims)
		userEmail := claims["email"].(string)

		//creating a roadmap record in db
		newRoadmap := models.Roadmap{
			UserEmail: userEmail,
			Goal:      req.Goal,
		}
		if err := db.DB.Create(&newRoadmap).Error; err != nil {
			http.Error(w, "Failed to save roadmap", http.StatusInternalServerError)
			return
		}
		// Save each week
		for _, week := range roadmap {
			topicsJSON, err := json.Marshal(week.Topics)
			if err != nil {
				http.Error(w, "Failed to serialize topics", http.StatusInternalServerError)
				return
			}

			db.DB.Create(&models.RoadmapWeek{
				RoadmapID: newRoadmap.ID,
				Week:      week.Week,
				Title:     week.Title,
				Topics:    string(topicsJSON),
			})
		}
		json.NewEncoder(w).Encode(map[string]interface{}{
			"goal":    req.Goal,
			"roadmap": roadmap,
		})
	}
*/
func DeleteAllRoadmaps(w http.ResponseWriter, r *http.Request) {
	// Step 1: Get user email from JWT claims
	claims, ok := r.Context().Value(utils.UserContextKey).(jwt.MapClaims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	userEmail := claims["email"].(string)

	// Step 2: First find all roadmaps by this user
	var roadmaps []models.Roadmap
	if err := db.DB.Where("user_email = ?", userEmail).Find(&roadmaps).Error; err != nil {
		http.Error(w, "Failed to fetch roadmaps", http.StatusInternalServerError)
		return
	}

	// Step 3: Collect all roadmap IDs
	var roadmapIDs []uint
	for _, roadmap := range roadmaps {
		roadmapIDs = append(roadmapIDs, roadmap.ID)
	}

	// Step 4: Delete all associated weeks first
	if len(roadmapIDs) > 0 {
		if err := db.DB.Where("roadmap_id IN ?", roadmapIDs).Delete(&models.RoadmapWeek{}).Error; err != nil {
			http.Error(w, "Failed to delete roadmap weeks", http.StatusInternalServerError)
			return
		}
	}

	// Step 5: Delete the roadmaps
	if err := db.DB.Where("user_email = ?", userEmail).Delete(&models.Roadmap{}).Error; err != nil {
		http.Error(w, "Failed to delete roadmaps", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("All roadmaps deleted"))
}

func DeleteRoadmap(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(utils.UserContextKey).(jwt.MapClaims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	userEmail := claims["email"].(string)

	// Get ID from query param
	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		http.Error(w, "Missing roadmap ID", http.StatusBadRequest)
		return
	}

	var roadmap models.Roadmap
	if err := db.DB.Preload("Weeks").First(&roadmap, "id = ? AND user_email = ?", idStr, userEmail).Error; err != nil {
		http.Error(w, "Roadmap not found", http.StatusNotFound)
		return
	}

	// Delete the roadmap and related weeks
	if err := db.DB.Delete(&roadmap).Error; err != nil {
		http.Error(w, "Failed to delete roadmap", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "Roadmap deleted successfully"}`))
}

func HandleRoadmap(w http.ResponseWriter, r *http.Request) {
	// Validate JWT
	claims, ok := r.Context().Value(utils.UserContextKey).(jwt.MapClaims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	userEmail := claims["email"].(string)

	// Parse request body
	var req RoadmapRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid Request", http.StatusBadRequest)
		return
	}

	// Setup Groq
	apiKey := os.Getenv("GROQ_API_KEY")
	if apiKey == "" {
		http.Error(w, "GROQ_API_KEY not set in .env", http.StatusInternalServerError)
		return
	}
	cfg := openai.DefaultConfig(apiKey)
	cfg.BaseURL = "https://api.groq.com/openai/v1"
	client := openai.NewClientWithConfig(cfg)

	// Smart prompt with validation
	prompt := `You are an expert career coach.
If the input is not a valid career or learning goal, respond only with:
{"error": "Invalid goal"}

Otherwise, generate a weekly roadmap in this JSON format:

[
  {
    "week": 1,
    "title": "Title of the week",
    "topics": ["Topic A", "Topic B", "Topic C"]
  }
]

Goal:
` + req.Goal

	// Call Groq
	resp, err := client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: "llama-3.3-70b-versatile",
			Messages: []openai.ChatCompletionMessage{
				{Role: openai.ChatMessageRoleUser, Content: prompt},
			},
		},
	)
	if err != nil {
		http.Error(w, "Failed to generate roadmap: "+err.Error(), http.StatusInternalServerError)
		return
	}

	content := resp.Choices[0].Message.Content

	// Check if Groq said it's an invalid goal
	if content == `{"error": "Invalid goal"}` {
		http.Error(w, "Please enter a valid career or learning goal.", http.StatusBadRequest)
		return
	}

	// Try parsing roadmap
	var roadmap []RoadmapWeek
	if err := json.Unmarshal([]byte(content), &roadmap); err != nil || len(roadmap) == 0 {
		http.Error(w, "Failed to parse roadmap. Ensure your goal is clear and well-formed.", http.StatusBadRequest)
		return
	}

	// Save roadmap to DB
	newRoadmap := models.Roadmap{
		UserEmail: userEmail,
		Goal:      req.Goal,
	}
	if err := db.DB.Create(&newRoadmap).Error; err != nil {
		http.Error(w, "Failed to save roadmap", http.StatusInternalServerError)
		return
	}

	for _, week := range roadmap {
		topicsJSON, err := json.Marshal(week.Topics)
		if err != nil {
			http.Error(w, "Failed to serialize topics", http.StatusInternalServerError)
			return
		}
		progress := make([]bool, len(week.Topics))
		progressJSON, err := json.Marshal(progress)
		if err != nil {
			http.Error(w, "Failed to serialize progress", http.StatusInternalServerError)
			return
		}

		db.DB.Create(&models.RoadmapWeek{
			RoadmapID: newRoadmap.ID,
			Week:      week.Week,
			Title:     week.Title,
			Topics:    string(topicsJSON),
			Progress:  string(progressJSON),
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"goal":    req.Goal,
		"roadmap": roadmap,
	})
}
func UpdateProgress(w http.ResponseWriter, r *http.Request) {
	// Auth check
	claims, ok := r.Context().Value(utils.UserContextKey).(jwt.MapClaims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	userEmail := claims["email"].(string)

	// Parse input
	var req struct {
		RoadmapID  uint `json:"roadmap_id"`
		WeekID     uint `json:"week_id"`
		TopicIndex int  `json:"topic_index"`
		Value      bool `json:"value"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Find the roadmap week
	var week models.RoadmapWeek
	if err := db.DB.First(&week, req.WeekID).Error; err != nil {
		http.Error(w, "Week not found", http.StatusNotFound)
		return
	}

	// Validate that the week belongs to a roadmap owned by the user
	var roadmap models.Roadmap
	if err := db.DB.First(&roadmap, req.RoadmapID).Error; err != nil || roadmap.UserEmail != userEmail {
		http.Error(w, "Not authorized", http.StatusForbidden)
		return
	}

	// Update the progress
	var progress []bool
	if week.Progress == "" {
		// Initialize progress slice with default values
		progress = make([]bool, 10) // or whatever length makes sense
	} else {
		if err := json.Unmarshal([]byte(week.Progress), &progress); err != nil {
			log.Println("Error parsing week.Progress:", week.Progress, err)
			http.Error(w, "Failed to parse progress", http.StatusInternalServerError)
			return
		}
	}
	if req.TopicIndex < 0 || req.TopicIndex >= len(progress) {
		http.Error(w, "Invalid topic index", http.StatusBadRequest)
		return
	}
	progress[req.TopicIndex] = req.Value

	// Save back to DB
	progressJSON, _ := json.Marshal(progress)
	week.Progress = string(progressJSON)

	if err := db.DB.Save(&week).Error; err != nil {
		http.Error(w, "Failed to update progress", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func GetUsersRoadmap(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(utils.UserContextKey).(jwt.MapClaims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	userEmail := claims["email"].(string)

	var roadmaps []models.Roadmap
	result := db.DB.Preload("Weeks").Where("user_email = ?", userEmail).Order("created_at desc").Find(&roadmaps)

	if result.Error != nil {
		fmt.Println("DB Error:", result.Error)
		http.Error(w, "Failed to fetch roadmaps", http.StatusInternalServerError)
		return
	}

	fmt.Println("Fetched roadmaps count:", len(roadmaps)) // Optional log

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(roadmaps)
}

func TestPreload(w http.ResponseWriter, r *http.Request) {
	var roadmap models.Roadmap

	err := db.DB.Preload("Weeks").First(&roadmap).Error
	if err != nil {
		fmt.Println("Preload error:", err)
		http.Error(w, "Error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Printf("Fetched: %+v\n", roadmap)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(roadmap)
}
