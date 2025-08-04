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
	_, ok := r.Context().Value(utils.UserContextKey).(jwt.MapClaims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
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

Given a topic and its explanation, generate 2–3 beginner-friendly examples that help the user understand the concept better.

⚠️ Respond with ONLY a JSON object using this format:

{
  "examples": [
    {
      "title": "Short descriptive title",
      "explanation": "Clear explanation of the example.",
      "highlight": "A relatable analogy, insight, or fun fact to aid understanding.",
      "code": "Optional technical example like code or formula (only if relevant). Leave empty if not needed."
    }
  ]
}

Guidelines:
- Use very simple language.
- Use relatable analogies or real-life examples.
- Only include the "code" field if it adds real value.
- Do NOT include any markdown formatting, backticks, or extra commentary.
- Format the response strictly as JSON.

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

	var examplesResp ExamplesResponse
	err = json.Unmarshal([]byte(resp.Choices[0].Message.Content), &examplesResp)
	if err != nil {
		http.Error(w, "Failed to parse examples", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(examplesResp)

}
