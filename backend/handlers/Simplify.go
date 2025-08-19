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

type SimplifyRequest struct {
	Topic       string `json:"topic"`
	Explanation string `json:"explanation"`
}

type SimplifiedResponse struct {
	SimplifiedExplanation string `json:"simplifiedexplanation"`
}

func Simplify(w http.ResponseWriter, r *http.Request) {
	//jwt validation
	_, ok := r.Context().Value(utils.UserContextKey).(jwt.MapClaims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	//parse request body
	var req SimplifyRequest
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

	prompt := fmt.Sprintf(`You are a learning specialist. Rewrite the provided explanation for a 12-year-old audience while preserving ALL key information.

SIMPLIFICATION RULES:
1. Replace jargon with simple terms (provide definitions if needed)
2. Break long sentences into shorter ones (max 15 words each)
3. Use analogies from everyday life (family, school, sports, cooking)
4. Keep all important facts and concepts from original
5. Add structure with bullet points or numbered steps
6. Use encouraging, friendly tone

FORBIDDEN:
- Removing important technical details
- Adding information not in the original explanation
- Using complex analogies or references
- Oversimplifying to the point of inaccuracy

REQUIRED ELEMENTS:
- Start with a simple definition or overview
- Include all key points from original
- End with a summary or connection to real-world use
- Use emojis sparingly (max 3-4 total)

Topic: %s
Original Explanation: %s

Provide simplified version:`, req.Topic, req.Explanation)

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

	// Extract simplified content
	simplified := resp.Choices[0].Message.Content

	// Write JSON response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(SimplifiedResponse{
		SimplifiedExplanation: simplified,
	})

}
