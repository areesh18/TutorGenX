// areesh18/tutorgenx/TutorGenX-4fad9d4aedd9b91e06ede18a8ffd2acadecf959e/backend/handlers/books.go
package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
	"tutor_genX/utils"

	"github.com/golang-jwt/jwt/v5"
	"github.com/sashabaranov/go-openai"
)

// BookSearchRequest defines the structure for the incoming request body.
type BookSearchRequest struct {
	Goal string `json:"goal"`
}

// Book represents a single book entry from the Open Library API response.
type Book struct {
	Title            string   `json:"title"`
	AuthorName       []string `json:"author_name"`
	FirstPublishYear int      `json:"first_publish_year"`
	Key              string   `json:"key"`
	DownloadURL      string   `json:"download_url,omitempty"`
}

// BookSearchResponse defines the structure for the outgoing JSON response.
type BookSearchResponse struct {
	Books []Book `json:"books"`
}

// BookHandler searches for free books on a given topic using the Open Library API.
func BookHandler(w http.ResponseWriter, r *http.Request) {
	// Auth check
	_, ok := r.Context().Value(utils.UserContextKey).(jwt.MapClaims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Decode the request
	var req BookSearchRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Goal == "" {
		http.Error(w, "Invalid request: goal is required", http.StatusBadRequest)
		return
	}
	log.Printf("Received book search request for goal: %s", req.Goal)

	// Setup Groq
	apiKey := os.Getenv("GROQ_API_KEY")
	if apiKey == "" {
		http.Error(w, "GROQ_API_KEY not set", http.StatusInternalServerError)
		return
	}
	cfg := openai.DefaultConfig(apiKey)
	cfg.BaseURL = "https://api.groq.com/openai/v1"
	client := openai.NewClientWithConfig(cfg)

	// A more robust prompt to extract keywords from a conversational goal
	prompt := fmt.Sprintf(`Your task is to extract a concise, 2-5 word book search query from a user's learning goal. Ignore conversational filler. Respond with ONLY the search query.
For example:

Goal: "i want to master all concepts in computer networks for my upcmming exam in btech i dont know anything about this topic"
Query: "Computer Networks"

Goal: "how do i get started with python as a complete beginner"
Query: "Python"

Goal: "i need to become a full stack web developer using the mern stack"
Query: "MERN stack full stack development"

Goal: "learn data science and machine learning"
Query: "Data Science machine learning"

Goal: "%s"
Query:`, req.Goal)

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

	var searchTerm string
	if err != nil || len(resp.Choices) == 0 || resp.Choices[0].Message.Content == "" {
		log.Printf("AI search term generation failed: %v. Falling back to original goal.", err)
		searchTerm = req.Goal // Fallback to the original goal
	} else {
		// Clean up the AI response
		searchTerm = strings.TrimSpace(resp.Choices[0].Message.Content)
		searchTerm = strings.Trim(searchTerm, "\"")
		log.Printf("AI generated search term: %s", searchTerm)
	}

	// Search Open Library
	apiURL := fmt.Sprintf("https://openlibrary.org/search.json?q=%s&ebooks=true", url.QueryEscape(searchTerm))
	httpResp, err := http.Get(apiURL)
	if err != nil {
		http.Error(w, "Failed to fetch data from Open Library API", http.StatusInternalServerError)
		return
	}
	defer httpResp.Body.Close()

	if httpResp.StatusCode != http.StatusOK {
		http.Error(w, "Open Library API returned an error", http.StatusInternalServerError)
		return
	}

	var result map[string]interface{}
	if err := json.NewDecoder(httpResp.Body).Decode(&result); err != nil {
		http.Error(w, "Failed to parse Open Library API response", http.StatusInternalServerError)
		return
	}

	docs, ok := result["docs"].([]interface{})
	if !ok {
		// No 'docs' field is a valid response for no results, so we'll just return an empty list.
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(BookSearchResponse{Books: []Book{}})
		return
	}
	log.Printf("Found %d books from Open Library before filtering.", len(docs))

	var books []Book
	for _, doc := range docs {
		bookData, ok := doc.(map[string]interface{})
		if !ok {
			continue
		}

		if ia, hasIA := bookData["ia"].([]interface{}); hasIA && len(ia) > 0 {
			var authorNames []string
			if authors, ok := bookData["author_name"].([]interface{}); ok {
				for _, author := range authors {
					if name, ok := author.(string); ok {
						authorNames = append(authorNames, name)
					}
				}
			}

			firstPublishYear := 0
			if fpy, ok := bookData["first_publish_year"].(float64); ok {
				firstPublishYear = int(fpy)
			}

			books = append(books, Book{
				Title:            fmt.Sprintf("%v", bookData["title"]),
				AuthorName:       authorNames,
				FirstPublishYear: firstPublishYear,
				Key:              fmt.Sprintf("%v", bookData["key"]),
				DownloadURL:      fmt.Sprintf("https://archive.org/details/%v", ia[0]),
			})
		}
	}
	log.Printf("Returning %d filtered books.", len(books))

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(BookSearchResponse{
		Books: books,
	})
}
