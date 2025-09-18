"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  RefreshCcw,
  Award,
  Zap,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  X,
} from "lucide-react";

// Modal components adapted from Dashboard.jsx

const Modal = ({ isOpen, onClose, title, children, size = "large" }) => {
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
            className={`w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-gray-100`}
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

const QuizModal = ({ isOpen, onClose, quizData }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  let questions = [];
  try {
    // The data from the API is already an array, so we structure it to match what the modal expects
    const parsed = quizData;
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

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
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


// Main Component
const QuizFromPDF = () => {
  const [file, setFile] = useState(null);
  const [quiz, setQuiz] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);


  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }

    setLoading(true);
    setError(null);
    setQuiz([]);
    
    try {
      const formData = new FormData();
      formData.append("pdf", file);

      const textRes = await axios.post(
        "http://localhost:8080/pdftext",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const extractedText = textRes.data;

      const quizRes = await axios.post(
        "http://localhost:8080/quizfrompdf",
        { pdftext: extractedText, fileName: file.name },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setQuiz(quizRes.data.quiz || []);
      if (quizRes.data.quiz && quizRes.data.quiz.length > 0) {
        setIsQuizModalOpen(true);
      } else {
        setError("Could not generate a quiz from the provided PDF.");
      }
    } catch (err) {
      console.error("Error generating quiz:", err);
      setError(
        "Failed to generate quiz. The document might be empty or in an unsupported format."
      );
    } finally {
      setLoading(false);
    }
  };

  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-3" />
        <span className="text-gray-700 font-medium">Processing...</span>
        <span className="text-gray-500 text-sm">This may take a moment.</span>
    </div>
    );


  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 flex flex-col items-center justify-center">
        <QuizModal
            isOpen={isQuizModalOpen}
            onClose={() => setIsQuizModalOpen(false)}
            quizData={{ quiz: quiz }}
        />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="text-blue-600" size={32} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          PDF to Quiz
        </h1>
        <p className="text-gray-600">
          Upload a PDF and generate an interactive quiz instantly
        </p>
      </motion.div>

      {/* Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
      >
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-blue-300 transition-colors">
          <div className="space-y-4">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-600
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100 file:cursor-pointer"
            />
            
            {file && (
              <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                Selected: <span className="font-medium break-words">{file.name}</span>
              </div>
            )}

            <motion.button
              onClick={handleUpload}
              disabled={loading || !file}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <RefreshCcw size={18} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Generate Quiz
                </>
              )}
            </motion.button>

            {error && (
              <div className="text-sm text-red-600 p-3 bg-red-50 rounded-lg mt-4">
                {error}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Loading */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoadingSpinner />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizFromPDF;