package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"

	"tutor_genX/db"
	"tutor_genX/models"
	"tutor_genX/utils"

	"github.com/golang-jwt/jwt/v5"
	"github.com/sashabaranov/go-openai"
	"gorm.io/gorm"
)

const flashcardChunkSize = 10000 // A safe chunk size for Groq API

type FlashcardRequest struct {
	PDFtext string `json:"pdftext"`
}

type Flashcard struct {
	Front string `json:"front"`
	Back  string `json:"back"`
}

type FlashcardResponse struct {
	Flashcards []Flashcard `json:"flashcards"`
}

func GenerateFlashcards(w http.ResponseWriter, r *http.Request) {
	// JWT validation
	claims, ok := r.Context().Value(utils.UserContextKey).(jwt.MapClaims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	userEmail := claims["email"].(string)

	var req FlashcardRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	if req.PDFtext == "" {
		http.Error(w, "PDF text is required", http.StatusBadRequest)
		return
	}
	// 1. Check for existing content in the database
	var flashcardSet models.FlashcardSet
	// Use a hash or a unique identifier from the text as a key to check for cached content
	result := db.DB.Where("user_email = ? AND pdf_text = ?", userEmail, req.PDFtext[:50]).First(&flashcardSet)

	if result.Error == nil {
		if flashcardSet.Flashcards != "" {
			var cachedFlashcards FlashcardResponse
			if err := json.Unmarshal([]byte(flashcardSet.Flashcards), &cachedFlashcards); err != nil {
				http.Error(w, "Failed to parse cached flashcards", http.StatusInternalServerError)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(cachedFlashcards)
			return
		}
	} else if result.Error != gorm.ErrRecordNotFound {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	// 2. Content not in cache: proceed with generation

	apiKey := os.Getenv("GROQ_API_KEY")
	if apiKey == "" {
		http.Error(w, "GROQ_API_KEY not set", http.StatusInternalServerError)
		return
	}
	cfg := openai.DefaultConfig(apiKey)
	cfg.BaseURL = "https://api.groq.com/openai/v1"
	client := openai.NewClientWithConfig(cfg)

	var allFlashcards []Flashcard

	textChunks := chunkText(req.PDFtext, flashcardChunkSize)

	for _, chunk := range textChunks {
		prompt := fmt.Sprintf(`You are a flashcard generator. Create exactly 3-5 flashcards based ONLY on the provided text.

STRICT REQUIREMENTS:
1. Base flashcards ONLY on facts explicitly mentioned in the text.
2. Each flashcard must have a "front" (the question) and a "back" (the answer).
3. The question must be clear and the answer concise.
4. Do not add any external knowledge not present in the text.

OUTPUT FORMAT (JSON only, no markdown or extra text):
{
  "flashcards": [
    {
      "front": "What is the key term from the text?",
      "back": "The definition or explanation of the term."
    }
  ]
}

text: %s

Generate flashcards now:`, chunk)

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
			fmt.Printf("Error generating flashcards for a chunk: %v\n", err)
			continue
		}

		var generatedFlashcards FlashcardResponse
		responseContent := strings.TrimSpace(resp.Choices[0].Message.Content)

		if strings.Contains(responseContent, `"flashcards": []`) {
			continue
		}

		if err := json.Unmarshal([]byte(responseContent), &generatedFlashcards); err != nil {
			fmt.Printf("Error parsing flashcard JSON for a chunk: %v\n", err)
			continue
		}

		allFlashcards = append(allFlashcards, generatedFlashcards.Flashcards...)
	}

	if len(allFlashcards) == 0 {
		http.Error(w, "Insufficient content for flashcard generation", http.StatusBadRequest)
		return
	}

	finalResponse := FlashcardResponse{Flashcards: allFlashcards}
	flashcardsJSON, _ := json.Marshal(finalResponse)

	// 2. Save the new flashcards to the database
	if result.Error == gorm.ErrRecordNotFound {
		newFlashcardSet := models.FlashcardSet{
			UserEmail:  userEmail,
			PDFText:    req.PDFtext[:50],
			Flashcards: string(flashcardsJSON),
		}
		db.DB.Create(&newFlashcardSet)
	} else {
		db.DB.Model(&flashcardSet).Where("user_email = ? AND pdf_text = ?", userEmail, req.PDFtext[:50]).Update("flashcards", string(flashcardsJSON))
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(finalResponse)
}
