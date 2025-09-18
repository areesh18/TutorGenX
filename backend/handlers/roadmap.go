package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"tutor_genX/db"
	"tutor_genX/models"
	"tutor_genX/utils"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/mux"
	"github.com/sashabaranov/go-openai"
	"gorm.io/gorm"
)

type RoadmapRequest struct {
	Goal          string `json:"goal"`
	Motivation    string `json:"motivation"`    // e.g., "exam", "career", "hobby", "project"
	LearningStyle string `json:"learningStyle"` // e.g., "practical", "theoretical", "balanced"
}
type RoadmapWeek struct {
	Week   int      `json:"week"`
	Title  string   `json:"title"`
	Topics []string `json:"topics"`
}

type MarkAsCompletedRequest struct {
	RoadmapID  uint `json:"roadmap_id"`
	WeekID     uint `json:"week_id"`
	TopicIndex int  `json:"topic_index"`
	Value      bool `json:"value"` // true to mark complete, false to mark incomplete
}

func HandleMarkAsCompleted(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(utils.UserContextKey).(jwt.MapClaims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	userEmail := claims["email"].(string)
	var req MarkAsCompletedRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// ✅ Get the roadmap week belonging to this user
	var week models.RoadmapWeek
	if err := db.DB.
		Joins("JOIN roadmaps ON roadmaps.id = roadmap_weeks.roadmap_id").
		Where("roadmap_weeks.id = ? AND roadmaps.user_email = ?", req.WeekID, userEmail).
		First(&week).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			http.Error(w, "Week not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Error fetching roadmap week", http.StatusInternalServerError)
		return
	}

	// ✅ Decode JSON progress (stored as string in DB)
	var progress []bool
	if week.Progress != "" {
		if err := json.Unmarshal([]byte(week.Progress), &progress); err != nil {
			http.Error(w, "Failed to parse progress", http.StatusInternalServerError)
			return
		}
	}

	// ✅ Ensure progress slice is long enough
	if req.TopicIndex >= len(progress) {
		newProgress := make([]bool, req.TopicIndex+1)
		copy(newProgress, progress)
		progress = newProgress
	}

	// ✅ Set topic completion status based on the value sent from frontend
	progress[req.TopicIndex] = req.Value

	// ✅ Convert back to JSON string
	progressJSON, err := json.Marshal(progress)
	if err != nil {
		http.Error(w, "Failed to encode progress", http.StatusInternalServerError)
		return
	}
	week.Progress = string(progressJSON)

	// ✅ Save update
	if err := db.DB.Save(&week).Error; err != nil {
		http.Error(w, "Error updating progress", http.StatusInternalServerError)
		return
	}

	// ✅ Respond with success message
	response := map[string]interface{}{
		"message": "Progress updated successfully",
		"week":    week,
		"status":  req.Value,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
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
	_, ok := r.Context().Value(utils.UserContextKey).(jwt.MapClaims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

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

	prompt := fmt.Sprintf(`You are an expert curriculum designer. Create a personalized learning roadmap based on the user's goal and preferences.

	**User Goal:** "%s"
	**Motivation:** "%s" (Valid values: career, exam, hobby, project)
	**Preferred Learning Style:** "%s" (Valid values: practical, theoretical, balanced)

	**Instructions:**
	1.  **Analyze Context:** Carefully consider the motivation and learning style to tailor the content.
		* If **Motivation is 'career' or 'project'** and **Learning Style is 'practical'**, the roadmap must be 70-80%% project-based, with mini-projects and a capstone project.
		* If **Motivation is 'exam'**, prioritize core concepts, key theories, and include revision/practice test weeks.
		* If **Learning Style is 'theoretical'**, focus on deep dives into concepts, history, and critical analysis.
		* If **Learning Style is 'balanced'**, create a 50/50 split between theory and application.
	2.  **Structure:** Create an 8-16 week roadmap. Each week must have a clear title and 3-5 specific, actionable topics.
	3.  **Progression:** The difficulty must progress logically from foundational to advanced.

	**Output Format (Strict JSON array, no other text):**
	[
	  {
		"week": 1,
		"title": "Week 1 Title",
		"topics": ["Topic 1.1", "Topic 1.2", "Topic 1.3"]
	  }
	]`, req.Goal, req.Motivation, req.LearningStyle)

	// Call Groq with the specialized prompt
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

	// Try parsing roadmap
	var roadmap []RoadmapWeek
	if err := json.Unmarshal([]byte(content), &roadmap); err != nil || len(roadmap) == 0 {
		http.Error(w, "Failed to parse roadmap. Please try a different goal.", http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"goal":    req.Goal,
		"roadmap": roadmap,
	})
}

func SaveRoadmap(w http.ResponseWriter, r *http.Request) {
	//validating jwt
	claims, ok := r.Context().Value(utils.UserContextKey).(jwt.MapClaims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	userEmail := claims["email"].(string)

	var req struct {
		Goal    string        `json:"goal"`
		Title   string        `json:"title"` // Add this line
		Roadmap []RoadmapWeek `json:"roadmap"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Save roadmap to DB
	newRoadmap := models.Roadmap{
		UserEmail: userEmail,
		Goal:      req.Goal,
		Title:     req.Title, // Add this line
	}

	if err := db.DB.Create(&newRoadmap).Error; err != nil {
		http.Error(w, "Failed to save roadmap", http.StatusInternalServerError)
		return
	}

	for _, week := range req.Roadmap {
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

	// Optional: Send success response with the created roadmap ID
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Roadmap saved successfully",
		"id":      newRoadmap.ID,
		"title":   newRoadmap.Title,
	})
}

func GetUsersRoadmap(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(utils.UserContextKey).(jwt.MapClaims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	userEmail := claims["email"].(string)

	var roadmaps []models.Roadmap
	result := db.DB.
		Preload("Weeks", func(db *gorm.DB) *gorm.DB {
			return db.Order("week ASC")
		}).
		Where("user_email = ?", userEmail).
		Order("created_at desc").
		Find(&roadmaps)

	if result.Error != nil {
		fmt.Println("DB Error:", result.Error)
		http.Error(w, "Failed to fetch roadmaps", http.StatusInternalServerError)
		return
	}

	fmt.Println("Fetched roadmaps count:", len(roadmaps)) // Optional log

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(roadmaps)
}
func GetSingleRoadmap(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	roadmapID := vars["id"]
	email := r.Context().Value(utils.UserContextKey).(jwt.MapClaims)["email"].(string)

	var roadmap models.Roadmap
	err := db.DB.Preload("Weeks").Where("id = ? AND user_email = ?", roadmapID, email).First(&roadmap).Error
	if err != nil {
		http.Error(w, "Roadmap not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(roadmap)
}
func GoalNameHandler(w http.ResponseWriter, r *http.Request) {
	// Auth check
	_, ok := r.Context().Value(utils.UserContextKey).(jwt.MapClaims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	//parse request body
	var req struct {
		GoalReq string `json:"goalreq"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.GoalReq == "" {
		http.Error(w, "Invalid request: topic is required", http.StatusBadRequest)
		return
	}
	// Groq API setup
	apiKey := os.Getenv("GROQ_API_KEY")
	if apiKey == "" {
		http.Error(w, "GROQ_API_KEY not set", http.StatusInternalServerError)
		return
	}

	cfg := openai.DefaultConfig(apiKey)
	cfg.BaseURL = "https://api.groq.com/openai/v1"
	client := openai.NewClientWithConfig(cfg)

	//prompt
	prompt := fmt.Sprintf(`You are an AI assistant that generates professional, engaging, and descriptive names for learning roadmaps based on user input.
Task
Transform the user's raw input into a polished roadmap title that is:

Professional: Suitable for a learning platform
Clear: Immediately conveys the learning goal
Engaging: Motivating and appealing to learners
Concise: 3-8 words maximum
Action-oriented: Uses strong verbs when appropriate

Guidelines

Capitalize properly (Title Case)
Remove casual language, typos, and grammatical errors
Focus on the core learning objective
Use industry-standard terminology
Make it specific enough to be meaningful
Avoid overly generic terms

Examples
User Input: "i want to be a data analyst"
Generated Title: "Data Analyst Career Path"
User Input: "learn machine learning for beginners"
Generated Title: "Machine Learning Fundamentals"
User Input: "become full stack developer"
Generated Title: "Full-Stack Development Mastery"
User Input: "want to learn python programming"
Generated Title: "Python Programming Journey"
User Input: "digital marketing course"
Generated Title: "Digital Marketing Specialist Track"
Your Task
Generate a single, well-formatted roadmap title based on the user's input. Return only the title, nothing else.
User Input: %s`, req.GoalReq)

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
		http.Error(w, "Failed to fetch explanation: "+err.Error(), http.StatusInternalServerError)
		return
	}
	title := resp.Choices[0].Message.Content

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"title": title,
	})

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
