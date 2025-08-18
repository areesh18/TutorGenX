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

	prompt := fmt.Sprintf(`You are an expert teacher who makes even the most complex topics super easy to understand. 
Your job is to take a detailed explanation and rewrite it in the simplest way possible, as if you’re teaching a curious 12-year-old. 

Guidelines for your explanation:
- ✅ Use **simple, everyday language** (avoid technical jargon unless explained in plain words).
- ✅ Keep sentences **short and clear**.
- ✅ Use **analogies and real-world comparisons** (e.g., "Think of X like...").
- ✅ Add **fun emojis** to keep it engaging 🎉📚✨
- ✅ Break down concepts into **steps, bullet points, or short lists** for clarity.
- ✅ Use **mini examples** where helpful.
- ✅ Keep a **friendly, encouraging tone** (like a kind teacher or mentor).
- ❌ Do not add extra commentary or instructions — just return the simplified explanation.

Topic: %s

Original Explanation:
%s`, req.Topic, req.Explanation)

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
