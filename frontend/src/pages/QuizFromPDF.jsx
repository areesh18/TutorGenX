"use client";

import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  RefreshCcw,
  Award,
} from "lucide-react";

// Custom components for a cleaner UI
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-sm border border-gray-100">
    <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-3" />
    <span className="text-gray-700 font-medium">Processing...</span>
    <span className="text-gray-500 text-sm">This may take a moment.</span>
  </div>
);

const QuizFromPDF = () => {
  const [file, setFile] = useState(null);
  const [quiz, setQuiz] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    setScore(0);
    setQuizSubmitted(false);
    setSelectedAnswers({}); // <-- Add this line to reset answers

    try {
      // Step 1: Upload PDF -> get extracted text
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

      // Step 2: Send extracted text -> get quiz
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
    } catch (err) {
      console.error("Error generating quiz:", err);
      setError(
        "Failed to generate quiz. Please check the console for details."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex, optionLetter) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionLetter,
    }));
  };

  const handleSubmitQuiz = () => {
    let total = 0;
    quiz.forEach((q, idx) => {
      const selectedLetter = selectedAnswers[idx];
      if (!selectedLetter) return;
      const optionIndex = selectedLetter.charCodeAt(0) - 65;
      const selectedText = q.options?.[optionIndex];
      const answer = q.answer;

      const matchesByLetter =
        typeof answer === "string" &&
        /^[A-Z]$/.test(answer.trim()) &&
        answer.trim().toUpperCase() === selectedLetter;
      const matchesByText =
        String(answer).trim() === String(selectedText).trim();

      if (matchesByLetter || matchesByText) total++;
    });
    setScore(total);
    setQuizSubmitted(true);
    setShowPopup(true);
  };

  const handleRetryQuiz = () => {
    setSelectedAnswers({});
    setScore(0);
    setQuizSubmitted(false);
    setShowPopup(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 flex flex-col items-center justify-center">
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
                Selected: <span className="font-medium">{file.name}</span>
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
              <div className="text-sm text-red-600 p-3 bg-red-50 rounded-lg">
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

      {/* Quiz Section */}
      <AnimatePresence>
        {quiz.length > 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-3xl"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Quiz</h2>
              <p className="text-gray-600">{quiz.length} questions to test your knowledge</p>
            </div>

            <div className="space-y-6">
              {quiz.map((q, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
                >
                  <div className="mb-4">
                    <div className="flex items-start gap-3">
                      <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <h3 className="font-semibold text-lg text-gray-900 leading-relaxed">
                        {q.question}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-3 ml-11">
                    {q.options.map((opt, i) => {
                      const optionLetter = String.fromCharCode(65 + i);
                      const isSelected = selectedAnswers[idx] === optionLetter;
                      const isCorrect =
                        quizSubmitted &&
                        (String(q.answer).trim().toUpperCase() ===
                          optionLetter ||
                          String(q.answer).trim() === String(opt).trim());

                      let optionClasses = "bg-white border-gray-200 hover:bg-gray-50";
                      let iconColor = "text-gray-400";
                      let showIcon = false;

                      if (quizSubmitted) {
                        if (isCorrect) {
                          optionClasses = "bg-green-50 border-green-300 text-green-800";
                          iconColor = "text-green-600";
                          showIcon = true;
                        } else if (isSelected) {
                          optionClasses = "bg-red-50 border-red-300 text-red-800";
                          iconColor = "text-red-600";
                          showIcon = true;
                        }
                      } else if (isSelected) {
                        optionClasses = "bg-blue-50 border-blue-300 text-blue-800";
                      }

                      return (
                        <motion.label
                          key={i}
                          className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all duration-200 ${optionClasses} ${
                            quizSubmitted ? 'cursor-default' : ''
                          }`}
                          whileHover={!quizSubmitted ? { scale: 1.01 } : {}}
                          whileTap={!quizSubmitted ? { scale: 0.99 } : {}}
                        >
                          <input
                            type="radio"
                            name={`q-${idx}`}
                            value={optionLetter}
                            checked={isSelected}
                            disabled={quizSubmitted}
                            onChange={() => handleAnswerSelect(idx, optionLetter)}
                            className="sr-only"
                          />
                          <span className="font-bold text-sm w-6 text-center">
                            {optionLetter}.
                          </span>
                          <span className="ml-3 flex-1">{opt}</span>
                          {showIcon && (
                            <div className="ml-2">
                              {isCorrect ? (
                                <CheckCircle size={20} className={iconColor} />
                              ) : isSelected ? (
                                <XCircle size={20} className={iconColor} />
                              ) : null}
                            </div>
                          )}
                        </motion.label>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 text-center">
              {!quizSubmitted ? (
                <motion.button
                  onClick={handleSubmitQuiz}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Submit Quiz
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleRetryQuiz}
                  className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold shadow-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Try Again
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Score Popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-blue-600" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Quiz Complete!
              </h2>
              <p className="text-gray-600 text-lg mb-6">
                You scored{" "}
                <span className="font-bold text-blue-600">{score}</span> out of{" "}
                <span className="font-bold">{quiz.length}</span>
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleRetryQuiz}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => setShowPopup(false)}
                  className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizFromPDF;