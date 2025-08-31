"use client"

import React, { useEffect, useState, useRef } from "react"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"

const QuizSection = React.memo(({ selectedTopic, explanation, isVisible, currentWeekIndex, currentTopicIndex }) => {
  const [quizCache, setQuizCache] = useState({})
  const [quiz, setQuiz] = useState([])
  // Helper function to generate cache key
  const getCacheKey = (topic, weekIndex, topicIndex) => {
    return `${weekIndex}-${topicIndex}-${topic}`
  }
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [showPopup, setShowPopup] = useState(false)
  const quizContainerRef = useRef(null)
  const scrollPositionRef = useRef(0)
  const [isLoading, setIsLoading] = useState(false)
  // Save scroll position before state updates
  const saveScrollPosition = () => {
    if (quizContainerRef.current) {
      scrollPositionRef.current = quizContainerRef.current.scrollTop
    }
  }

  // Restore scroll position after state updates
  const restoreScrollPosition = () => {
    if (quizContainerRef.current) {
      requestAnimationFrame(() => {
        quizContainerRef.current.scrollTop = scrollPositionRef.current
      })
    }
  }

  // Generate quiz when tab becomes visible
  useEffect(() => {
    const generateQuiz = async () => {
      if (!isVisible || !explanation || !selectedTopic || explanation === "Loading...") {
        return
      }
      const cacheKey = getCacheKey(selectedTopic, currentWeekIndex, currentTopicIndex)
      // Check if quiz is already cached
      if (quizCache[cacheKey]) {
        console.log("Loading quiz from cache for:", selectedTopic)
        setQuiz(quizCache[cacheKey])
        setIsLoading(false)
        return
      }

      if (isLoading) {
        console.log("Already loading, skipping...") // Debug log
        return
      }
      if (!isVisible || !explanation || !selectedTopic || isLoading) {
        return
      }
      setIsLoading(true)

      try {
        const res = await axios.post(
          "http://localhost:8080/quiz",
          {
            topic: selectedTopic,
            explanation: explanation,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        )
        const quizData = res.data.quiz
        setQuiz(quizData)

        // ADD THIS: Cache the quiz data
        setQuizCache((prev) => ({
          ...prev,
          [cacheKey]: quizData,
        }))
      } catch (err) {
        console.error("Quiz generation failed:", err)
      } finally {
        setIsLoading(false)
      }
    }

    if (isVisible && explanation && selectedTopic) {
      generateQuiz()
    }
  }, [isVisible, explanation, selectedTopic, currentWeekIndex, currentTopicIndex])

  // Handle escape key for popup
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setShowPopup(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const handleAnswerSelect = (questionIndex, optionLetter) => {
    saveScrollPosition()
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionLetter,
    }))
    restoreScrollPosition()
  }

  const handleSubmitQuiz = () => {
    let total = 0

    quiz.forEach((q, idx) => {
      const selectedLetter = selectedAnswers[idx]
      if (!selectedLetter) return

      const optionIndex = selectedLetter.charCodeAt(0) - 65 // A=0, B=1, ...
      const selectedText = q.options?.[optionIndex]

      const answer = q.answer
      const matchesByLetter =
        typeof answer === "string" && /^[A-Z]$/.test(answer.trim()) && answer.trim().toUpperCase() === selectedLetter

      const matchesByText =
        (typeof answer === "string" || typeof answer === "number") &&
        String(answer).trim() === String(selectedText).trim()

      if (matchesByLetter || matchesByText) {
        total++
      }
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

  if (!isVisible) return null

  return (
    <>
      {/* Internal Loading Spinner */}
      {isLoading && (
        <div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        >
          <div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white text-slate-900 rounded-xl shadow-xl p-8 sm:p-10 ring-1 ring-gray-200 flex flex-col items-center justify-center min-w-[80vw] sm:min-w-[25vw]"
          >
            <div className="relative mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
            </div>
            <span className="font-semibold text-base sm:text-lg">Generating quiz...</span>
            <span className="text-slate-500 text-xs sm:text-sm mt-2">This may take a moment</span>
          </div>
        </div>
      )}
      <div ref={quizContainerRef} className="space-y-4 sm:space-y-6 min-w-0">
        {quiz.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-40 sm:h-56 text-center rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-50 text-indigo-700 grid place-items-center mb-3 ring-1 ring-indigo-100">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 17h.01M11 7h2v7h-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <p className="text-slate-600 text-sm sm:text-base px-4">
              No quiz available yet. Try generating again in a moment.
            </p>
          </div>
        ) : (
          quiz.map((q, idx) => (
            <div key={idx} className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 text-slate-900 flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-50 text-indigo-700 grid place-items-center text-xs sm:text-sm font-bold ring-1 ring-indigo-100">
                  {idx + 1}
                </div>
                <span className="break-words text-pretty">{q.question}</span>
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                {q.options.map((opt, i) => {
                  const optionLetter = String.fromCharCode(65 + i)
                  const answer = q.answer
                  const matchesByLetter =
                    typeof answer === "string" &&
                    /^[A-Z]$/.test(answer.trim()) &&
                    answer.trim().toUpperCase() === optionLetter
                  const matchesByText =
                    (typeof answer === "string" || typeof answer === "number") &&
                    String(answer).trim() === String(opt).trim()
                  const isCorrect = matchesByLetter || matchesByText

                  const isSelected = selectedAnswers[idx] === optionLetter

                  return (
                    <motion.li key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <label
                        className={`flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-lg cursor-pointer transition-colors duration-200 border text-sm sm:text-base focus-within:ring-2 focus-within:ring-indigo-500 ${
                          quizSubmitted && isCorrect
                            ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                            : quizSubmitted && isSelected && !isCorrect
                              ? "bg-rose-50 border-rose-300 text-rose-800"
                              : isSelected
                                ? "bg-indigo-50 border-indigo-300 text-indigo-800"
                                : "bg-white border-gray-200 text-slate-700 hover:bg-slate-50"
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
                        <span className="flex items-center gap-2 min-w-0">
                          <span className="font-semibold flex-shrink-0">{optionLetter}.</span>
                          <span className="break-words text-pretty">{opt}</span>
                        </span>
                      </label>
                    </motion.li>
                  )
                })}
              </ul>
            </div>
          ))
        )}

        {quiz.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <motion.button
              onClick={handleSubmitQuiz}
              disabled={quizSubmitted}
              className={`w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold shadow-sm transition-colors text-sm sm:text-base ${
                quizSubmitted ? "opacity-50 cursor-not-allowed" : ""
              }`}
              whileHover={!quizSubmitted ? { scale: 1.02 } : {}}
              whileTap={!quizSubmitted ? { scale: 0.98 } : {}}
            >
              Submit Quiz
            </motion.button>
            {quizSubmitted && (
              <motion.button
                className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold shadow-sm transition-colors text-sm sm:text-base"
                onClick={handleRetryQuiz}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Retry
              </motion.button>
            )}
          </div>
        )}

        {/* Animated Popup */}
        <AnimatePresence>
          {showPopup && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowPopup(false)}
              />

              {/* Modal */}
              <motion.div
                className="relative bg-white rounded-2xl p-6 sm:p-8 w-full max-w-xs sm:max-w-sm md:max-w-md mx-4 shadow-xl ring-1 ring-gray-200"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-indigo-50 text-indigo-600 grid place-items-center mx-auto mb-4 ring-1 ring-indigo-100">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M5 12l4 4L19 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-slate-900">Quiz Completed</h2>

                  <motion.p className="mb-4 text-slate-600 text-sm sm:text-base">
                    You scored <span className="font-semibold text-indigo-600">{score}</span> out of {quiz.length}.
                  </motion.p>

                  <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-6">
                    <button
                      onClick={() => setShowPopup(false)}
                      className="px-4 sm:px-6 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    >
                      Close
                    </button>
                    <button
                      onClick={handleRetryQuiz}
                      className="px-4 sm:px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
})

QuizSection.displayName = "QuizSection"

export default QuizSection
