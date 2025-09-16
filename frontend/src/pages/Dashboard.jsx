import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import {
  X,
  BookOpen,
  Brain,
  Zap,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
} from "lucide-react";

// Modern Modal Component
const Modal = ({ isOpen, onClose, title, children, size = "default" }) => {
  const sizeClasses = {
    default: "max-w-lg",
    large: "max-w-4xl",
    small: "max-w-md",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className={`w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-gray-100`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Flashcard Modal Component
const FlashcardModal = ({ isOpen, onClose, flashcardData }) => {
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  let flashcards = [];
  try {
    const parsed = JSON.parse(flashcardData?.flashcards || "{}");
    flashcards = parsed.flashcards || [];
  } catch (err) {
    console.error("Flashcards parse error:", err);
  }

  const nextCard = () => {
    setCurrentCard((prev) => (prev + 1) % flashcards.length);
    setShowAnswer(false);
  };

  const prevCard = () => {
    setCurrentCard(
      (prev) => (prev - 1 + flashcards.length) % flashcards.length
    );
    setShowAnswer(false);
  };

  useEffect(() => {
    if (isOpen) {
      setCurrentCard(0);
      setShowAnswer(false);
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Flashcards • ${flashcards.length} cards`}
      size="large"
    >
      <div className="p-6">
        {flashcards.length === 0 ? (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No flashcards available</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Card {currentCard + 1} of {flashcards.length}
              </span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        ((currentCard + 1) / flashcards.length) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Flashcard */}
            <div className="relative">
              <motion.div
                key={`${currentCard}-${showAnswer}`}
                initial={{ rotateY: 90 }}
                animate={{ rotateY: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 min-h-[300px] flex items-center justify-center cursor-pointer border border-indigo-100"
                onClick={() => setShowAnswer(!showAnswer)}
              >
                <div className="text-center space-y-4">
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      showAnswer
                        ? "bg-green-100 text-green-700"
                        : "bg-indigo-100 text-indigo-700"
                    }`}
                  >
                    {showAnswer ? "Answer" : "Question"}
                  </div>
                  <p className="text-lg text-gray-800 leading-relaxed">
                    {showAnswer
                      ? flashcards[currentCard]?.back
                      : flashcards[currentCard]?.front}
                  </p>
                  {!showAnswer && (
                    <p className="text-sm text-gray-500">
                      Click to reveal answer
                    </p>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={prevCard}
                disabled={flashcards.length <= 1}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
                Previous
              </button>

              <button
                onClick={() => setShowAnswer(!showAnswer)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {showAnswer ? "Show Question" : "Show Answer"}
              </button>

              <button
                onClick={nextCard}
                disabled={flashcards.length <= 1}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

// Quiz Modal Component
const QuizModal = ({ isOpen, onClose, quizData }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  let questions = [];
  try {
    const parsed = JSON.parse(quizData?.quiz || "{}");
    questions = parsed.quiz || [];
  } catch (err) {
    console.error("Quiz parse error:", err);
  }

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
  };

  const handleAnswerSelect = (questionIndex, answer) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.answer) {
        correct++;
      }
    });
    setScore(correct);
    setShowResults(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateScore();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  useEffect(() => {
    if (isOpen) {
      resetQuiz();
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        showResults ? "Quiz Results" : `Quiz • ${questions.length} questions`
      }
      size="large"
    >
      <div className="p-6">
        {questions.length === 0 ? (
          <div className="text-center py-12">
            <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No quiz questions available</p>
          </div>
        ) : showResults ? (
          <div className="space-y-6">
            {/* Results Summary */}
            <div className="text-center space-y-4">
              <div
                className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${
                  score >= questions.length * 0.7
                    ? "bg-green-100"
                    : "bg-orange-100"
                }`}
              >
                {score >= questions.length * 0.7 ? (
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                ) : (
                  <XCircle className="w-10 h-10 text-orange-600" />
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {score} / {questions.length}
                </h3>
                <p className="text-gray-600">
                  {Math.round((score / questions.length) * 100)}% Score
                </p>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="space-y-4">
              {questions.map((q, index) => {
                const userAnswer = selectedAnswers[index];
                const isCorrect = userAnswer === q.answer;

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border ${
                      isCorrect
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        {index + 1}. {q.question}
                      </h4>
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      )}
                    </div>
                    <div className="space-y-1 text-sm">
                      <p
                        className={`${
                          isCorrect ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        Your answer: {userAnswer || "Not answered"}
                      </p>
                      {!isCorrect && (
                        <p className="text-green-700">
                          Correct answer: {q.answer}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Retake Button */}
            <div className="flex justify-center pt-4">
              <button
                onClick={resetQuiz}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <RotateCcw size={18} />
                Retake Quiz
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Progress */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      ((currentQuestion + 1) / questions.length) * 100
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="space-y-4">
              <h3 className="text-xl font-medium text-gray-900">
                {questions[currentQuestion]?.question}
              </h3>

              <div className="space-y-3">
                {questions[currentQuestion]?.options?.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(currentQuestion, option)}
                    className={`w-full p-4 text-left rounded-xl border transition-all ${
                      selectedAnswers[currentQuestion] === option
                        ? "border-indigo-300 bg-indigo-50 text-indigo-900"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span className="font-medium text-sm text-gray-500 mr-3">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <button
                onClick={prevQuestion}
                disabled={currentQuestion === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
                Previous
              </button>

              <div className="text-sm text-gray-500">
                {Object.keys(selectedAnswers).length} / {questions.length}{" "}
                answered
              </div>

              <button
                onClick={nextQuestion}
                disabled={!selectedAnswers[currentQuestion]}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {currentQuestion === questions.length - 1
                  ? "Finish Quiz"
                  : "Next"}
                {currentQuestion !== questions.length - 1 && (
                  <ChevronRight size={18} />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

const DeleteConfirmModal = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  isDestructive = true,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.98, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.98, opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl ring-1 ring-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <span className="text-xl text-red-600" aria-hidden="true">
                ⚠️
              </span>
              <span className="sr-only">Warning</span>
            </div>
            <motion.h3
              initial={{ y: 6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mb-2 text-center text-lg font-semibold text-gray-900"
            >
              {title}
            </motion.h3>
            <motion.p
              initial={{ y: 6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mb-6 text-center text-sm leading-relaxed text-gray-600"
            >
              {message}
            </motion.p>
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex gap-3"
            >
              <motion.button
                onClick={onCancel}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {cancelText}
              </motion.button>
              <motion.button
                onClick={onConfirm}
                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white ${
                  isDestructive
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                aria-label={confirmText}
              >
                {confirmText}
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [flashcardModalOpen, setFlashcardModalOpen] = useState(false);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [selectedFlashcard, setSelectedFlashcard] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: null, // 'single' or 'all'
    courseId: null,
    title: "",
    message: "",
  });

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const [resCourses, resQuizzes, resFlashcards] = await Promise.all([
        axios.get("http://localhost:8080/getsavedcourses", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:8080/my-quizzes", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:8080/my-flashcards", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setCourses(resCourses.data || []);
      setQuizzes(resQuizzes.data || []);
      setFlashcards(resFlashcards.data || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchData();
  }, [token, fetchData]);

  if (!token) return <p className="text-center p-6">Please login first.</p>;

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );

  const openFlashcardModal = (fc) => {
    setSelectedFlashcard(fc);
    setFlashcardModalOpen(true);
  };

  const openQuizModal = (quiz) => {
    setSelectedQuiz(quiz);
    setQuizModalOpen(true);
  };

  // Open delete modal for single course
  const handleDeleteClick = (id, title = "Learning Course") => {
    setDeleteModal({
      isOpen: true,
      type: "single",
      courseId: id,
      title: "Delete Course?",
      message: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
    });
  };

  // Open delete modal for all courses
  const handleDeleteAllCourseClick = () => {
    setDeleteModal({
      isOpen: true,
      type: "all",
      courseId: null,
      title: "Delete All Courses?",
      message: `Are you sure you want to delete all ${courses.length} courses? This action cannot be undone.`,
    });
  };
  // Open delete modal for single quiz
  const handleDeleteQuiz = (id) => {
    setDeleteModal({
      isOpen: true,
      type: "single-quiz",
      quizId: id,
      title: "Delete Quiz?",
      message: `Are you sure you want to delete this quiz? This action cannot be undone.`,
    });
  };

  // Open delete modal for all quizzes
  const handleDeleteAllQuizClick = () => {
    setDeleteModal({
      isOpen: true,
      type: "all-quiz",
      quizId: null,
      title: "Delete All Quizzes?",
      message: `Are you sure you want to delete all ${quizzes.length} quizzes? This action cannot be undone.`,
    });
  };

  // Open delete modal for single flashcard
  const handleDeleteFlashcard = (id) => {
    setDeleteModal({
      isOpen: true,
      type: "single-flashcard",
      flashcardId: id,
      title: "Delete Flashcard Set?",
      message: `Are you sure you want to delete this flashcard set? This action cannot be undone.`,
    });
  };

  // Open delete modal for all flashcards
  const handleDeleteAllFlashCardsClick = () => {
    setDeleteModal({
      isOpen: true,
      type: "all-flashcard",
      flashcardId: null,
      title: "Delete All Flashcard Sets?",
      message: `Are you sure you want to delete all ${flashcards.length} flashcard sets? This action cannot be undone.`,
    });
  };

  // Handle modal confirmation
  const handleDeleteConfirm = async () => {
    try {
      if (deleteModal.type === "single") {
        await axios.delete(
          `http://localhost:8080/delete-roadmap?id=${deleteModal.courseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCourses((prev) => prev.filter((c) => c.ID !== deleteModal.courseId));
      } else if (deleteModal.type === "all") {
        await axios.delete(`http://localhost:8080/delete-all-roadmaps`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses([]);
      } else if (deleteModal.type === "single-quiz") {
        await axios.delete(
          `http://localhost:8080/delete-quiz?id=${deleteModal.quizId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setQuizzes((prev) => prev.filter((q) => q.ID !== deleteModal.quizId));
      } else if (deleteModal.type === "all-quiz") {
        await axios.delete(`http://localhost:8080/delete-all-quizzes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuizzes([]);
      } else if (deleteModal.type === "single-flashcard") {
        await axios.delete(
          `http://localhost:8080/delete-flashcard?id=${deleteModal.flashcardId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFlashcards((prev) =>
          prev.filter((fc) => fc.ID !== deleteModal.flashcardId)
        );
      } else if (deleteModal.type === "all-flashcard") {
        await axios.delete(`http://localhost:8080/delete-all-flashcards`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFlashcards([]);
      }
      setDeleteModal({
        isOpen: false,
        type: null,
        courseId: null,
        quizId: null,
        flashcardId: null,
        title: "",
        message: "",
      });
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete item(s)");
      setDeleteModal({
        isOpen: false,
        type: null,
        courseId: null,
        quizId: null,
        flashcardId: null,
        title: "",
        message: "",
      });
    }
  };

  // Handle modal cancellation
  const handleDeleteCancel = () => {
    setDeleteModal({
      isOpen: false,
      type: null,
      courseId: null,
      quizId: null,
      flashcardId: null,
      title: "",
      message: "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        title={deleteModal.title}
        message={deleteModal.message}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        confirmText={deleteModal.type === "all" ? "Delete All" : "Delete"}
      />

      {/* Modals */}
      <FlashcardModal
        isOpen={flashcardModalOpen}
        onClose={() => setFlashcardModalOpen(false)}
        flashcardData={selectedFlashcard}
      />

      <QuizModal
        isOpen={quizModalOpen}
        onClose={() => setQuizModalOpen(false)}
        quizData={selectedQuiz}
      />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Track your learning progress and access your content
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <BookOpen className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {courses.length}
                </p>
                <p className="text-gray-600">Courses</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {quizzes.length}
                </p>
                <p className="text-gray-600">Quizzes</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <Brain className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {flashcards.length}
                </p>
                <p className="text-gray-600">Flashcard Sets</p>
              </div>
            </div>
          </div>
        </div>

        {/* Saved Courses */}
        <section className="mb-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">
              Your Courses
            </h2>
            {courses.length > 0 && (
              <button
                onClick={handleDeleteAllCourseClick}
                className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Delete All
              </button>
            )}
          </div>
          {courses.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No saved courses yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, i) => {
                let totalTopics = 0,
                  completedTopics = 0;
                course.weeks.forEach((week) => {
                  let topics = [],
                    progress = [];
                  try {
                    topics = JSON.parse(week.topics || "[]");
                    progress = JSON.parse(week.progress || "[]");
                  } catch (err) {
                    console.error("Parse error:", err);
                  }
                  totalTopics += topics.length;
                  completedTopics += progress.filter((p) => p).length;
                });
                const progressPercent =
                  totalTopics === 0
                    ? 0
                    : Math.round((completedTopics / totalTopics) * 100);

                return (
                  <motion.div
                    key={course.ID || i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.25 }}
                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-5"
                    whileHover={{ y: -4 }}
                  >
                    {/* Card header */}
                    <motion.div
                      initial={{ y: -6, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 + 0.05 * i }}
                      className="mb-3 flex items-start justify-between"
                    >
                      <div className="flex-1">
                        <h2 className="mb-1 flex items-center gap-2 text-base font-semibold text-gray-900">
                          🎯 {course?.title || "Learning Course"}
                        </h2>
                        <p className="text-xs text-gray-500">
                          Created on{" "}
                          {new Date(course.CreatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleDeleteClick(
                            course.ID,
                            course?.title || "Learning Course"
                          )
                        }
                        className="ml-2 rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </motion.div>

                    {/* Progress */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.15 + 0.05 * i }}
                      className="mb-4"
                    >
                      <div className="mb-2 flex items-center justify-between text-xs text-gray-600">
                        <span>
                          Progress: {completedTopics} / {totalTopics}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {progressPercent}%
                        </span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <motion.div
                          className="h-full rounded-full bg-indigo-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercent}%` }}
                          transition={{ duration: 0.6, delay: 0.2 + 0.05 * i }}
                        />
                      </div>
                    </motion.div>

                    {/* Week List */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 + 0.05 * i }}
                      className="max-h-48 space-y-3 overflow-y-auto mb-4"
                      style={{
                        scrollbarWidth: "thin",
                        scrollbarColor: "#c7d2fe #f3f4f6",
                      }}
                    >
                      {course.weeks
                        .slice()
                        .sort((a, b) => a.week - b.week)
                        .map((week, weekIndex) => {
                          let topics = [];
                          let progress = [];
                          try {
                            topics = JSON.parse(week.topics || "[]");
                            progress = JSON.parse(week.progress || "[]");
                          } catch (err) {
                            return null;
                          }
                          while (progress.length < topics.length)
                            progress.push(false);

                          return (
                            <motion.div
                              key={week.ID}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.05 * weekIndex }}
                              className="rounded-lg border border-gray-200 bg-gray-50 p-3 hover:bg-gray-100"
                              whileHover={{ x: 2 }}
                            >
                              <motion.h4
                                initial={{ y: -4, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 + 0.05 * weekIndex }}
                                className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900"
                              >
                                📚 Week {week.week}: {week.title}
                              </motion.h4>
                              <motion.ul
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.15 + 0.05 * weekIndex }}
                                className="space-y-1.5"
                              >
                                {topics.map((topic, topicIndex) => (
                                  <motion.li
                                    key={topicIndex}
                                    initial={{ opacity: 0, x: -6 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.03 * topicIndex }}
                                    className={`flex items-center gap-2 text-sm ${
                                      progress[topicIndex]
                                        ? "line-through text-gray-400"
                                        : "text-gray-700 hover:text-indigo-700"
                                    }`}
                                    whileHover={{ x: 1 }}
                                  >
                                    <motion.span
                                      className={`h-1.5 w-1.5 rounded-full ${
                                        progress[topicIndex]
                                          ? "bg-indigo-600"
                                          : "bg-gray-400"
                                      }`}
                                      initial={{ scale: 0.8 }}
                                      animate={{ scale: 1 }}
                                    />
                                    {topic}
                                  </motion.li>
                                ))}
                              </motion.ul>
                            </motion.div>
                          );
                        })}
                    </motion.div>

                    {/* CTA */}
                    <motion.button
                      onClick={() => navigate(`/learn/${course.ID}`)}
                      className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-indigo-700"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 + 0.05 * i }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      Start Learning →
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* Saved Quizzes */}
        <section className="mb-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">
              Your Quizzes
            </h2>
            {quizzes.length > 0 && (
              <button
                onClick={handleDeleteAllQuizClick}
                className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Delete All
              </button>
            )}
          </div>
          {quizzes.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No quizzes yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz, i) => (
                <motion.div
                  key={quiz.ID || i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="bg-white rounded-xl p-5 border border-gray-200 hover:border-orange-200 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                  onClick={() => openQuizModal(quiz)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
                        <Zap className="w-4 h-4 text-orange-600" />
                      </div>
                      <h3 className="font-medium text-gray-900">
                        Quiz #{quiz.ID}
                      </h3>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteQuiz(quiz.ID);
                      }}
                      className="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded font-medium"
                    >
                      Delete
                    </button>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{quiz.pdf_text}</p>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                      Test Knowledge
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-orange-600 transition-colors" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Saved Flashcards */}
        <section className="">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">
              Your Flashcards
            </h2>
            {flashcards.length > 0 && (
              <button
                onClick={handleDeleteAllFlashCardsClick}
                className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Delete All
              </button>
            )}
          </div>
          {flashcards.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <Brain className="w-16 h-16 text-gray-300  mx-auto mb-4" />
              <p className="text-gray-500">No flashcards yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {flashcards.map((fc, i) => (
                <motion.div
                  key={fc.ID || i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="bg-white rounded-xl p-5 border border-gray-200 hover:border-indigo-200 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                  onClick={() => openFlashcardModal(fc)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                        <Brain className="w-4 h-4 text-indigo-600" />
                      </div>
                      <h3 className="font-medium text-gray-900">
                        Set #{fc.ID}
                      </h3>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFlashcard(fc.ID);
                      }}
                      className="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded font-medium"
                    >
                      Delete
                    </button>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{fc.pdf_text}</p>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                      Study Cards
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
