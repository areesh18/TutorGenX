// backend/handlers/chatbot.go
package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/websocket"
	"github.com/sashabaranov/go-openai"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// Struct to hold the incoming message from the frontend
type ChatMessage struct {
	Message string `json:"message"`
	Context struct {
		Topic       string `json:"topic"`
		Explanation string `json:"explanation"`
	} `json:"context"`
}

func HandleChatbot(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Error upgrading to WebSocket:", err)
		return
	}
	defer conn.Close()

	apiKey := os.Getenv("GROQ_API_KEY")
	if apiKey == "" {
		log.Println("GROQ_API_KEY not set in .env")
		conn.WriteMessage(websocket.TextMessage, []byte("Chatbot is currently unavailable."))
		return
	}
	cfg := openai.DefaultConfig(apiKey)
	cfg.BaseURL = "https://api.groq.com/openai/v1"
	client := openai.NewClientWithConfig(cfg)

	for {
		_, p, err := conn.ReadMessage()
		if err != nil {
			log.Println("Error reading message:", err)
			break
		}

		var msg ChatMessage
		if err := json.Unmarshal(p, &msg); err != nil {
			log.Println("Error unmarshaling message:", err)
			continue
		}

		log.Printf("Received message: %s with topic: %s", msg.Message, msg.Context.Topic)

		// Create a context-aware prompt
		var prompt string
		if msg.Context.Topic != "" && msg.Context.Explanation != "" {
			prompt = fmt.Sprintf(
				`You are TutorBot, a helpful AI assistant for the TutorGenX learning platform.
				The user is currently studying the topic: "%s".
				Here is the explanation they are looking at: "%s".
				Based on this context, answer the user's question: "%s".
				Keep your answer concise and directly related to the provided topic and explanation.`,
				msg.Context.Topic, msg.Context.Explanation, msg.Message,
			)
		} else {
			prompt = fmt.Sprintf(
				`You are TutorBot, a helpful AI assistant for the TutorGenX learning platform.
				A user asked: "%s".
				Respond in a helpful and concise manner.`,
				msg.Message,
			)
		}

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
			log.Println("Error from Groq API:", err)
			conn.WriteMessage(websocket.TextMessage, []byte("Sorry, I had trouble generating a response."))
			continue
		}

		aiResponse := resp.Choices[0].Message.Content

		if err := conn.WriteMessage(websocket.TextMessage, []byte(aiResponse)); err != nil {
			log.Println("Error writing message:", err)
			break
		}
	}
}
