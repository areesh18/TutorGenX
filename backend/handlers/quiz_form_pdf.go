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

type QuizRequest2 struct {
	PDFtext string `json:"pdftext"`
}

func GenerateQuizFromPdf(w http.ResponseWriter, r *http.Request) {
	//jwt validation
	_, ok := r.Context().Value(utils.UserContextKey).(jwt.MapClaims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	/* userID := claims["email"].(string) */

	//parse request body
	var req QuizRequest2
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	if req.PDFtext == "" {
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

	prompt := fmt.Sprintf(`You are a quiz generator. Create EXACTLY 3-5 multiple choice questions based ONLY on the provided text.

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

text: %s

Generate quiz now:`, req.PDFtext)

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
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(generatedQuiz)
}
