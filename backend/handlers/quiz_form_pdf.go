// handlers/quiz_form_pdf.go
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

const maxChunkSize = 10000

type QuizRequest2 struct {
	PDFtext  string `json:"pdftext"`
	FileName string `json:"fileName,omitempty"`
}

func GenerateQuizFromPdf(w http.ResponseWriter, r *http.Request) {
	//jwt validation
	claims, ok := r.Context().Value(utils.UserContextKey).(jwt.MapClaims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	userEmail := claims["email"].(string)

	var req QuizRequest2

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	title := req.FileName
	if title == "" {
		// AI Title Generation Logic would be here
		// For now, we'll use a snippet as a fallback
		if len(req.PDFtext) > 50 {
			title = req.PDFtext[:50] + "..."
		} else {
			title = req.PDFtext
		}
	}
	if req.PDFtext == "" {
		http.Error(w, "PDF text is required", http.StatusBadRequest)
		return
	}
	// 1. Check for existing content in the database
	var quizSet models.QuizSet
	result := db.DB.Where("user_email = ? AND pdf_text = ? AND title = ?", userEmail, req.PDFtext[:50], title).First(&quizSet)
	if result.Error == nil {
		if quizSet.Quiz != "" {
			var cachedQuiz QuizResponse
			if err := json.Unmarshal([]byte(quizSet.Quiz), &cachedQuiz); err != nil {
				http.Error(w, "Failed to parse cached quiz", http.StatusInternalServerError)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(cachedQuiz)
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

	var allQuizQuestions []QuizQuestion

	textChunks := chunkText(req.PDFtext, maxChunkSize)

	for _, chunk := range textChunks {
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
- If explanation contains no factual content, return: {"quiz": []}

text: %s

Generate quiz now:`, chunk)

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
			fmt.Printf("Error generating quiz for a chunk: %v\n", err)
			continue
		}

		var generatedQuiz QuizResponse
		responseContent := strings.TrimSpace(resp.Choices[0].Message.Content)

		if strings.Contains(responseContent, `"quiz": []`) {
			// Handle cases where the API explicitly returns an empty quiz
			continue
		}

		if err := json.Unmarshal([]byte(responseContent), &generatedQuiz); err != nil {
			fmt.Printf("Error parsing quiz JSON for a chunk: %v\n", err)
			continue
		}

		allQuizQuestions = append(allQuizQuestions, generatedQuiz.Quiz...)
	}

	if len(allQuizQuestions) == 0 {
		http.Error(w, "Insufficient content for quiz generation", http.StatusBadRequest)
		return
	}

	finalResponse := QuizResponse{Quiz: allQuizQuestions}
	quizJSON, _ := json.Marshal(finalResponse)

	// 2. Save the new quiz to the database
	if result.Error == gorm.ErrRecordNotFound {
		newQuizSet := models.QuizSet{
			UserEmail: userEmail,
			Title:     title,
			PDFText:   req.PDFtext[:50],
			Quiz:      string(quizJSON),
		}
		db.DB.Create(&newQuizSet)
	} else {
		db.DB.Model(&quizSet).Where("user_email = ? AND pdf_text = ? AND title = ?", userEmail, req.PDFtext[:50], title).Update("quiz", string(quizJSON))
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(finalResponse)
}

func chunkText(text string, size int) []string {
	var chunks []string
	for i := 0; i < len(text); i += size {
		end := i + size
		if end > len(text) {
			end = len(text)
		}
		chunks = append(chunks, text[i:end])
	}
	return chunks
}
