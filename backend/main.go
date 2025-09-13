package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"tutor_genX/db"
	"tutor_genX/handlers"
	"tutor_genX/utils"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

func handleHome(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Hello from Gorilla Mux!"))
}
func handlePing(w http.ResponseWriter, r *http.Request) {
	type Response struct {
		Message string `json:"message"`
	}
	w.Header().Set("Content-type", "application/json")
	responseObject := Response{Message: "pong"}

	json.NewEncoder(w).Encode(responseObject)
}
func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	db.ConnectDB()

	//create a router
	router := mux.NewRouter()

	//register a GET route
	router.HandleFunc("/", handleHome).Methods("GET")
	router.HandleFunc("/ping", handlePing).Methods("GET")
	router.HandleFunc("/signup", handlers.HandleSignup).Methods("POST")
	router.HandleFunc("/login", handlers.HandleLogin).Methods("POST")
	router.Handle("/dashboard", utils.ValidateToken(http.HandlerFunc(handlers.DashboardHandler))).Methods("GET")
	router.Handle("/roadmap", utils.ValidateToken(http.HandlerFunc(handlers.HandleRoadmap))).Methods("POST")
	router.Handle("/roadmaps", utils.ValidateToken(http.HandlerFunc(handlers.GetUsersRoadmap))).Methods("GET")
	router.Handle("/save-roadmap", utils.ValidateToken(http.HandlerFunc(handlers.SaveRoadmap))).Methods("POST")
	router.HandleFunc("/test-preload", handlers.TestPreload).Methods("GET")
	router.Handle("/delete-roadmap", utils.ValidateToken(http.HandlerFunc(handlers.DeleteRoadmap))).Methods("DELETE")
	router.Handle("/delete-all-roadmaps", utils.ValidateToken(http.HandlerFunc(handlers.DeleteAllRoadmaps))).Methods("DELETE")
	router.Handle("/update-progress", utils.ValidateToken(http.HandlerFunc(handlers.HandleMarkAsCompleted))).Methods("POST")
	router.Handle("/generateTitle", utils.ValidateToken(http.HandlerFunc(handlers.GoalNameHandler))).Methods("POST")
	router.Handle("/roadmap/{id}", utils.ValidateToken(http.HandlerFunc(handlers.GetSingleRoadmap))).Methods("GET")
	router.Handle("/explain-topic", utils.ValidateToken(http.HandlerFunc(handlers.ExplainTopicHandler))).Methods("POST")
	router.Handle("/quiz", utils.ValidateToken(http.HandlerFunc(handlers.GenerateQuiz))).Methods("POST")
	router.Handle("/simplify", utils.ValidateToken(http.HandlerFunc(handlers.Simplify))).Methods("POST")
	router.Handle("/example", utils.ValidateToken(http.HandlerFunc(handlers.GenerateExamples))).Methods("POST")
	router.Handle("/booksection", utils.ValidateToken(http.HandlerFunc(handlers.BookHandler))).Methods("POST")
	router.Handle("/pdftext", utils.ValidateToken(http.HandlerFunc(handlers.UploadHandler))).Methods("POST")
	router.Handle("/quizfrompdf", utils.ValidateToken(http.HandlerFunc(handlers.GenerateQuizFromPdf))).Methods("POST")
	//Start the server
	fmt.Println("Server running at http://localhost:8080")
	handlerWithCORS := utils.CORSMiddleware(router)
	http.ListenAndServe(":8080", handlerWithCORS)

}
