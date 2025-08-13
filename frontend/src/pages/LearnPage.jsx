import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";

function LearnPage() {
  const { roadmapId } = useParams();
  const [roadmap, setRoadmap] = useState(null);
  const [activeTab, setActiveTab] = useState("content");
  const [openWeek, setOpenWeek] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [explanation, setExplanation] = useState("");
  const [quiz, setQuiz] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [simplifiedExp, setSimplifiedExp] = useState("");
  const [examples, setExamples] = useState([]); // array of example objects
  const [loadingTabData, setLoadingTabData] = useState(false); // loading spinner
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [updating, setUpdating] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const [score, setScore] = useState(0);

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
  useEffect(() => {
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
  }, [activeTab, explanation, selectedTopic]);
  useEffect(() => {
    // This function runs when a key is pressed
    const onKey = (e) => e.key === "Escape" 

    // Attach the function to the 'keydown' event
    window.addEventListener("keydown", onKey);

    // Cleanup: remove event listener when component unmounts
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    fetchRoadmap();
  }, [fetchRoadmap]);

  if (!roadmap) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="relative">
          <div className="w-16 h-16 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-purple-400/20 border-b-purple-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        <p className="text-white text-lg font-medium">Loading roadmap...</p>
      </motion.div>
    </div>
  );
  
  const handlePrevButton = () => {
    console.log("Clicked Prev");
    console.log("roadmap:", roadmap);
    console.log("currentWeekIndex:", currentWeekIndex);
    console.log("currentTopicIndex:", currentTopicIndex);

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
    handleExplainTopic(prevTopic, prevWeekIndex, prevTopicIndex);
  };
  const isCurrentTopicCompleted = () => {
    if (!roadmap || !roadmap.weeks) return false;

    const week = roadmap.weeks[currentWeekIndex];
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
      const week = roadmap.weeks[currentWeekIndex];
      if (!week) {
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
          week_id: week.ID,
          topic_index: currentTopicIndex,
          value: !currentlyCompleted, // toggle
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      /* alert(
        !currentlyCompleted
          ? "Topic marked as completed!"
          : "Topic marked as incomplete!"
      );
 */
      await fetchRoadmap();
    } catch (err) {
      console.error("❌ Error updating completion status:", err);
      alert("Failed to update completion status.");
    } finally {
      setUpdating(false);
    }
  };

  /* const handleMarkAsCompletedButton = async (roadmapId, weekId, topicIndex) => {
    console.log("Clicked MarkAsCompleted button");
    console.log("Current Week:", roadmap?.weeks?.[currentWeekIndex]);

    try {
      await axios.post(
        "http://localhost:8080/update-progress",
        {
          roadmap_id: roadmapId,
          week_id: weekId,
          topic_index: topicIndex,
          value: true,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success("🎉 Topic marked as completed!");

      await fetchRoadmap();
    } catch (err) {
      return console.error("❌ Error marking topic:", err);
    }
  }; */
  const handleNextButton = () => {
    console.log("Clicked Next");
    console.log("roadmap:", roadmap);
    console.log("currentWeekIndex:", currentWeekIndex);
    console.log("currentTopicIndex:", currentTopicIndex);

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

    console.log("Navigating to:", {
      week: nextWeekIndex,
      topic: nextTopic,
      topicIndex: nextTopicIndex,
    });

    if (!nextTopic) {
      console.warn("Next topic not found");
      return;
    }
    setOpenWeek(nextWeekIndex);
    handleExplainTopic(nextTopic, nextWeekIndex, nextTopicIndex);
  };

  const handleExplainTopic = async (topic, idx, i) => {
    setCurrentWeekIndex(idx);
    setCurrentTopicIndex(i);
    setLoadingTabData(true);
    setSelectedTopic(topic);
    setExplanation("Loading...");

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

  // Sidebar component
  const RoadmapSidebar = () => {
    const totalWeeks = roadmap.weeks.length;
    const compactMode = totalWeeks > 6; // Compact if too many weeks

    return (
      <motion.aside
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={`w-80 bg-gradient-to-b from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl self-start p-6 ${
          compactMode ? "text-sm space-y-3" : "space-y-4"
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 50%, rgba(15, 23, 42, 0.9) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
        }}
      >
        {/* Header */}
        <div className="mb-6">
          <motion.h2 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl font-bold flex items-center gap-3 text-white mb-2"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              🧭
            </div>
            Roadmap
          </motion.h2>
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="inline-block text-xs bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 text-purple-300 px-3 py-1 rounded-full font-medium"
          >
            Generic
          </motion.span>
        </div>

        {/* Weeks */}
        <motion.ul 
          className="space-y-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {roadmap.weeks
            .slice()
            .sort((a, b) => a.week - b.week)
            .map((week, idx) => {
              const topics = JSON.parse(week.topics);
              const progress = JSON.parse(week.progress);
              const isOpen = openWeek === idx;
              const completedTopics = progress.filter(Boolean).length;
              const progressPercentage = (completedTopics / topics.length) * 100;

              return (
                <motion.li
                  key={week.ID}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 * idx }}
                  className={`border border-slate-600/50 rounded-xl ${
                    compactMode ? "p-3" : "p-4"
                  } bg-gradient-to-r from-slate-700/30 to-slate-600/20 backdrop-blur-sm hover:from-slate-600/40 hover:to-slate-500/30 transition-all duration-300`}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  {/* Week Title */}
                  <button
                    onClick={() => setOpenWeek(isOpen ? null : idx)}
                    className={`flex items-center justify-between w-full text-left font-semibold ${
                      compactMode ? "text-sm" : "text-base"
                    } text-white group`}
                  >
                    <div className="flex items-center">
                      <motion.span 
                        className="mr-3 text-cyan-400"
                        animate={{ rotate: isOpen ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        ▶
                      </motion.span>
                      <span className="mr-3 text-lg">📁</span>
                      <span className="group-hover:text-cyan-300 transition-colors">
                        {week.week}. {week.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercentage}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 min-w-[3rem]">
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
                        className="mt-4 space-y-2 overflow-hidden"
                      >
                        {topics.map((topic, i) => (
                          <motion.li 
                            key={i}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.1 * i }}
                          >
                            <motion.button
                              onClick={() => handleExplainTopic(topic, idx, i)}
                              className={`flex items-center w-full text-left rounded-xl px-3 py-2 transition-all duration-200 ${
                                progress[i]
                                  ? "text-green-400 bg-green-500/10 border border-green-500/20"
                                  : "text-gray-300 hover:text-white hover:bg-slate-600/30"
                              } ${
                                selectedTopic === topic
                                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-l-4 border-l-cyan-400 font-bold shadow-lg"
                                  : ""
                              }`}
                              style={{
                                fontSize: compactMode ? "0.75rem" : "0.875rem",
                              }}
                              whileHover={{ x: 4 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <span className="mr-3 text-base">
                                {progress[i] ? "✅" : "📄"}
                              </span>
                              <span className={progress[i] ? "line-through opacity-75" : ""}>
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
    );
  };

  //Main section
  const MainSection = () => (
    <motion.div 
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex-1 mr-6 rounded-2xl h-[90vh] max-w-4xl flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 50%, rgba(15, 23, 42, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Header */}
      <div className="p-8 border-b border-slate-700/50">
        <motion.h1 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent"
        >
          {roadmap.goal}
        </motion.h1>

        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-xl border border-slate-600/30">
          {["Content", "Simplify", "Quiz", "Example"].map((tab, index) => (
            <motion.button
              key={tab}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 * index }}
              className={`flex-1 px-4 py-3 font-semibold rounded-lg transition-all duration-300 relative overflow-hidden ${
                activeTab === tab.toLowerCase()
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25"
                  : "text-gray-400 hover:text-white hover:bg-slate-700/50"
              }`}
              onClick={() => setActiveTab(tab.toLowerCase())}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {activeTab === tab.toLowerCase() && (
                <motion.div
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
      <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
        {/* Content Tab */}
        {activeTab === "content" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {explanation === "" ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center mb-4">
                  📘
                </div>
                <p className="text-gray-400 text-lg">
                  Click a topic and switch to this tab to generate an explanation.
                </p>
              </div>
            ) : (
              <>
                {selectedTopic && (
                  <motion.h2 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="text-2xl font-bold mb-6 text-white flex items-center gap-3"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-sm">
                      📘
                    </div>
                    {selectedTopic}
                  </motion.h2>
                )}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="prose prose-invert prose-lg max-w-none"
                  style={{
                    '--tw-prose-body': '#e2e8f0',
                    '--tw-prose-headings': '#ffffff',
                    '--tw-prose-links': '#06b6d4',
                    '--tw-prose-code': '#06b6d4',
                    '--tw-prose-pre-bg': 'rgba(15, 23, 42, 0.6)',
                    '--tw-prose-pre-code': '#e2e8f0',
                  }}
                >
                  <ReactMarkdown>{explanation}</ReactMarkdown>
                </motion.div>
              </>
            )}
          </motion.div>
        )}

        {/* Simplify Tab */}
        {activeTab === "simplify" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {simplifiedExp === "" ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 text-2xl">
                  🎯
                </div>
                <p className="text-gray-400 text-lg">
                  Click a topic and switch to this tab to generate a simplified explanation.
                </p>
              </div>
            ) : (
              <>
                {selectedTopic && (
                  <motion.h2 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="text-2xl font-bold mb-6 text-white flex items-center gap-3"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-sm">
                      🎯
                    </div>
                    {selectedTopic} simplified!
                  </motion.h2>
                )}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="prose prose-invert prose-lg max-w-none"
                  style={{
                    '--tw-prose-body': '#e2e8f0',
                    '--tw-prose-headings': '#ffffff',
                    '--tw-prose-links': '#10b981',
                    '--tw-prose-code': '#10b981',
                    '--tw-prose-pre-bg': 'rgba(15, 23, 42, 0.6)',
                    '--tw-prose-pre-code': '#e2e8f0',
                  }}
                >
                  <ReactMarkdown>{simplifiedExp}</ReactMarkdown>
                </motion.div>
              </>
            )}
          </motion.div>
        )}

        {/* Quiz Tab */}
        {activeTab === "quiz" && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {quiz.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 text-2xl">
                  🧠
                </div>
                <p className="text-gray-400 text-lg">
                  Click a topic and switch to this tab to generate a quiz.
                </p>
              </div>
            ) : (
              quiz.map((q, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="bg-gradient-to-r from-slate-800/60 to-slate-700/40 p-6 rounded-xl border border-slate-600/30 backdrop-blur-sm"
                >
                  <h3 className="font-bold text-lg mb-4 text-white flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </div>
                    {q.question}
                  </h3>
                  <ul className="space-y-3">
                    {q.options.map((opt, i) => {
                      const optionLetter = String.fromCharCode(65 + i);
                      const isCorrect = optionLetter === q.answer;
                      const isSelected = selectedAnswers[idx] === optionLetter;

                      return (
                        <motion.li 
                          key={i}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <label
                            className={`flex items-center space-x-3 p-4 rounded-lg cursor-pointer transition-all duration-300 border ${
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
                              disabled={quizSubmitted} // prevent changes after submission
                              onChange={() =>
                                setSelectedAnswers((prev) => ({
                                  ...prev,
                                  [idx]: optionLetter,
                                }))
                              }
                              className="w-5 h-5 text-cyan-400 bg-slate-700 border-slate-600 focus:ring-cyan-500 focus:ring-2"
                            />
                            <span className="flex items-center gap-2">
                              <span className="font-semibold">{optionLetter}.</span>
                              <span>{opt}</span>
                            </span>
                          </label>
                        </motion.li>
                      );
                    })}
                  </ul>
                </motion.div>
              ))
            )}

            {quiz.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex justify-between items-center"
              >
                <motion.button
                  onClick={() => {
                    // calculate score
                    let total = 0;
                    quiz.forEach((q, idx) => {
                      if (selectedAnswers[idx] === q.answer) total++;
                    });
                    setScore(total);
                    setQuizSubmitted(true);
                    setShowPopup(true);
                  }}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Submit Quiz 🚀
                </motion.button>
                {quizSubmitted && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => {
                      setSelectedAnswers({});
                      setScore(0);
                      setQuizSubmitted(false);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Retry 🔄
                  </motion.button>
                )}
              </motion.div>
            )}

            {/* Animated Popup (Framer Motion) */}
            <AnimatePresence>
              {showPopup && (
                <motion.div
                  className="fixed inset-0 z-50 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Backdrop */}
                  <motion.div
                    className="absolute inset-0 bg-black/70 backdrop-blur-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowPopup(false)}
                  />

                  {/* Modal */}
                  <motion.div
                    className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl border border-slate-700/50"
                    initial={{ scale: 0.5, opacity: 0, rotateX: -15 }}
                    animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                    exit={{ scale: 0.5, opacity: 0, rotateX: 15 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div className="text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4"
                      >
                        🎉
                      </motion.div>
                      
                      <motion.h2 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-2xl font-bold mb-3 text-white"
                      >
                        Quiz Completed!
                      </motion.h2>
                      
                      <motion.p 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mb-4 text-gray-300 text-lg"
                      >
                        You scored <span className="font-bold text-cyan-400 text-xl">{score}</span> out of {quiz.length}.
                      </motion.p>

                      {/* ✅ Conditional Message */}
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        {score === quiz.length ? (
                          <p className="text-green-400 font-semibold text-lg flex items-center justify-center gap-2">
                            Perfect score! <span className="text-2xl">🏆</span>
                          </p>
                        ) : score >= quiz.length / 2 ? (
                          <p className="text-blue-400 font-semibold text-lg flex items-center justify-center gap-2">
                            Good job! Keep practicing! <span className="text-2xl">💪</span>
                          </p>
                        ) : (
                          <p className="text-orange-400 font-semibold text-lg flex items-center justify-center gap-2">
                            Don't give up — you'll get it! <span className="text-2xl">🚀</span>
                          </p>
                        )}
                      </motion.div>

                      <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="flex justify-center gap-4 mt-6"
                      >
                        <button
                          onClick={() => setShowPopup(false)}
                          className="px-6 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                        >
                          Close
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAnswers({});
                            setScore(0);
                            setQuizSubmitted(false);
                            setShowPopup(false);
                          }}
                          className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all"
                        >
                          Try Again
                        </button>
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Example Tab */}
        {activeTab === "example" && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {examples.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-4 text-2xl">
                  💡
                </div>
                <p className="text-gray-400 text-lg">
                  Click a topic and switch to this tab to generate an example.
                </p>
              </div>
            ) : (
              examples.map((ex, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="bg-gradient-to-r from-slate-800/60 to-slate-700/40 p-6 rounded-xl border border-slate-600/30 backdrop-blur-sm"
                >
                  <h3 className="text-xl font-bold mb-3 text-white flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-sm">
                      📌
                    </div>
                    {ex.title}
                  </h3>
                  <p className="mb-4 text-gray-300 leading-relaxed">{ex.explanation}</p>
                  <motion.blockquote 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="italic text-cyan-400 mb-4 pl-4 border-l-4 border-cyan-400/50 bg-cyan-400/5 py-2 rounded-r-lg"
                  >
                    💡 {ex.highlight}
                  </motion.blockquote>
                  {ex.code && (
                    <motion.pre 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-slate-900/80 p-4 rounded-lg text-sm overflow-x-auto border border-slate-700/50 shadow-inner"
                    >
                      <code className="text-green-400">{ex.code}</code>
                    </motion.pre>
                  )}
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </div>

      {/* Sticky bottom nav */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-6 border-t border-slate-700/50 bg-slate-800/30 backdrop-blur-sm flex items-center justify-between"
      >
        <motion.button
          className="flex items-center gap-2 bg-slate-700/50 hover:bg-slate-600/60 border border-slate-600/50 text-white rounded-xl px-6 py-3 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
          onClick={handlePrevButton}
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-lg">⬅️</span>
          Previous
        </motion.button>
        
        <motion.button
          disabled={updating}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl ${
            isCurrentTopicCompleted()
              ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
              : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
          } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleMarkAsCompletedButton}
          whileHover={!updating ? { scale: 1.05 } : {}}
          whileTap={!updating ? { scale: 0.95 } : {}}
        >
          {updating ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Updating...
            </span>
          ) : isCurrentTopicCompleted() ? (
            <span className="flex items-center gap-2">
              <span className="text-lg">❌</span>
              Mark Incomplete
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span className="text-lg">✅</span>
              Mark Complete
            </span>
          )}
        </motion.button>

        <motion.button
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl px-6 py-3 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
          onClick={handleNextButton}
          whileHover={{ scale: 1.05, x: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          Next
          <span className="text-lg">➡️</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );

  return (
    <>
      {loadingTabData && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-10 flex flex-col items-center justify-center min-w-[25vw] border border-slate-700/50"
          >
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-purple-400/20 border-b-purple-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <span className="text-white font-semibold text-lg">Generating content...</span>
            <span className="text-gray-400 text-sm mt-2">This may take a moment</span>
          </motion.div>
        </motion.div>
      )}

      {/* Main Content Area */}
      <div 
        className="min-h-screen flex flex-row justify-between mx-auto px-8 py-6 items-start gap-6"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 15s ease infinite',
        }}
      >
        {/* Main Section (left) */}
        <MainSection />
        {/* Right Sidebar (Roadmap) */}
        <RoadmapSidebar />
      </div>

      <style jsx>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
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
      `}</style>
    </>
  );
}

export default LearnPage;