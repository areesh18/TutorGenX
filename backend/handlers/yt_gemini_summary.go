package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"tutor_genX/utils"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/generative-ai-go/genai"
	"github.com/horiagug/youtube-transcript-api-go/pkg/yt_transcript"
	"google.golang.org/api/option"
)

type VideoSummaryRequest struct {
	VideoID string `json:"videoId"`
}

type SummaryItem struct {
	Timestamp   string `json:"timestamp"`
	SummaryText string `json:"summaryText"`
}

type VideoSummaryResponse struct {
	Summary []SummaryItem `json:"summary"`
}

// NEW: Helper function to clean the Gemini response
func cleanJSON(s string) string {
	// Remove markdown code fences and any leading/trailing whitespace
	s = strings.TrimSpace(s)
	s = strings.TrimPrefix(s, "```json")
	s = strings.TrimPrefix(s, "```")
	s = strings.TrimSuffix(s, "```")
	return strings.TrimSpace(s)
}

// GetYouTubeVideoSummaryGemini handles summarization using a two-step process.
func GetYouTubeVideoSummaryGemini(w http.ResponseWriter, r *http.Request) {
	// 1. JWT validation
	_, ok := r.Context().Value(utils.UserContextKey).(jwt.MapClaims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// 2. Parse request body for the video ID
	var req VideoSummaryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.VideoID == "" {
		http.Error(w, "Invalid request: videoId is required", http.StatusBadRequest)
		return
	}

	// Step 1: Fetch the video transcript with timestamps
	client := yt_transcript.NewClient()
	transcripts, err := client.GetTranscripts(req.VideoID, []string{"en"})
	if err != nil {
		log.Printf("Failed to get video transcript for ID %s: %v", req.VideoID, err)
		http.Error(w, "Failed to get video transcript", http.StatusInternalServerError)
		return
	}

	if len(transcripts) == 0 {
		http.Error(w, "Video has no English transcript to summarize", http.StatusBadRequest)
		return
	}

	// Format transcript lines for the prompt
	var formattedTranscript string
	for _, t := range transcripts[0].Lines {
		formattedTranscript += fmt.Sprintf("[%s] %s\n", formatDuration(t.Start), t.Text)
	}

	if formattedTranscript == "" {
		http.Error(w, "Video has no available transcript text to summarize", http.StatusBadRequest)
		return
	}

	// Step 2: Set up the Gemini API client and summarize the text
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		http.Error(w, "GEMINI_API_KEY not set", http.StatusInternalServerError)
		return
	}

	ctx := context.Background()
	geminiClient, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		log.Println("Error creating Gemini client:", err)
		http.Error(w, "Failed to create Gemini client", http.StatusInternalServerError)
		return
	}
	defer geminiClient.Close()

	// New prompt to request a timestamped summary in JSON format
	model := geminiClient.GenerativeModel("gemini-1.5-flash-latest")
	prompt := []genai.Part{
		genai.Text(fmt.Sprintf(`Create a timestamped summary for the following video transcript. The summary should be a JSON object containing an array of key points, each with a timestamp and a summary text.

STRICT REQUIREMENTS:
1. The output must be a single JSON object.
2. The JSON object must have a key "summary" which is an array of objects.
3. Each object in the "summary" array must have two keys: "timestamp" and "summaryText".
4. The "timestamp" should be a string in "MM:SS" format, corresponding to a key point in the transcript.
5. The "summaryText" should be a concise summary of the content from that timestamp.

Example of desired JSON output:
{
  "summary": [
    {
      "timestamp": "00:00",
      "summaryText": "The video starts with an introduction to the topic..."
    },
    {
      "timestamp": "01:25",
      "summaryText": "This section explains the core concepts of..."
    }
  ]
}

Video Transcript:
%s
`, formattedTranscript)),
	}

	resp, err := model.GenerateContent(ctx, prompt...)
	if err != nil {
		log.Println("Error generating content from Gemini:", err)
		http.Error(w, "Failed to generate summary from Gemini", http.StatusInternalServerError)
		return
	}

	var summaryResponse VideoSummaryResponse
	if len(resp.Candidates) > 0 && len(resp.Candidates[0].Content.Parts) > 0 {
		if text, ok := resp.Candidates[0].Content.Parts[0].(genai.Text); ok {
			// Clean the response before unmarshaling
			cleanText := cleanJSON(string(text))
			if err := json.Unmarshal([]byte(cleanText), &summaryResponse); err != nil {
				log.Println("Error unmarshaling Gemini response:", err)
				http.Error(w, "Failed to parse AI-generated summary", http.StatusInternalServerError)
				return
			}
		}
	}

	if len(summaryResponse.Summary) == 0 {
		http.Error(w, "Summary could not be generated", http.StatusInternalServerError)
		return
	}

	// 3. Respond with the new structured summary
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(summaryResponse)
}

// formatDuration converts a duration in seconds to MM:SS format
func formatDuration(sec float64) string {
	minutes := int(sec) / 60
	seconds := int(sec) % 60
	return fmt.Sprintf("%02d:%02d", minutes, seconds)
}
