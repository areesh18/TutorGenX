import React, { useCallback, useEffect, useState, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const QuizSection = React.memo(({ selectedTopic, explanation, isVisible }) => {
  const [quiz, setQuiz] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const quizContainerRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const [isLoading, setIsLoading] = useState(false);
  const lastGeneratedTopic = useRef(null);
  // Save scroll position before state updates
  const saveScrollPosition = () => {
    if (quizContainerRef.current) {
      scrollPositionRef.current = quizContainerRef.current.scrollTop;
    }
  };

  // Restore scroll position after state updates
  const restoreScrollPosition = () => {
    if (quizContainerRef.current) {
      requestAnimationFrame(() => {
        quizContainerRef.current.scrollTop = scrollPositionRef.current;
      });
    }
  };

  // Generate quiz when tab becomes visible
  useEffect(() => {
    const generateQuiz = async () => {

      if (isLoading) {
    console.log("Already loading, skipping..."); // Debug log
    return;
  }
      if (
        !isVisible ||
        !explanation ||
        !selectedTopic ||
        lastGeneratedTopic.current === selectedTopic ||
        isLoading
      ) {
        return;
      }
      setIsLoading(true);
      lastGeneratedTopic.current = selectedTopic;

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
          }
        );
        setQuiz(res.data.quiz);
      } catch (err) {
        console.error("Quiz generation failed:", err);
        lastGeneratedTopic.current = null;
      } finally {
        setIsLoading(false);
      }
    };

    if (isVisible && explanation && selectedTopic) {
      generateQuiz();
    }
  }, [isVisible, explanation, selectedTopic]);

  // Handle escape key for popup
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setShowPopup(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Clear quiz data when topic changes
  useEffect(() => {
    if (selectedTopic !== lastGeneratedTopic.current) {
      setSelectedAnswers({});
      setQuizSubmitted(false);
      setScore(0);
      setShowPopup(false);
      setQuiz([]);
      lastGeneratedTopic.current = null; // Reset the ref
    }
  }, [selectedTopic]);

  const handleAnswerSelect = (questionIndex, optionLetter) => {
    saveScrollPosition();
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionLetter,
    }));
    restoreScrollPosition();
  };

  const handleSubmitQuiz = () => {
  let total = 0;
  quiz.forEach((q, idx) => {
    const selectedLetter = selectedAnswers[idx]; // "A", "B", "C", "D"
    
    if (selectedLetter) {
      // Convert letter to array index: A=0, B=1, C=2, D=3
      const selectedIndex = selectedLetter.charCodeAt(0) - 65;
      const selectedOptionText = q.options[selectedIndex];
      
      // Compare the actual option text with the answer
      if (selectedOptionText === q.answer) {
        total++;
      }
    }
  });
  
  console.log("Final score:", total); // Debug log
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

  if (!isVisible) return null;

  return (
    <>
      {/* Internal Loading Spinner */}
      {isLoading && (
        <div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
        >
          <div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-6 sm:p-10 flex flex-col items-center justify-center min-w-[80vw] sm:min-w-[25vw] border border-slate-700/50"
          >
            <div className="relative mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
              <div
                className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 border-4 border-purple-400/20 border-b-purple-400 rounded-full animate-spin"
                style={{
                  animationDirection: "reverse",
                  animationDuration: "1.5s",
                }}
              ></div>
            </div>
            <span className="text-white font-semibold text-base sm:text-lg">
              Generating quiz...
            </span>
            <span className="text-gray-400 text-xs sm:text-sm mt-2">
              This may take a moment
            </span>
          </div>
        </div>
      )}
      <div ref={quizContainerRef} className="space-y-4 sm:space-y-6">
        {quiz.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-40 sm:h-64 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 text-xl sm:text-2xl">
              😅
            </div>
            <p className="text-gray-400 text-base sm:text-lg px-4">
              Sorry we are down now kid
            </p>
          </div>
        ) : (
          quiz.map((q, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-r from-slate-800/60 to-slate-700/40 p-4 sm:p-6 rounded-xl border border-slate-600/30 backdrop-blur-sm"
            >
              <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 text-white flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold">
                  {idx + 1}
                </div>
                <span className="break-words">{q.question}</span>
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                {q.options.map((opt, i) => {
                  const optionLetter = String.fromCharCode(65 + i);
                 const isCorrect = opt === q.answer;
                  const isSelected = selectedAnswers[idx] === optionLetter;

                  return (
                    <motion.li
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <label
                        className={`flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-lg cursor-pointer transition-all duration-300 border text-sm sm:text-base ${
                          quizSubmitted && isCorrect
                            ? "bg-green-500/20 border-green-400/50 text-green-300"
                            : quizSubmitted && isSelected && !isCorrect
                            ? "bg-red-500/20 border-red-400/50 text-red-300"
                            : isSelected
                            ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-300"
                            : "bg-slate-700/30 border-slate-600/30 text-gray-300 hover:bg-slate-600/40 hover:border-slate-500/40"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${idx}`}
                          value={optionLetter}
                          checked={isSelected}
                          disabled={quizSubmitted}
                          onChange={() => handleAnswerSelect(idx, optionLetter)}
                          className="hidden w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 bg-slate-700 border-slate-600 focus:ring-cyan-500 focus:ring-2"
                        />
                        <span className="flex items-center gap-2 min-w-0">
                          <span className="font-semibold flex-shrink-0">
                            {optionLetter}.
                          </span>
                          <span className="break-words">{opt}</span>
                        </span>
                      </label>
                    </motion.li>
                  );
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
              className={`w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 sm:px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base ${
                quizSubmitted ? "opacity-50 cursor-not-allowed" : ""
              }`}
              whileHover={!quizSubmitted ? { scale: 1.05 } : {}}
              whileTap={!quizSubmitted ? { scale: 0.95 } : {}}
            >
              Submit Quiz 🚀
            </motion.button>
            {quizSubmitted && (
              <motion.button
                className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 sm:px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                onClick={handleRetryQuiz}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Retry 🔄
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
                className="absolute inset-0 bg-black/70 backdrop-blur-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowPopup(false)}
              />

              {/* Modal */}
              <motion.div
                className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 sm:p-6 md:p-8 w-full max-w-xs sm:max-w-sm md:max-w-md mx-3 sm:mx-4 shadow-2xl border border-slate-700/50"
                initial={{ scale: 0.5, opacity: 0, rotateX: -15 }}
                animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                exit={{ scale: 0.5, opacity: 0, rotateX: 15 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="text-center">
                  <div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: 0.2,
                      type: "spring",
                      stiffness: 200,
                    }}
                    className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-xl sm:text-2xl mx-auto mb-4"
                  >
                    🎉
                  </div>

                  <h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl sm:text-2xl font-bold mb-3 text-white"
                  >
                    Quiz Completed!
                  </h2>

                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mb-4 text-gray-300 text-base sm:text-lg text-center"
                  >
                    You scored{" "}
                    <span className="font-bold text-cyan-400 text-lg sm:text-xl">
                      {score}
                    </span>{" "}
                    out of {quiz.length}.
                  </motion.p>

                  <div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {score === quiz.length ? (
                      <p className="text-green-400 font-semibold text-base sm:text-lg flex items-center justify-center gap-2">
                        Perfect score!{" "}
                        <span className="text-xl sm:text-2xl">🏆</span>
                      </p>
                    ) : score >= quiz.length / 2 ? (
                      <p className="text-blue-400 font-semibold text-base sm:text-lg flex items-center justify-center gap-2">
                        Good job! Keep practicing!{" "}
                        <span className="text-xl sm:text-2xl">💪</span>
                      </p>
                    ) : (
                      <p className="text-orange-400 font-semibold text-base sm:text-lg flex items-center justify-center gap-2">
                        Don't give up – you'll get it!{" "}
                        <span className="text-xl sm:text-2xl">🚀</span>
                      </p>
                    )}
                  </div>

                  <div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-6"
                  >
                    <button
                      onClick={() => setShowPopup(false)}
                      className="px-4 sm:px-6 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors text-sm sm:text-base"
                    >
                      Close
                    </button>
                    <button
                      onClick={handleRetryQuiz}
                      className="px-4 sm:px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all text-sm sm:text-base"
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
  );
});

QuizSection.displayName = "QuizSection";

export default QuizSection;
