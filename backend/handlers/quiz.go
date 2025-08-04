// handlers/quiz.go
package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"tutor_genX/utils"

	"github.com/golang-jwt/jwt/v5"
	"github.com/sashabaranov/go-openai"
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
	_, ok := r.Context().Value(utils.UserContextKey).(jwt.MapClaims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

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

	//setup groq
	apiKey := os.Getenv("GROQ_API_KEY")
	if apiKey == "" {
		http.Error(w, "GROQ_API_KEY not set", http.StatusInternalServerError)
		return
	}
	cfg := openai.DefaultConfig(apiKey)
	cfg.BaseURL = "https://api.groq.com/openai/v1"
	client := openai.NewClientWithConfig(cfg)

	prompt := fmt.Sprintf(`
You are an expert tutor.

Create a multiple choice quiz from the explanation below. 
Each question should be based on the content.

Respond in ONLY this JSON format:
{
  "quiz": [
    {
      "question": "string",
      "options": ["A", "B", "C"],
      "answer": "B"
    }
  ]
}

Topic: %s

Explanation:
%s
`, req.Topic, req.Explanation)

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
	var quiz QuizResponse
	if err := json.Unmarshal([]byte(resp.Choices[0].Message.Content), &quiz); err != nil {
		http.Error(w, "Failed to parse quiz", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(quiz)
}
