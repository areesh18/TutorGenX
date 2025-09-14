"use client"

import React, { useState } from "react"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"

const QuizFromPDF = () => {
  const [file, setFile] = useState(null)
  const [quiz, setQuiz] = useState([])
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [showPopup, setShowPopup] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleUpload = async () => {
    if (!file) return alert("Please select a PDF file first.")

    setLoading(true)
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
      console.log("Extracted Text:", extractedText)

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
      alert("Failed to generate quiz. Check console for details.")
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
    <div className="p-6 space-y-4">
      {/* File Upload */}
      <div className="flex gap-4 items-center">
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
        <button
          onClick={handleUpload}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow"
        >
          {loading ? "Processing..." : "Upload & Generate Quiz"}
        </button>
      </div>

      {/* Quiz Section */}
      {quiz.length > 0 && (
        <div className="space-y-4">
          {quiz.map((q, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-lg mb-3">
                {idx + 1}. {q.question}
              </h3>
              <ul className="space-y-2">
                {q.options.map((opt, i) => {
                  const optionLetter = String.fromCharCode(65 + i)
                  const isSelected = selectedAnswers[idx] === optionLetter
                  return (
                    <motion.li key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <label
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition ${
                          isSelected ? "bg-indigo-50 border-indigo-300" : "bg-white border-gray-200"
                        }`}
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
                        <span className="font-semibold">{optionLetter}.</span>
                        <span className="ml-2">{opt}</span>
                      </label>
                    </motion.li>
                  )
                })}
              </ul>
            </div>
          ))}

          {!quizSubmitted ? (
            <button
              onClick={handleSubmitQuiz}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={handleRetryQuiz}
              className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-2xl shadow-xl text-center"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <h2 className="text-xl font-semibold mb-2">Quiz Completed</h2>
              <p>
                You scored <span className="font-bold text-indigo-600">{score}</span> out of {quiz.length}
              </p>
              <div className="mt-4 flex gap-3 justify-center">
                <button
                  onClick={() => setShowPopup(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200"
                >
                  Close
                </button>
                <button
                  onClick={handleRetryQuiz}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Try Again
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
    