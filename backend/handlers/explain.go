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
	"github.com/sashabaranov/go-openai"
	"gorm.io/gorm"
)

type ExplainTopicRequest struct {
	Topic string `json:"topic"`
}

type ExplainTopicResponse struct {
	Explanation string `json:"explanation"`
}

func ExplainTopicHandler(w http.ResponseWriter, r *http.Request) {
	// Auth check
	claims, ok := r.Context().Value(utils.UserContextKey).(jwt.MapClaims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	userID := claims["email"].(string)
	// Parse request body
	var req ExplainTopicRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Topic == "" {
		http.Error(w, "Invalid request: topic is required", http.StatusBadRequest)
		return
	}

	//check for existing content in the db
	var content models.Content
	result := db.DB.Where("user_id = ? AND topic = ?", userID, req.Topic).First(&content)
	if result.Error == nil {
		// Content entry exists. Check if the explanation is already saved.
		if content.Explanation != "" {
			// Found in cache, return immediately
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(ExplainTopicResponse{Explanation: content.Explanation})
			return
		}
		// If Explanation is empty, we will proceed to generate it.

	} else if result.Error != gorm.ErrRecordNotFound {
		http.Error(w, "Database error", http.StatusInternalServerError)
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

	// Prompt
	prompt := fmt.Sprintf(`Explain the following topic like you're teaching a beginner. Your explanation should be clear, concise, and easy to read.

Use the following Markdown formatting to structure your response:
- Use **bold** text for key terms and important concepts.
- Use headings (## and ###) to break the content into logical sections.
- Use bullet points (*) or numbered lists (1.) for step-by-step instructions or to list related concepts.
- Use code blocks (`+"```"+`) for any code snippets or technical examples.
- Use blockquotes (>) for important notes, tips, or warnings.

**Important:** Focus on clear explanations using text, headings, lists, and code blocks only. Do not create tables, diagrams, or use pipe symbols (|) in your response.

Topic: %s`, req.Topic)

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

	explanation := resp.Choices[0].Message.Content

	//Save the new explanation to the db
	if result.Error == gorm.ErrRecordNotFound {
		// No entry exists yet, create a new one
		newContent := models.Content{
			UserID:      userID,
			Topic:       req.Topic,
			Explanation: explanation,
		}
		db.DB.Create(&newContent)
	} else {
		// Entry exists, update the specific field
		db.DB.Model(&content).Where("user_id = ? AND topic = ?", userID, req.Topic).Update("explanation", explanation)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ExplainTopicResponse{
		Explanation: explanation,
	})
}
