"use client"

import React, { useState } from "react"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, FileText, CheckCircle, XCircle, RefreshCcw } from 'lucide-react'

// Custom components for a cleaner UI
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 w-full max-w-xs sm:max-w-md mx-auto">
    <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
    <span className="text-gray-900 font-medium text-base sm:text-lg">Processing...</span>
    <span className="text-gray-500 text-xs sm:text-sm mt-1">This may take a moment.</span>
  </div>
)

const QuizFromPDF = () => {
  const [file, setFile] = useState(null)
  const [quiz, setQuiz] = useState([])
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [showPopup, setShowPopup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
    setError(null)
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a PDF file first.")
      return
    }

    setLoading(true)
    setError(null)
    setQuiz([])
    setScore(0)
    setQuizSubmitted(false)
    setSelectedAnswers({}) // <-- Add this line to reset answers
    
    try {
      // Step 1: Upload PDF -> get extracted text
      const formData = new FormData()
      formData.append("pdf", file)

      const textRes = await axios.post("http://localhost:8080/pdftext", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const extractedText = textRes.data

      // Step 2: Send extracted text -> get quiz
      const quizRes = await axios.post(
        "http://localhost:8080/quizfrompdf",
        { pdftext: extractedText },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      )
      setQuiz(quizRes.data.quiz || [])
    } catch (err) {
      console.error("Error generating quiz:", err)
      setError("Failed to generate quiz. Please check the console for details.")
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (questionIndex, optionLetter) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionLetter,
    }))
  }

  const handleSubmitQuiz = () => {
    let total = 0
    quiz.forEach((q, idx) => {
      const selectedLetter = selectedAnswers[idx]
      if (!selectedLetter) return
      const optionIndex = selectedLetter.charCodeAt(0) - 65
      const selectedText = q.options?.[optionIndex]
      const answer = q.answer

      const matchesByLetter =
        typeof answer === "string" && /^[A-Z]$/.test(answer.trim()) && answer.trim().toUpperCase() === selectedLetter
      const matchesByText = String(answer).trim() === String(selectedText).trim()

      if (matchesByLetter || matchesByText) total++
    })
    setScore(total)
    setQuizSubmitted(true)
    setShowPopup(true)
  }

  const handleRetryQuiz = () => {
    setSelectedAnswers({})
    setScore(0)
    setQuizSubmitted(false)
    setShowPopup(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 px-2 sm:px-6 py-4 flex flex-col items-center justify-center font-sans text-gray-900">
      
      {/* Main Content Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg sm:max-w-2xl md:max-w-3xl lg:max-w-4xl p-4 sm:p-8 bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-lg space-y-6"
      >
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-indigo-600 text-white rounded-full mb-4 shadow-md">
            <FileText size={28} className="sm:size-32" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Create a Quiz from PDF</h2>
          <p className="text-gray-600 text-sm sm:text-base">Upload a PDF and let AI generate a quiz for you instantly.</p>
        </div>

        {/* File Upload Section */}
        <div className="flex flex-col items-center justify-center p-4 sm:p-6 border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl bg-gray-50">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
            <input 
              type="file" 
              accept="application/pdf" 
              onChange={handleFileChange} 
              className="block w-full text-xs sm:text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-xs sm:file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
            />
            <motion.button
              onClick={handleUpload}
              disabled={loading || !file}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed w-full sm:w-auto"
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
          </div>
          {file && <p className="mt-4 text-xs sm:text-sm text-gray-600 break-all">Selected file: <span className="font-medium text-gray-800">{file.name}</span></p>}
          {error && <p className="mt-4 text-xs sm:text-sm text-red-600">{error}</p>}
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 sm:mt-8 w-full"
        >
          <LoadingSpinner />
        </motion.div>
      )}

      {/* Quiz Section */}
      <AnimatePresence mode="wait">
        {quiz.length > 0 && (
          <motion.div
            key="quiz-section"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-lg sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mt-6 sm:mt-8 space-y-6"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-center">Your Quiz</h3>
            <div className="space-y-4">
              {quiz.map((q, idx) => (
                <motion.div
                  key={idx}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl border border-gray-200 shadow-sm"
                >
                  <h3 className="font-semibold text-base sm:text-lg mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-full text-xs sm:text-sm font-bold">{idx + 1}</span>
                    {q.question}
                  </h3>
                  <ul className="space-y-2">
                    {q.options.map((opt, i) => {
                      const optionLetter = String.fromCharCode(65 + i)
                      const isSelected = selectedAnswers[idx] === optionLetter
                      const isCorrect = quizSubmitted && (String(q.answer).trim().toUpperCase() === optionLetter || String(q.answer).trim() === String(opt).trim())
                      
                      let labelClasses = "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                      if (quizSubmitted) {
                        if (isCorrect) {
                          labelClasses = "bg-emerald-50 border-emerald-300 text-emerald-800"
                        } else if (isSelected) {
                          labelClasses = "bg-rose-50 border-rose-300 text-rose-800"
                        }
                      } else if (isSelected) {
                        labelClasses = "bg-indigo-50 border-indigo-300 text-indigo-800"
                      }

                      return (
                        <motion.li key={i} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                          <label
                            className={`flex items-center p-2 sm:p-3 rounded-lg border cursor-pointer transition-colors duration-200 ${labelClasses} w-full`}
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
                            <span className="font-semibold w-5 text-center">{optionLetter}.</span>
                            <span className="ml-2 break-words">{opt}</span>
                          </label>
                        </motion.li>
                      )
                    })}
                  </ul>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              {!quizSubmitted ? (
                <motion.button
                  onClick={handleSubmitQuiz}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold shadow-md"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  Submit Quiz
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleRetryQuiz}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold shadow-md"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  Retry
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-4 sm:p-8 rounded-xl sm:rounded-2xl shadow-2xl text-center w-full max-w-xs sm:max-w-sm"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-indigo-100 text-indigo-600 rounded-full mb-4">
                <CheckCircle size={28} className="sm:size-32" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Quiz Completed!</h2>
              <p className="text-gray-600 text-base sm:text-lg">
                You scored <span className="font-bold text-indigo-600">{score}</span> out of {quiz.length} questions.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={handleRetryQuiz}
                  className="w-full px-4 py-2.5 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => setShowPopup(false)}
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default QuizFromPDF