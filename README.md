# TutorGenX

TutorGenX is an AI-powered, full-stack web application designed to provide a personalized and comprehensive learning experience. It allows users to generate week-by-week learning roadmaps for any topic, create quizzes and flashcards from PDF documents, and access a wealth of supplementary learning materials.

## Key Features

* **AI-Powered Course Creation:** Generate structured, week-by-week curricula for any learning goal.
* **Personalized Learning Paths:** The platform tailors learning paths based on the user's motivation and preferred learning style.
* **Interactive Learning Interface:** Each topic includes AI-generated explanations, simplified versions for easier understanding, practical examples, and quizzes.
* **PDF to Study Materials:** Upload PDF documents to automatically generate quizzes and flashcards.
* **Rich Content Integration:**
    * **YouTube:** Fetches and displays relevant YouTube videos with AI-generated summaries and timestamps.
    * **Open Library:** Recommends books from the Open Library API.
* **AI Chatbot Assistance:** A real-time chatbot provides answers and clarifications on topics.
* **User Dashboard:** A comprehensive dashboard to manage saved courses, quizzes, flashcards, and track progress.
* **User Authentication:** Secure user authentication and management.

## Technology Stack

### Frontend

* **React:** A JavaScript library for building user interfaces.
* **Vite:** A fast frontend build tool.
* **React Router:** For declarative routing in React.
* **Axios:** For making HTTP requests to the backend.
* **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
* **Framer Motion:** For animations.
* **React-Chatbot-Kit:** A library for creating a chatbot interface.

### Backend

* **Go:** A statically typed, compiled programming language.
* **Gorilla Mux:** A powerful URL router and dispatcher for Go.
* **GORM:** A developer-friendly ORM for Go.
* **PostgreSQL:** A powerful, open-source object-relational database system.
* **JWT for Go:** For implementing JSON Web Tokens.
* **go-openai:** A Go client library for the OpenAI API.

## Getting Started

### Prerequisites

* Go (version 1.24.5 or later)
* Node.js and npm
* PostgreSQL

### Installation and Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/areesh18/tutorgenx.git](https://github.com/areesh18/tutorgenx.git)
    cd tutorgenx
    ```

2.  **Backend Setup:**
    * Navigate to the `backend` directory: `cd backend`
    * Install Go dependencies: `go mod tidy`
    * Create a `.env` file and add your environment variables (e.g., database credentials, JWT secret, API keys).
    * Run the backend server: `go run main.go`

3.  **Frontend Setup:**
    * Navigate to the `frontend` directory: `cd frontend`
    * Install npm dependencies: `npm install`
    * Run the frontend development server: `npm run dev`

### Running the Application

* Once both the backend and frontend servers are running, you can access the application in your browser, typically at `http://localhost:5173`.

## Project Structure

The project is organized into two main directories: `frontend` and `backend`.

### `frontend`

* `src/`: Contains all the React application source code.
    * `components/`: Reusable React components (e.g., Navbar, Chatbot).
    * `context/`: React context providers (e.g., `ChatbotContext`).
    * `pages/`: Individual pages of the application (e.g., `Dashboard`, `LearnPage`).
    * `App.jsx`: The main application component with routing.
    * `main.jsx`: The entry point of the React application.

### `backend`

* `handlers/`: Contains the Go handlers for different API endpoints.
* `models/`: Defines the data models (structs) for the application.
* `db/`: Database connection and migration logic.
* `utils/`: Utility functions (e.g., JWT validation, CORS middleware).
* `main.go`: The main entry point for the backend server, where routes are defined.

## API Endpoints

The backend provides a RESTful API to support the frontend application. Here are some of the key endpoints:

* **Authentication:**
    * `POST /signup`: Register a new user.
    * `POST /login`: Log in a user and get a JWT.
* **Courses and Learning:**
    * `POST /roadmap`: Generate a learning roadmap.
    * `POST /save-course`: Save a generated course.
    * `GET /getsavedcourses`: Get all saved courses for the logged-in user.
    * `POST /explain-topic`: Get an explanation for a specific topic.
* **PDF and Content Generation:**
    * `POST /pdftext`: Extract text from a PDF file.
    * `POST /quizfrompdf`: Generate a quiz from PDF text.
    * `POST /flashcards`: Generate flashcards from PDF text.
* **External Resources:**
    * `POST /ytsection`: Search for YouTube videos related to a topic.
    * `POST /video-summary`: Get an AI-generated summary of a YouTube video.
    * `POST /booksection`: Search for books related to a topic.
* **Real-time Chat:**
    * `/ws`: WebSocket endpoint for the AI chatbot.
