package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"tutor_genX/utils"

	"github.com/golang-jwt/jwt/v5"
)

// YouTubeSearchRequest defines the structure for the incoming request body.
type YouTubeSearchRequest struct {
	Topic string `json:"topic"`
}

// YouTubeVideo represents a single video entry.
type YouTubeVideo struct {
	Title     string `json:"title"`
	ID        string `json:"videoId"`
	Thumbnail string `json:"thumbnail"`
}

// YouTubeSearchResponse defines the structure for the outgoing JSON response.
type YouTubeSearchResponse struct {
	Videos []YouTubeVideo `json:"videos"`
}

// YouTubeHandler searches for videos on a given topic using the YouTube Data API.
func YouTubeHandler(w http.ResponseWriter, r *http.Request) {
	// Auth check using the JWT from the request context.
	_, ok := r.Context().Value(utils.UserContextKey).(jwt.MapClaims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req YouTubeSearchRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Topic == "" {
		http.Error(w, "Invalid request: topic is required", http.StatusBadRequest)
		return
	}

	// Get YouTube API Key from environment variables.
	apiKey := os.Getenv("YOUTUBE_API_KEY")
	if apiKey == "" {
		http.Error(w, "YOUTUBE_API_KEY not set", http.StatusInternalServerError)
		return
	}

	// Construct the YouTube Data API URL.
	apiURL := fmt.Sprintf(
		"https://www.googleapis.com/youtube/v3/search?part=snippet&q=%s&type=video&key=%s",
		url.QueryEscape(req.Topic+" course tutorial"), // Append 'course tutorial' for better results.
		apiKey,
	)

	resp, err := http.Get(apiURL)
	if err != nil {
		http.Error(w, "Failed to fetch data from YouTube API", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		http.Error(w, "YouTube API returned an error", http.StatusInternalServerError)
		return
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		http.Error(w, "Failed to parse YouTube API response", http.StatusInternalServerError)
		return
	}

	items, ok := result["items"].([]interface{})
	if !ok {
		http.Error(w, "Invalid response format from YouTube API", http.StatusInternalServerError)
		return
	}

	var videos []YouTubeVideo
	for _, item := range items {
		videoData, ok := item.(map[string]interface{})
		if !ok {
			continue
		}

		if snippet, ok := videoData["snippet"].(map[string]interface{}); ok {
			if videoID, ok := videoData["id"].(map[string]interface{}); ok {
				if thumbnails, ok := snippet["thumbnails"].(map[string]interface{}); ok {
					var thumbnailURL string
					if medThumbnail, ok := thumbnails["medium"].(map[string]interface{}); ok {
						thumbnailURL = fmt.Sprintf("%v", medThumbnail["url"])
					} else if highThumbnail, ok := thumbnails["high"].(map[string]interface{}); ok {
						thumbnailURL = fmt.Sprintf("%v", highThumbnail["url"])
					} else if defaultThumbnail, ok := thumbnails["default"].(map[string]interface{}); ok {
						thumbnailURL = fmt.Sprintf("%v", defaultThumbnail["url"])
					}

					videos = append(videos, YouTubeVideo{
						Title:     fmt.Sprintf("%v", snippet["title"]),
						ID:        fmt.Sprintf("%v", videoID["videoId"]),
						Thumbnail: thumbnailURL,
					})
				}
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(YouTubeSearchResponse{
		Videos: videos,
	})
}
