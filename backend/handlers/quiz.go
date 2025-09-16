// handlers/quiz.go
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

type QuizRequest struct {
	Topic       string `json:"topic"`
	Explanation string `json:"explanation"`
}

type QuizQuestion struct {
	Question string   `json:"question"`
	Options  []string `json:"options"`
	Answer   string   `json:"answer"` // You might hide this on frontend
}

type QuizResponse struct {
	Quiz []QuizQuestion `json:"quiz"`
}

func GenerateQuiz(w http.ResponseWriter, r *http.Request) {
	//jwt validation
	claims, ok := r.Context().Value(utils.UserContextKey).(jwt.MapClaims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	userID := claims["email"].(string)

	//parse request body
	var req QuizRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	if req.Topic == "" || req.Explanation == "" {
		http.Error(w, "Topic and explanation are required", http.StatusBadRequest)
		return
	}
	//check for exisitng content in the db
	var content models.Content
	result := db.DB.Where("user_id = ? AND topic = ?", userID, req.Topic).First(&content)
	if result.Error == nil {
		//Content exists.check if the quiz field already exists.
		if content.Quiz != "" {
			var cachedQuiz QuizResponse
			if err := json.Unmarshal([]byte(content.Quiz), &cachedQuiz); err != nil {
				http.Error(w, "Failed to parse cached quiz", http.StatusInternalServerError)
				return
			}

			//Found in cache,return immediately
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(cachedQuiz)
			return
		}
		// If Quiz is empty, we will proceed to generate it.
	} else if result.Error != gorm.ErrRecordNotFound {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	//content not in cache generate it
	//setup groq
	apiKey := os.Getenv("GROQ_API_KEY")
	if apiKey == "" {
		http.Error(w, "GROQ_API_KEY not set", http.StatusInternalServerError)
		return
	}
	cfg := openai.DefaultConfig(apiKey)
	cfg.BaseURL = "https://api.groq.com/openai/v1"
	client := openai.NewClientWithConfig(cfg)

	prompt := fmt.Sprintf(`You are a quiz generator. Create EXACTLY 3-5 multiple choice questions based ONLY on the provided explanation.

STRICT REQUIREMENTS:
1. Base questions ONLY on facts explicitly mentioned in the explanation
2. Each question must have EXACTLY 4 options (A, B, C, D)
3. Only ONE option can be correct
4. Incorrect options must be plausible but clearly wrong
5. Do not add external knowledge not present in the explanation
6. Questions must be factual, not opinion-based

OUTPUT FORMAT (JSON only, no markdown or extra text):
{
  "quiz": [
    {
      "question": "Clear, specific question based on explanation content?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option B"
    }
  ]
}

VALIDATION:
- If explanation is too short for 3 questions, create fewer but high-quality ones
- If explanation contains no factual content, return: {"quiz": [], "error": "Insufficient content for quiz generation"}

Topic: %s
Explanation: %s

Generate quiz now:`, req.Topic, req.Explanation)

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
		http.Error(w, "Failed to generate quiz: "+err.Error(), http.StatusInternalServerError)
		return
	}
	var generatedQuiz QuizResponse
	if err := json.Unmarshal([]byte(resp.Choices[0].Message.Content), &generatedQuiz); err != nil {
		http.Error(w, "Failed to parse quiz", http.StatusInternalServerError)
		return
	}
	//save the new quiz to the db
	quizJSON, _ := json.Marshal(generatedQuiz)

	if result.Error == gorm.ErrRecordNotFound {
		// No entry exists yet, create a new one
		newContent := models.Content{
			UserID: userID,
			Topic:  req.Topic,
			Quiz:   string(quizJSON),
		}
		db.DB.Create(&newContent)
	} else {
		// Entry exists, update the specific field
		db.DB.Model(&content).Where("user_id = ? AND topic = ?", userID, req.Topic).Update("quiz", string(quizJSON))
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(generatedQuiz)
}
func DeleteAllQuizzes(w http.ResponseWriter, r *http.Request) {
	// Get user email from JWT claims
	claims, ok := r.Context().Value(utils.UserContextKey).(jwt.MapClaims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	userEmail := claims["email"].(string)

	// Delete all flashcard sets for this user
	if err := db.DB.Where("user_email = ?", userEmail).Delete(&models.QuizSet{}).Error; err != nil {
		http.Error(w, "Failed to delete quizzes", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "All quizzes deleted"}`))
}
func DeleteQuiz(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(utils.UserContextKey).(jwt.MapClaims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	userEmail := claims["email"].(string)

	// Get ID from query param
	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		http.Error(w, "Missing Quiz ID", http.StatusBadRequest)
		return
	}

	var quizset models.QuizSet
	if err := db.DB.First(&quizset, "id = ? AND user_email = ?", idStr, userEmail).Error; err != nil {
		http.Error(w, "Quiz not found", http.StatusNotFound)
		return
	}

	if err := db.DB.Delete(&quizset).Error; err != nil {
		http.Error(w, "Failed to delete Quiz", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "Quiz deleted successfully"}`))
}
