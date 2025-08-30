package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"tutor_genX/utils"

	"github.com/golang-jwt/jwt/v5"
)

// BookSearchRequest defines the structure for the incoming request body.
type BookSearchRequest struct {
	Topic string `json:"topic"`
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
	// Auth check using the JWT from the request context.
	_, ok := r.Context().Value(utils.UserContextKey).(jwt.MapClaims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Decode the JSON request body.
	var req BookSearchRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Topic == "" {
		http.Error(w, "Invalid request: topic is required", http.StatusBadRequest)
		return
	}

	// Construct the Open Library API URL. The 'ebooks=true' query parameter
	// filters results to only include digital books.
	apiURL := fmt.Sprintf("https://openlibrary.org/search.json?q=%s&ebooks=true", url.QueryEscape(req.Topic))

	// Make the HTTP GET request to the Open Library API.
	resp, err := http.Get(apiURL)
	if err != nil {
		http.Error(w, "Failed to fetch data from Open Library API", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		http.Error(w, "Open Library API returned an error", http.StatusInternalServerError)
		return
	}

	// Decode the JSON response from the Open Library API.
	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		http.Error(w, "Failed to parse Open Library API response", http.StatusInternalServerError)
		return
	}

	// Extract the 'docs' array from the response, which contains the book data.
	docs, ok := result["docs"].([]interface{})
	if !ok {
		http.Error(w, "Invalid response format from Open Library API", http.StatusInternalServerError)
		return
	}

	var books []Book
	// Iterate through the documents and create a structured list of books.
	for _, doc := range docs {
		bookData, ok := doc.(map[string]interface{})
		if !ok {
			continue
		}

		// Check if the book has an 'ia' field, which indicates it's available via Internet Archive.
		// These books are generally free to download or borrow.
		if _, hasIA := bookData["ia"]; hasIA {
			var authorNames []string
			if authors, ok := bookData["author_name"].([]interface{}); ok {
				for _, author := range authors {
					if name, ok := author.(string); ok {
						authorNames = append(authorNames, name)
					}
				}
			}

			// Add the book to our list.
			books = append(books, Book{
				Title:            fmt.Sprintf("%v", bookData["title"]),
				AuthorName:       authorNames,
				FirstPublishYear: int(bookData["first_publish_year"].(float64)),
				Key:              fmt.Sprintf("%v", bookData["key"]),
				// Construct the download URL for Internet Archive books.
				DownloadURL: fmt.Sprintf("https://archive.org/details/%v", bookData["ia"].([]interface{})[0]),
			})
		}
	}

	// Set the Content-Type header and encode the final response.
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(BookSearchResponse{
		Books: books,
	})
}
