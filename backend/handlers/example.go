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

type ExampleRequest struct {
	Topic       string `json:"topic"`
	Explanation string `json:"explanation"`
}
type Example struct {
	Title       string `json:"title"`
	Explanation string `json:"explanation"`
	Highlight   string `json:"highlight"`
	Code        string `json:"code"` // Optional; can be empty
}

type ExamplesResponse struct {
	Examples []Example `json:"examples"`
}

func GenerateExamples(w http.ResponseWriter, r *http.Request) {
	//jwt validation
	claims, ok := r.Context().Value(utils.UserContextKey).(jwt.MapClaims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	userID := claims["email"].(string)
	//parse request Body

	var req ExampleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid Request", http.StatusBadRequest)
		return
	}
	if req.Topic == "" || req.Explanation == "" {
		http.Error(w, "Topic and explanation are required", http.StatusBadRequest)
		return
	}

	//check for exisitng content in the db
	var content models.Content
	result := db.DB.Where("user_id=? AND topic=?", userID, req.Topic).First(&content)

	if result.Error == nil {
		//Content entry exists. Check if the exmaples field exists already
		if content.Examples != "" {
			var cachedExamples ExamplesResponse
			if err := json.Unmarshal([]byte(content.Examples), &cachedExamples); err != nil {
				http.Error(w, "Failed to parse cached examples", http.StatusInternalServerError)
				return
			}
			// Found in cache, return immediately
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(cachedExamples)
			return
		}
		// If Examples is empty, we will proceed to generate it.
	} else if result.Error != gorm.ErrRecordNotFound {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	//content not in cache proceed to geenrate:

	apiKey := os.Getenv("GROQ_API_KEY")
	if apiKey == "" {
		http.Error(w, "GROQ_API_KEY not set", http.StatusInternalServerError)
		return
	}
	cfg := openai.DefaultConfig(apiKey)
	cfg.BaseURL = "https://api.groq.com/openai/v1"
	client := openai.NewClientWithConfig(cfg)

	prompt := fmt.Sprintf(`
You are an expert educator.

Given a topic and its explanation, generate 2–3 beginner-friendly examples that make the concept crystal clear.

⚠️ Respond with ONLY a JSON object in this exact format (no markdown, no extra text):

{
  "examples": [
    {
      "title": "Short descriptive title",
      "explanation": "Step-by-step explanation of the example in very simple language.",
      "highlight": "A relatable analogy, fun fact, or real-world comparison that makes the example memorable.",
      "code": "Optional: a small technical example (code snippet, formula, or calculation) if it genuinely helps understanding. Leave as an empty string if not needed."
    }
  ]
}

Guidelines:
- Use **very simple, clear language** (as if explaining to a 12-year-old).
- Keep sentences short and direct.
- Use **relatable analogies, daily life comparisons, or fun facts** in the "highlight".
- Each example should explain one angle of the topic (not just repeat the same idea).
- The "code" field should only be filled when it adds real value — keep it minimal and relevant.
- Do NOT include markdown formatting, backticks, or commentary outside the JSON.

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

	var generatedExamples ExamplesResponse
	err = json.Unmarshal([]byte(resp.Choices[0].Message.Content), &generatedExamples)
	if err != nil {
		http.Error(w, "Failed to parse examples", http.StatusInternalServerError)
		return
	}

	examplesJSON, _ := json.Marshal(generatedExamples)
	if result.Error == gorm.ErrRecordNotFound {
		// No entry exists yet, create a new one
		newContent := models.Content{
			UserID:   userID,
			Topic:    req.Topic,
			Examples: string(examplesJSON),
		}
		db.DB.Create(&newContent)
	} else {
		// Entry exists, update the specific field
		db.DB.Model(&content).Where("user_id = ? AND topic = ?", userID, req.Topic).Update("examples", string(examplesJSON))
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(generatedExamples)

}
