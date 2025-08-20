import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"; // theme (you can pick another)
import QuizSection from "./QuizSection"; // Add this line after other imports/*  */
function LearnPage() {
  const { roadmapId } = useParams();
  const [roadmap, setRoadmap] = useState(null);
  const [activeTab, setActiveTab] = useState("content");
  const [openWeek, setOpenWeek] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [explanation, setExplanation] = useState("");
  /* const [quiz, setQuiz] = useState([]); */
  /* const [selectedAnswers, setSelectedAnswers] = useState({}); */
  const [simplifiedExp, setSimplifiedExp] = useState("");
  const [examples, setExamples] = useState([]); // array of example objects
  const [loadingTabData, setLoadingTabData] = useState(false); // loading spinner
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [updating, setUpdating] = useState(false);
  /* const [quizSubmitted, setQuizSubmitted] = useState(false); */
  /* const [showPopup, setShowPopup] = useState(false); */
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar toggle
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleRoadmapClick = () => {
    setShowHint(false);
    setSidebarOpen(true);
  };
 /*  const [score, setScore] = useState(0); */

  const fetchRoadmap = useCallback(async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/roadmap/${roadmapId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setRoadmap(res.data);
    } catch (err) {
      console.error("Failed to fetch roadmap:", err);
    }
  }, [roadmapId]);

  useEffect(() => {
    if (
      roadmap &&
      roadmap.weeks &&
      roadmap.weeks.length > 0 &&
      !selectedTopic
    ) {
      const sortedWeeks = [...roadmap.weeks].sort((a, b) => a.week - b.week);
      const firstWeek = sortedWeeks[0];
      const topics = JSON.parse(firstWeek.topics);
      if (topics.length > 0) {
        handleExplainTopic(topics[0], 0, 0);
        setOpenWeek(0);
      }
    }
  }, [roadmap, selectedTopic]);
  useEffect(() => {
    const generateExample = async () => {
      setLoadingTabData(true);
      try {
        const res = await axios.post(
          "http://localhost:8080/example",
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
        setExamples(res.data.examples);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingTabData(false);
      }
    };
    if (activeTab == "example" && explanation) {
      generateExample();
    }
  }, [activeTab, explanation, selectedTopic]);

  useEffect(() => {
    const generateSimplifiedExp = async () => {
      setLoadingTabData(true);
      try {
        const res = await axios.post(
          "http://localhost:8080/simplify",
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
        setSimplifiedExp(res.data.simplifiedexplanation);
      } catch (err) {
        console.error("Simplification failed:", err);
      } finally {
        setLoadingTabData(false);
      }
    };
    if (activeTab == "simplify" && explanation) {
      generateSimplifiedExp();
    }
  }, [activeTab, explanation, selectedTopic]);

  /* useEffect(() => {
    const generateQuiz = async () => {
      setLoadingTabData(true);
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
      } finally {
        setLoadingTabData(false);
      }
    };

    if (activeTab === "quiz" && explanation) {
      generateQuiz();
    }
  }, [activeTab, explanation, selectedTopic]); */

  /* useEffect(() => {
    // This function runs when a key is pressed
    const onKey = (e) => e.key === "Escape" && setShowPopup(false);

    // Attach the function to the 'keydown' event
    window.addEventListener("keydown", onKey);

    // Cleanup: remove event listener when component unmounts
    return () => window.removeEventListener("keydown", onKey);
  }, []); */

  useEffect(() => {
    fetchRoadmap();
  }, [fetchRoadmap]);

  if (!roadmap)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-xs sm:max-w-sm"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
            <div
              className="absolute inset-0 w-16 h-16 border-4 border-purple-400/20 border-b-purple-400 rounded-full animate-spin mx-auto"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            ></div>
          </div>
          <p className="text-white text-lg font-medium">Loading roadmap...</p>
        </motion.div>
      </div>
    );

  const handlePrevButton = () => {
    /*     console.log("Clicked Prev");
    console.log("roadmap:", roadmap);
    console.log("currentWeekIndex:", currentWeekIndex);
    console.log("currentTopicIndex:", currentTopicIndex); */

    if (!roadmap || !roadmap.weeks) {
      return;
    }
    setActiveTab("content");
    const sortedWeeks = [...roadmap.weeks].sort((a, b) => a.week - b.week);
    let prevWeekIndex = currentWeekIndex;
    let prevTopicIndex = currentTopicIndex - 1;
    if (prevTopicIndex < 0) {
      prevWeekIndex--;
      if (prevWeekIndex < 0) {
        return;
      }
      const prevWeekTopics = JSON.parse(sortedWeeks[prevWeekIndex].topics);
      prevTopicIndex = prevWeekTopics.length - 1;
    }
    const prevWeek = sortedWeeks[prevWeekIndex];
    const prevTopics = JSON.parse(prevWeek.topics);
    const prevTopic = prevTopics[prevTopicIndex];
    if (!prevTopic) {
      console.warn("Previous topic not found");
      return;
    }
    setOpenWeek(prevWeekIndex);
    handleExplainTopic(prevTopic, prevWeekIndex, prevTopicIndex);
  };

  const isCurrentTopicCompleted = () => {
    if (!roadmap || !roadmap.weeks) return false;

    // Use sorted weeks to get the correct week
    const sortedWeeks = [...roadmap.weeks].sort((a, b) => a.week - b.week);
    const week = sortedWeeks[currentWeekIndex];

    if (!week) return false;

    let progress = [];
    try {
      progress = JSON.parse(week.progress || "[]");
    } catch {
      progress = [];
    }

    return progress[currentTopicIndex] === true;
  };
  const handleMarkAsCompletedButton = async () => {
    if (updating) return; // ignore clicks while updating
    setUpdating(true);

    try {
      // Get the correct week using sorted weeks
      const sortedWeeks = [...roadmap.weeks].sort((a, b) => a.week - b.week);
      const currentWeek = sortedWeeks[currentWeekIndex];

      if (!currentWeek) {
        console.warn("Current week not found");
        setUpdating(false);
        return;
      }

      const currentlyCompleted = isCurrentTopicCompleted();
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:8080/update-progress",
        {
          roadmap_id: roadmap.ID,
          week_id: currentWeek.ID, // Use the correct week ID from sorted array
          topic_index: currentTopicIndex,
          value: !currentlyCompleted, // toggle
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Refresh the roadmap data
      await fetchRoadmap();
    } catch (err) {
      console.error("⚠️ Error updating completion status:", err);
      alert("Failed to update completion status.");
    } finally {
      setUpdating(false);
    }
  };

  const handleNextButton = () => {
    /*   console.log("Clicked Next");
    console.log("roadmap:", roadmap);
    console.log("currentWeekIndex:", currentWeekIndex);
    console.log("currentTopicIndex:", currentTopicIndex); */

    if (!roadmap || !roadmap.weeks) {
      console.warn("Roadmap or weeks missing");
      return;
    }
    setActiveTab("content");
    const sortedWeeks = [...roadmap.weeks].sort((a, b) => a.week - b.week);
    let nextWeekIndex = currentWeekIndex;
    let nextTopicIndex = currentTopicIndex + 1;

    const currentWeek = sortedWeeks[currentWeekIndex];
    if (!currentWeek) {
      console.warn("Current week not found");
      return;
    }

    const topics = JSON.parse(currentWeek.topics);

    if (nextTopicIndex >= topics.length) {
      nextWeekIndex++;
      nextTopicIndex = 0;
    }

    if (nextWeekIndex >= sortedWeeks.length) {
      console.warn("No more weeks");
      return;
    }

    const nextWeek = sortedWeeks[nextWeekIndex];
    const nextTopics = JSON.parse(nextWeek.topics);
    const nextTopic = nextTopics[nextTopicIndex];

    /* console.log("Navigating to:", {
      week: nextWeekIndex,
      topic: nextTopic,
      topicIndex: nextTopicIndex,
    });
 */
    if (!nextTopic) {
      console.warn("Next topic not found");
      return;
    }
    setOpenWeek(nextWeekIndex);
    handleExplainTopic(nextTopic, nextWeekIndex, nextTopicIndex);
  };

  const handleExplainTopic = async (topic, weekIndex, topicIndex) => {
    setCurrentWeekIndex(weekIndex);
    setCurrentTopicIndex(topicIndex);
    setLoadingTabData(true);
    setSelectedTopic(topic);
    setExplanation("Loading...");
    setSidebarOpen(false); // Close mobile sidebar when topic is selected

    // Clear quiz-related state when changing topics
    /* setSelectedAnswers({});
    setQuizSubmitted(false);
    setScore(0);
    setShowPopup(false); */

    // Clear other tab data as well
    setSimplifiedExp("");
    setExamples([]);
    /* setQuiz([]); */ // Clear the quiz array

    try {
      const res = await axios.post(
        "http://localhost:8080/explain-topic",
        { topic },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setExplanation(res.data.explanation);
    } catch (err) {
      setExplanation("Failed to fetch explanation.");
      console.error(err);
    } finally {
      setLoadingTabData(false);
    }
  };
  const handleCopyCode = async (code) => {
  try {
    await navigator.clipboard.writeText(code);
    // You could add a toast notification here
    console.log('Code copied to clipboard!');
  } catch (err) {
    console.error('Failed to copy code:', err);
  }
};
  // Sidebar component
  const RoadmapSidebar = () => {
    const totalWeeks = roadmap.weeks.length;
    const compactMode = totalWeeks > 6; // Compact if too many weeks

    return (
      <>
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <motion.aside
          className={`
  ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
  lg:translate-x-0 transition-transform duration-300
  fixed lg:sticky top-0 left-0 z-50 lg:z-auto
  w-[85vw] xs:w-80 sm:w-96 lg:w-80 xl:w-96
  h-screen lg:h-[90vh] 
  bg-gradient-to-b from-slate-800/90 to-slate-900/90 
  backdrop-blur-xl rounded-none lg:rounded-2xl 
  border-r lg:border border-slate-700/50 
  shadow-2xl self-start p-3 xs:p-4 sm:p-6 
  overflow-y-auto
  ${compactMode ? "text-sm space-y-2 xs:space-y-3" : "space-y-3 xs:space-y-4"}
`}
          style={{
            background:
              "linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 50%, rgba(15, 23, 42, 0.9) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(148, 163, 184, 0.1)",
          }}
        >
          {/* Mobile close button */}
          <button
            className="lg:hidden absolute top-4 right-4 text-white hover:text-red-400 transition-colors z-10"
            onClick={() => setSidebarOpen(false)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Header */}
          <div className="mb-3 xs:mb-4 sm:mb-6">
            <h2 className="text-base xs:text-lg sm:text-xl font-bold flex items-center gap-2 xs:gap-3 text-white mb-2">
              <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center text-sm xs:text-base flex-shrink-0">
                🧭
              </div>
              <span className="truncate min-w-0">Roadmap</span>
            </h2>
          </div>

          {/* Weeks */}
          <motion.ul className="space-y-2">
            {roadmap.weeks
              .slice()
              .sort((a, b) => a.week - b.week)
              .map((week, idx) => {
                const topics = JSON.parse(week.topics);
                const progress = JSON.parse(week.progress);
                const isOpen = openWeek === idx;
                const completedTopics = progress.filter(Boolean).length;
                const progressPercentage =
                  (completedTopics / topics.length) * 100;

                return (
                  <motion.li
                    key={week.ID}
                    className={`border border-slate-600/50 rounded-xl ${
                      compactMode ? "p-2 xs:p-3 sm:p-3" : "p-3 xs:p-4 sm:p-4"
                    } bg-gradient-to-r from-slate-700/30 to-slate-600/20 backdrop-blur-sm hover:from-slate-600/40 hover:to-slate-500/30 active:from-slate-500/50 active:to-slate-400/40 transition-all duration-300 touch-manipulation`}
                    whileHover={{ scale: 1.01, y: -1 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {/* Week Title */}
                    <button
                      onClick={() => setOpenWeek(isOpen ? null : idx)}
                      className={`flex items-center justify-between w-full text-left font-semibold ${
                        compactMode
                          ? "text-xs xs:text-sm sm:text-sm"
                          : "text-sm xs:text-base sm:text-base"
                      } text-white group min-h-[44px] py-2 touch-manipulation`}
                    >
                      <div className="flex items-center min-w-0">
                        <motion.span
                          className="mr-2 sm:mr-3 text-cyan-400 flex-shrink-0"
                          animate={{ rotate: isOpen ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          ▶
                        </motion.span>
                        <span className="mr-2 sm:mr-3 text-base sm:text-lg flex-shrink-0">
                          📁
                        </span>
                        <span className="group-hover:text-cyan-300 transition-colors truncate">
                          {week.week}. {week.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 ml-2">
                        <div className="w-8 sm:w-12 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 min-w-[2rem] sm:min-w-[3rem]">
                          {completedTopics}/{topics.length}
                        </span>
                      </div>
                    </button>

                    {/* Topics */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-3 sm:mt-4 space-y-1 sm:space-y-2 overflow-hidden"
                        >
                          {topics.map((topic, i) => (
                            <motion.li
                              key={i}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.1 * i }}
                            >
                              <motion.button
                                onClick={() =>
                                  handleExplainTopic(topic, idx, i)
                                }
                                className={`flex items-center w-full text-left rounded-xl px-2 xs:px-3 sm:px-3 py-2.5 xs:py-3 transition-all duration-200 min-h-[44px] touch-manipulation ${
                                  progress[i]
                                    ? "text-green-400 bg-green-500/10 border border-green-500/20 hover:bg-green-500/15 active:bg-green-500/20"
                                    : "text-gray-300 hover:text-white hover:bg-slate-600/30 active:bg-slate-500/40"
                                } ${
                                  selectedTopic === topic
                                    ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-l-4 border-l-cyan-400 font-bold shadow-lg"
                                    : ""
                                }`}
                                style={{
                                  fontSize: compactMode
                                    ? "0.75rem"
                                    : "0.875rem",
                                  lineHeight: compactMode ? "1.2" : "1.4",
                                }}
                                whileHover={{ x: 2 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <span className="mr-2 xs:mr-3 text-base xs:text-lg flex-shrink-0">
                                  {progress[i] ? "✅" : "📄"}
                                </span>
                                <span
                                  className={`${
                                    progress[i] ? "line-through opacity-75" : ""
                                  } truncate break-words hyphens-auto leading-tight`}
                                >
                                  {topic}
                                </span>
                              </motion.button>
                            </motion.li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </motion.li>
                );
              })}
          </motion.ul>
        </motion.aside>
      </>
    );
  };

  //Main section
  const MainSection = () => (
    <div
      className="flex-1 rounded-none lg:rounded-2xl h-[100svh] lg:h-[90vh] w-full max-w-none lg:max-w-4xl flex flex-col overflow-hidden lg:mr-6 min-h-0"
      style={{
        background:
          "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 50%, rgba(15, 23, 42, 0.95) 100%)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(148, 163, 184, 0.1)",
        boxShadow:
          "0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
      }}
    >
      {/* Header */}
      <div className="p-4 sm:p-6 lg:p-8 border-b border-slate-700/50 flex-shrink-0">
        {/* Mobile menu button and title */}
        <div className="flex items-center mb-4 lg:mb-6">
          <button
            className="lg:hidden flex items-center gap-1 text-white hover:text-cyan-400 active:text-cyan-300 transition-all duration-300 mr-2 xs:mr-3 group relative touch-manipulation min-h-[44px] min-w-[44px]"
            onClick={handleRoadmapClick}
          >
            {/* Hint tooltip - only shows when showHint is true */}
            {showHint && (
              <div className="absolute -bottom-14 xs:-bottom-12 left-0 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg text-xs font-bold whitespace-nowrap shadow-xl z-50 animate-bounce">
                <div className="flex items-center gap-1">
                  <span className="text-sm">👆</span>
                  <span className="text-[10px] xs:text-xs">
                    Tap for Roadmap
                  </span>
                </div>
                <div className="absolute bottom-full left-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-cyan-500"></div>
              </div>
            )}

            <div className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 rounded-xl flex items-center justify-center shadow-lg border border-slate-500/30 group-hover:border-cyan-400/50 group-hover:shadow-cyan-400/25 group-hover:scale-105 group-active:scale-95 transition-all duration-300">
              <svg
                className="w-4 h-4 text-slate-300 group-hover:text-cyan-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="3" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
                <path d="M12 8v1m0 6v1" strokeLinecap="round" />
                <path
                  d="M9 9l-1.5-1.5M15 15l1.5 1.5M6 12H4m16 0h-2M9 15l-1.5 1.5M15 9l1.5-1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </button>

          <h1 className="text-base sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent flex-1 lg:flex-none">
            {roadmap?.title || "Learning Roadmap"}
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-xl border border-slate-600/30 overflow-x-auto">
          {["Content", "Simplify", "Quiz", "Example"].map((tab, index) => (
            <motion.button
              key={tab}
              className={`flex-shrink-0 px-3 sm:px-4 py-2 sm:py-3 font-semibold rounded-lg transition-all duration-300 relative overflow-hidden text-sm sm:text-base ${
                activeTab === tab.toLowerCase()
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25"
                  : "text-gray-400 hover:text-white hover:bg-slate-700/50"
              }`}
              onClick={() => setActiveTab(tab.toLowerCase())}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {activeTab === tab.toLowerCase() && (
                <div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg"
                  style={{ zIndex: -1 }}
                />
              )}
              {tab}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Main scrollable content */}
      <div
        className="flex-1 text-zinc-100 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6 lg:p-8 space-y-3 sm:space-y-4 md:space-y-6 custom-scrollbar w-full"
        style={{
          height: "calc(100vh - 280px)",
          minHeight: "300px",
          maxHeight: "calc(100vh - 280px)",
        }}
      >
        {/* Content Tab */}
        {activeTab === "content" && (
          <div>
            {explanation === "" ? (
              <div className="flex flex-col items-center justify-center h-40 sm:h-64 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center mb-4 text-2xl sm:text-3xl">
                  📘
                </div>
                <p className="text-gray-400 text-base sm:text-lg px-4">
                  Click a topic and switch to this tab to generate an
                  explanation.
                </p>
              </div>
            ) : (
              <>
                {selectedTopic && (
                  <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-xs sm:text-sm">
                      📘
                    </div>
                    <span className="break-words">{selectedTopic}</span>
                  </h2>
                )}

                <div
                  className="prose prose-invert max-w-none w-full overflow-x-hidden
    prose-headings:font-bold prose-headings:text-white prose-headings:mb-4
    prose-h2:text-2xl prose-h3:text-xl prose-h3:text-blue-400
    prose-p:text-base prose-p:leading-7 prose-p:mb-4"
                >
                  <ReactMarkdown
                    components={{
                      // Enhanced code block rendering
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        return !inline && match ? (
                          <div className="my-6 rounded-lg overflow-hidden border border-gray-700">
                            <div className="bg-gray-800 px-4 py-2 text-sm text-gray-300 border-b border-gray-700">
                              {match[1].toUpperCase()}
                            </div>
                            <SyntaxHighlighter
                              style={oneDark}
                              language={match[1]}
                              PreTag="div"
                              customStyle={{
                                margin: 0,
                                borderRadius: 0,
                                background: "#1e1e1e",
                              }}
                              {...props}
                            >
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          </div>
                        ) : (
                          <code
                            className="bg-gray-800 px-2 py-1 rounded text-blue-300 font-mono text-sm"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },

                      // Enhanced table rendering
                      table({ children, ...props }) {
                        return (
                          <div className="my-6 overflow-x-auto rounded-lg border border-gray-700 bg-gray-900">
                            <table
                              className="w-full text-sm text-left text-gray-300"
                              {...props}
                            >
                              {children}
                            </table>
                          </div>
                        );
                      },

                      // Table header styling
                      thead({ children, ...props }) {
                        return (
                          <thead
                            className="text-xs text-gray-100 uppercase bg-gray-800 border-b border-gray-700"
                            {...props}
                          >
                            {children}
                          </thead>
                        );
                      },

                      // Table header cell styling
                      th({ children, ...props }) {
                        return (
                          <th
                            className="px-4 py-3 font-semibold text-blue-400 border-r border-gray-700 last:border-r-0"
                            {...props}
                          >
                            {children}
                          </th>
                        );
                      },

                      // Table body styling
                      tbody({ children, ...props }) {
                        return (
                          <tbody className="bg-gray-900" {...props}>
                            {children}
                          </tbody>
                        );
                      },

                      // Table row styling with alternating colors
                      tr({ children, ...props }) {
                        return (
                          <tr
                            className="border-b border-gray-700 hover:bg-gray-800 transition-colors"
                            {...props}
                          >
                            {children}
                          </tr>
                        );
                      },

                      // Table cell styling
                      td({ children, ...props }) {
                        return (
                          <td
                            className="px-4 py-3 border-r border-gray-700 last:border-r-0"
                            {...props}
                          >
                            {children}
                          </td>
                        );
                      },

                      // Enhanced blockquote for diagrams or special content
                      blockquote({ children, ...props }) {
                        return (
                          <div
                            className="my-6 p-4 border-l-4 border-blue-500 bg-gray-800 rounded-r-lg"
                            {...props}
                          >
                            <div className="text-gray-300 italic">
                              {children}
                            </div>
                          </div>
                        );
                      },

                      // Enhanced list styling
                      ul({ children, ...props }) {
                        return (
                          <ul
                            className="list-disc list-inside my-4 space-y-2 text-gray-300"
                            {...props}
                          >
                            {children}
                          </ul>
                        );
                      },

                      ol({ children, ...props }) {
                        return (
                          <ol
                            className="list-decimal list-inside my-4 space-y-2 text-gray-300"
                            {...props}
                          >
                            {children}
                          </ol>
                        );
                      },

                      // Enhanced list items
                      li({ children, ...props }) {
                        return (
                          <li
                            className="text-gray-300 leading-relaxed"
                            {...props}
                          >
                            {children}
                          </li>
                        );
                      },

                      // Enhanced headings with better spacing
                      h1({ children, ...props }) {
                        return (
                          <h1
                            className="text-3xl font-bold text-white mb-6 mt-8 pb-2 border-b border-gray-700"
                            {...props}
                          >
                            {children}
                          </h1>
                        );
                      },

                      h2({ children, ...props }) {
                        return (
                          <h2
                            className="text-2xl font-bold text-white mb-4 mt-6 flex items-center gap-2"
                            {...props}
                          >
                            <span className="w-2 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded"></span>
                            {children}
                          </h2>
                        );
                      },

                      h3({ children, ...props }) {
                        return (
                          <h3
                            className="text-xl font-semibold text-blue-400 mb-3 mt-5"
                            {...props}
                          >
                            {children}
                          </h3>
                        );
                      },

                      // Enhanced paragraph styling
                      p({ children, ...props }) {
                        return (
                          <p
                            className="text-gray-300 leading-7 mb-4"
                            {...props}
                          >
                            {children}
                          </p>
                        );
                      },

                      // Enhanced strong/bold text
                      strong({ children, ...props }) {
                        return (
                          <strong
                            className="font-semibold text-white"
                            {...props}
                          >
                            {children}
                          </strong>
                        );
                      },

                      // Enhanced emphasis/italic text
                      em({ children, ...props }) {
                        return (
                          <em className="italic text-blue-300" {...props}>
                            {children}
                          </em>
                        );
                      },

                      // Enhanced horizontal rule
                      hr({ ...props }) {
                        return (
                          <hr
                            className="my-8 border-0 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"
                            {...props}
                          />
                        );
                      },
                    }}
                  >
                    {explanation}
                  </ReactMarkdown>
                </div>
              </>
            )}
          </div>
        )}

        {/* Simplify Tab */}
        {activeTab === "simplify" && (
          <div>
            {simplifiedExp === "" ? (
              <div className="flex flex-col items-center justify-center h-40 sm:h-64 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 text-xl sm:text-2xl">
                  🎯
                </div>
                <p className="text-gray-400 text-base sm:text-lg px-4">
                  Click a topic and switch to this tab to generate a simplified
                  explanation.
                </p>
              </div>
            ) : (
              <>
                {selectedTopic && (
                  <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-xs sm:text-sm">
                      🎯
                    </div>
                    <span className="break-words">
                      {selectedTopic} simplified!
                    </span>
                  </h2>
                )}
                <div
                  className="prose prose-invert prose-sm sm:prose-lg max-w-none w-full overflow-x-hidden"
                  style={{
                    "--tw-prose-body": "#e2e8f0",
                    "--tw-prose-headings": "#ffffff",
                    "--tw-prose-links": "#06b6d4",
                    "--tw-prose-code": "#06b6d4",
                    "--tw-prose-pre-bg": "rgba(15, 23, 42, 0.6)",
                    "--tw-prose-pre-code": "#e2e8f0",
                    "--tw-prose-bold": "#ffffff",
                    "--tw-prose-strong": "#ffffff",
                    "--tw-prose-italic": "#06b6d4",
                    "--tw-prose-quote-borders": "#3b82f6",
                    "--tw-prose-quotes": "#cbd5e1",
                    "--tw-prose-th-borders": "#374151",
                    "--tw-prose-td-borders": "#374151",
                  }}
                >
                  <ReactMarkdown
                    components={{
                      // Enhanced code block rendering with language header
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        return !inline && match ? (
                          <div className="my-6 rounded-lg overflow-hidden border border-gray-700 shadow-lg">
                            <div className="bg-gray-800 px-4 py-2 text-sm text-gray-300 border-b border-gray-700 flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-red-500"></div>
                              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              <span className="ml-2 font-mono text-xs uppercase tracking-wide">
                                {match[1]}
                              </span>
                            </div>
                            <SyntaxHighlighter
                              style={oneDark}
                              language={match[1]}
                              PreTag="div"
                              customStyle={{
                                margin: 0,
                                borderRadius: 0,
                                background: "#1e1e1e",
                                fontSize: "0.9em",
                                lineHeight: "1.5",
                              }}
                              {...props}
                            >
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          </div>
                        ) : (
                          <code
                            className="bg-gray-800/80 px-2 py-1 rounded-md text-cyan-300 font-mono text-sm border border-gray-700/50"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },

                      // Enhanced table rendering
                      table({ children, ...props }) {
      return (
        <div className="my-8 overflow-x-auto rounded-lg border border-slate-700 shadow-lg bg-slate-900/50 backdrop-blur-sm">
          <table
            className="w-full text-sm text-left text-gray-300 border-collapse min-w-full"
            {...props}
          >
            {children}
          </table>
        </div>
      );
    },

    // Table header with gradient background
    thead({ children, ...props }) {
      return (
        <thead
          className="text-sm text-gray-100 uppercase bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border-b-2 border-slate-600"
          {...props}
        >
          {children}
        </thead>
      );
    },

    // Table header cells with better spacing
    th({ children, ...props }) {
      return (
        <th
          className="px-6 py-4 font-semibold text-blue-400 border-r border-slate-600 last:border-r-0 whitespace-nowrap"
          {...props}
        >
          {children}
        </th>
      );
    },

    // Table body with alternating row colors
    tbody({ children, ...props }) {
      return (
        <tbody className="bg-slate-900/30 divide-y divide-slate-700/50" {...props}>
          {children}
        </tbody>
      );
    },

    // Enhanced table rows with hover effects
    tr({ children, ...props }) {
      return (
        <tr
          className="border-b border-slate-700/30 hover:bg-slate-800/40 transition-all duration-200 group"
          {...props}
        >
          {children}
        </tr>
      );
    },

    // Table cells with proper padding and borders
    td({ children, ...props }) {
      return (
        <td
          className="px-6 py-4 border-r border-slate-700/30 last:border-r-0 group-hover:text-gray-200 transition-colors duration-200"
          {...props}
        >
          {children}
        </td>
      );
    },

                      // Enhanced blockquote with icon
                      blockquote({ children, ...props }) {
                        return (
                          <div
                            className="my-6 p-6 border-l-4 border-blue-500 bg-gradient-to-r from-gray-800/80 to-gray-900/60 rounded-r-lg shadow-lg"
                            {...props}
                          >
                            <div className="flex items-start gap-3">
                              <div className="text-blue-400 text-lg">💡</div>
                              <div className="text-gray-300 italic leading-relaxed flex-1">
                                {children}
                              </div>
                            </div>
                          </div>
                        );
                      },

                      // Enhanced headings with visual elements
                      h1({ children, ...props }) {
                        return (
                          <h1
                            className="text-3xl sm:text-4xl font-bold text-white mb-6 mt-8 pb-3 border-b-2 border-gradient-to-r from-blue-500 to-purple-500 relative"
                            {...props}
                          >
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-transparent"></div>
                            {children}
                          </h1>
                        );
                      },

                      h2({ children, ...props }) {
                        return (
                          <h2
                            className="text-2xl sm:text-3xl font-bold text-white mb-4 mt-8 flex items-center gap-3 group"
                            {...props}
                          >
                            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                            <span className="group-hover:text-blue-300 transition-colors duration-200">
                              {children}
                            </span>
                          </h2>
                        );
                      },

                      h3({ children, ...props }) {
                        return (
                          <h3
                            className="text-xl sm:text-2xl font-semibold text-blue-400 mb-3 mt-6 flex items-center gap-2"
                            {...props}
                          >
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            {children}
                          </h3>
                        );
                      },

                      h4({ children, ...props }) {
                        return (
                          <h4
                            className="text-lg sm:text-xl font-medium text-gray-200 mb-2 mt-4"
                            {...props}
                          >
                            {children}
                          </h4>
                        );
                      },

                      // Enhanced lists with better spacing and icons
                      ul({ children, ...props }) {
                        return (
                          <ul
                            className="list-none my-6 space-y-2 text-gray-300"
                            {...props}
                          >
                            {children}
                          </ul>
                        );
                      },

                      ol({ children, ...props }) {
                        return (
                          <ol
                            className="list-none my-6 space-y-2 text-gray-300 counter-reset-item"
                            {...props}
                          >
                            {children}
                          </ol>
                        );
                      },

                      li({ children, node, ...props }) {
                        const isOrdered = node?.parent?.tagName === "ol";
                        return (
                          <li
                            className={`text-gray-300 leading-relaxed flex items-start gap-3 ${
                              isOrdered ? "counter-increment-item" : ""
                            }`}
                            {...props}
                          >
                            {isOrdered ? (
                              <span className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full mt-0.5 flex-shrink-0">
                                <span className="counter-item"></span>
                              </span>
                            ) : (
                              <span className="text-blue-400 mt-1.5 flex-shrink-0">
                                •
                              </span>
                            )}
                            <span className="flex-1">{children}</span>
                          </li>
                        );
                      },

                      // Enhanced paragraph with better spacing
                      p({ children, ...props }) {
                        return (
                          <p
                            className="text-gray-300 leading-8 mb-6 text-base sm:text-lg"
                            {...props}
                          >
                            {children}
                          </p>
                        );
                      },

                      // Enhanced strong/bold text
                      strong({ children, ...props }) {
                        return (
                          <strong
                            className="font-semibold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text "
                            {...props}
                          >
                            {children}
                          </strong>
                        );
                      },

                      // Enhanced emphasis/italic text
                      em({ children, ...props }) {
                        return (
                          <em
                            className="italic text-blue-300 font-medium"
                            {...props}
                          >
                            {children}
                          </em>
                        );
                      },

                      // Enhanced links
                      a({ children, href, ...props }) {
                        return (
                          <a
                            href={href}
                            className="text-blue-400 hover:text-blue-300 underline decoration-blue-400/50 hover:decoration-blue-300 transition-colors duration-200"
                            target="_blank"
                            rel="noopener noreferrer"
                            {...props}
                          >
                            {children}
                          </a>
                        );
                      },

                      // Enhanced horizontal rule
                      hr({ ...props }) {
                        return (
                          <div
                            className="my-12 flex items-center justify-center"
                            {...props}
                          >
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-gray-600"></div>
                            <div className="mx-4 w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                            <div className="flex-1 h-px bg-gradient-to-r from-gray-600 via-gray-600 to-transparent"></div>
                          </div>
                        );
                      },

                      // Add custom component for special content blocks
                      div({ children, className, ...props }) {
                        // Check if it's a special content block
                        if (
                          className?.includes("note") ||
                          className?.includes("warning") ||
                          className?.includes("tip")
                        ) {
                          const type = className.includes("warning")
                            ? "warning"
                            : className.includes("tip")
                            ? "tip"
                            : "note";

                          const styles = {
                            note: "border-blue-500 bg-blue-900/20 text-blue-100",
                            tip: "border-green-500 bg-green-900/20 text-green-100",
                            warning:
                              "border-yellow-500 bg-yellow-900/20 text-yellow-100",
                          };

                          const icons = {
                            note: "📝",
                            tip: "💡",
                            warning: "⚠️",
                          };

                          return (
                            <div
                              className={`my-6 p-6 border-l-4 rounded-r-lg ${styles[type]}`}
                              {...props}
                            >
                              <div className="flex items-start gap-3">
                                <span className="text-xl">{icons[type]}</span>
                                <div className="flex-1">{children}</div>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div className={className} {...props}>
                            {children}
                          </div>
                        );
                      },
                    }}
                  >
                    {simplifiedExp}
                  </ReactMarkdown>
                </div>

                <style jsx>{`
                  .counter-reset-item {
                    counter-reset: item;
                  }
                  .counter-increment-item {
                    counter-increment: item;
                  }
                  .counter-item:before {
                    content: counter(item);
                  }
                `}</style>
              </>
            )}
          </div>
        )}

        {/* Quiz Tab */}
        
{activeTab === "quiz" && (
  <QuizSection
    selectedTopic={selectedTopic}
    explanation={explanation}
    isVisible={activeTab === "quiz"}
    loadingTabData={loadingTabData}
  />
)}

        {/* Example Tab */}
        {activeTab === "example" && (
          <div className="space-y-4 sm:space-y-6">
            {examples.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 sm:h-64 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-4 text-xl sm:text-2xl">
                  💡
                </div>
                <p className="text-gray-400 text-base sm:text-lg px-4">
                  Click a topic and switch to this tab to generate an example.
                </p>
              </div>
            ) : (
              examples.map((ex, idx) => (
                <div
                  key={idx}
                  className="group relative bg-gradient-to-br from-slate-800/70 via-slate-700/50 to-slate-800/60 p-6 sm:p-8 rounded-2xl border border-slate-600/40 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-slate-500/60 hover:-translate-y-1"
                >
                  {/* Subtle glow effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Content container */}
                  <div className="relative z-10">
                    {/* Enhanced header */}
                    <div className="flex items-start gap-4 mb-6">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-lg sm:text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                          📌
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight group-hover:text-orange-200 transition-colors duration-300">
                          {ex.title}
                        </h3>
                        <div className="w-12 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 mt-2 rounded-full"></div>
                      </div>
                    </div>

                    {/* Enhanced explanation */}
                    <div className="mb-6">
                      <p className="text-gray-300 leading-relaxed text-base sm:text-lg font-light">
                        {ex.explanation}
                      </p>
                    </div>

                    {/* Enhanced highlight section */}
                    <motion.div
                      className="relative mb-6 p-4 sm:p-5 rounded-xl bg-gradient-to-r from-cyan-900/30 via-blue-900/20 to-cyan-900/30 border border-cyan-400/30 shadow-inner"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Highlight glow */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/5 to-blue-400/5"></div>

                      <div className="relative flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-white text-sm">💡</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs uppercase tracking-wide text-cyan-300 font-semibold mb-1 opacity-80">
                            Key Insight
                          </div>
                          <blockquote className="text-cyan-100 font-medium leading-relaxed text-sm sm:text-base">
                            {ex.highlight}
                          </blockquote>
                        </div>
                      </div>

                      {/* Decorative border */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-blue-400 rounded-l-xl"></div>
                    </motion.div>

                    {/* Enhanced code section */}
                    {ex.code && (
                      <motion.div
                        className="relative"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        {/* Code header */}
                        <div className="flex items-center justify-between bg-slate-900/90 px-4 py-2 rounded-t-xl border border-slate-700/60">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1.5">
                              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                            </div>
                            <span className="text-xs text-gray-400 ml-2 font-mono">
                              example.code
                            </span>
                          </div>
                         <button 
  onClick={() => handleCopyCode(ex.code)}
  className="text-xs text-gray-400 hover:text-gray-300 transition-colors duration-200 px-2 py-1 rounded bg-slate-800/50 hover:bg-slate-700/50 flex items-center gap-1"
>
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
  Copy
</button>
                        </div>

                        {/* Code content */}
                        <motion.pre
                          className="bg-slate-950/90 p-4 sm:p-6 rounded-b-xl text-sm sm:text-base overflow-x-auto border-l border-r border-b border-slate-700/60 shadow-inner relative"
                          whileHover={{
                            boxShadow: "0 0 20px rgba(34, 197, 94, 0.1)",
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <code className="text-green-400 font-mono leading-relaxed block">
                            {ex.code}
                          </code>

                          {/* Subtle syntax highlighting effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-blue-500/5 rounded-b-xl pointer-events-none"></div>
                        </motion.pre>

                        {/* Code footer with language indicator */}
                        <div className="flex items-center justify-between bg-slate-800/60 px-4 py-2 rounded-b-xl border-l border-r border-b border-slate-700/40 -mt-px">
                          <div className="text-xs text-gray-500 font-mono">
                            {ex.code.split("\n").length} lines
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Hover indicator */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full animate-ping"></div>
                  </div>

                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-slate-500/50 to-transparent"></div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Sticky bottom nav - MORE COMPACT FOR MOBILE */}
      <div className="p-3 sm:p-4 md:p-6 border-t border-slate-700/50 bg-slate-800/30 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center justify-between gap-1 sm:gap-3">
          <motion.button
            className="flex items-center justify-center gap-1 sm:gap-2 bg-slate-700/50 hover:bg-slate-600/60 border border-slate-600/50 text-white rounded-lg sm:rounded-xl px-2 sm:px-6 py-2 sm:py-3 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl text-xs sm:text-base min-w-0 flex-1 sm:flex-none sm:w-auto"
            onClick={handlePrevButton}
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-sm sm:text-lg">⬅️</span>
            <span className="hidden xs:inline sm:inline">Previous</span>
            <span className="xs:hidden sm:hidden">Prev</span>
          </motion.button>

          <motion.button
            disabled={updating}
            className={`px-2 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl text-xs sm:text-base min-w-0 flex-1 sm:flex-none sm:w-auto ${
              isCurrentTopicCompleted()
                ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
                : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
            } ${updating ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={handleMarkAsCompletedButton}
            whileHover={!updating ? { scale: 1.05 } : {}}
            whileTap={!updating ? { scale: 0.95 } : {}}
          >
            {updating ? (
              <span className="flex items-center justify-center gap-1 sm:gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span className="hidden xs:inline">Updating...</span>
                <span className="xs:hidden">...</span>
              </span>
            ) : isCurrentTopicCompleted() ? (
              <span className="flex items-center justify-center gap-1 sm:gap-2">
                <span className="text-sm sm:text-lg">❌</span>
                <span className="hidden xs:inline sm:inline">
                  Mark Incomplete
                </span>
                <span className="xs:hidden sm:hidden">Incomplete</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1 sm:gap-2">
                <span className="text-sm sm:text-lg">✅</span>
                <span className="hidden xs:inline sm:inline">
                  Mark Complete
                </span>
                <span className="xs:hidden sm:hidden">Complete</span>
              </span>
            )}
          </motion.button>

          <motion.button
            className="flex items-center justify-center gap-1 sm:gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg sm:rounded-xl px-2 sm:px-6 py-2 sm:py-3 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl text-xs sm:text-base min-w-0 flex-1 sm:flex-none sm:w-auto"
            onClick={handleNextButton}
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="hidden xs:inline sm:inline">Next</span>
            <span className="xs:hidden sm:hidden">Next</span>
            <span className="text-sm sm:text-lg">➡️</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
  return (
    <>
      {loadingTabData && (
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
              Generating content...
            </span>
            <span className="text-gray-400 text-xs sm:text-sm mt-2">
              This may take a moment
            </span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div
        className="min-h-screen flex flex-col lg:flex-row justify-between mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-4 md:py-6 items-start gap-2 sm:gap-4 md:gap-6 overflow-x-hidden"
        style={{
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%)",
          backgroundSize: "400% 400%",
          animation: "gradientShift 15s ease infinite",
        }}
      >
        {/* Main Section (top on mobile, left on desktop) */}
        <MainSection />
        {/* Right Sidebar (bottom on mobile, right on desktop) */}
        <RoadmapSidebar />
      </div>

      <style jsx>{`
        @keyframes gradientShift {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        @media (min-width: 640px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #06b6d4 0%, #3b82f6 100%);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #0891b2 0%, #2563eb 100%);
        }

        /* Mobile responsive adjustments */
        @media (max-width: 1023px) {
          .prose {
            font-size: 0.875rem;
            line-height: 1.5;
          }
          .prose h1 {
            font-size: 1.5rem;
          }
          .prose h2 {
            font-size: 1.25rem;
          }
          .prose h3 {
            font-size: 1.125rem;
          }
        }
        @media (max-width: 374px) {
          .prose {
            font-size: 0.75rem;
            line-height: 1.4;
          }
          .prose h1 {
            font-size: 1.25rem;
          }
          .prose h2 {
            font-size: 1.125rem;
          }
          .prose h3 {
            font-size: 1rem;
          }
        }

        @media (min-height: 800px) and (max-width: 768px) {
          .main-content-height {
            height: calc(100vh - 250px) !important;
          }
        }
        /* Prevent horizontal overflow */
        .prose * {
          max-width: 100%;
          overflow-wrap: break-word;
          word-wrap: break-word;
        }

        .prose pre {
          overflow-x: auto;
          max-width: 100%;
        }

        .prose code {
          overflow-wrap: break-word;
          word-break: break-all;
        }
        /* Add this to the existing <style jsx> block */
        .prose-invert h1,
        .prose-invert h2,
        .prose-invert h3,
        .prose-invert h4,
        .prose-invert h5,
        .prose-invert h6 {
          color: #fff;
          line-height: 1.25;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }

        .prose-invert p {
          color: #e2e8f0;
          line-height: 1.8;
          margin-top: 1rem;
          margin-bottom: 1rem;
        }

        .prose-invert ul,
        .prose-invert ol {
          padding-left: 1.5rem;
          margin-top: 1rem;
          margin-bottom: 1rem;
        }

        .prose-invert li {
          margin-bottom: 0.5rem;
        }

        .prose-invert pre {
          margin-top: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .prose table {
          display: block;
          width: 100%;
          overflow-x: auto;
        }

        .prose table th,
        .prose table td {
          white-space: nowrap;
          padding: 0.5em 1em;
        }
      `}</style>
    </>
  );
}

export default LearnPage;
