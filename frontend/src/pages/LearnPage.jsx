"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import QuizSection from "./QuizSection";
import { useChatbotContext } from "../context/ChatbotContext";
import MyChatbot from "../components/Chatbot";

function LearnPage() {
  const { setLearningContext } = useChatbotContext();

  const { roadmapId } = useParams();
  const [roadmap, setRoadmap] = useState(null);
  const [activeTab, setActiveTab] = useState("content");
  const [openWeek, setOpenWeek] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [contentCache, setContentCache] = useState({
    explanations: {},
    simplifiedExps: {},
    examples: {},
  });
  const getCacheKey = (topic, weekIndex, topicIndex) => {
    return `${weekIndex}-${topicIndex}-${topic}`;
  };
  const [explanation, setExplanation] = useState("");
  const [simplifiedExp, setSimplifiedExp] = useState("");
  const [examples, setExamples] = useState([]);
  const [loadingTabData, setLoadingTabData] = useState(false);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [updating, setUpdating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [chatbotOpen, setChatbotOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleRoadmapClick = () => {
    setShowHint(false);
    setSidebarOpen(true);
  };

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
      if (!selectedTopic || !explanation || explanation === "Loading...")
        return;
      const cacheKey = getCacheKey(
        selectedTopic,
        currentWeekIndex,
        currentTopicIndex
      );
      if (contentCache.examples[cacheKey]) {
        setExamples(contentCache.examples[cacheKey]);
        return;
      }
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
        const examplesData = res.data.examples;
        setExamples(examplesData);

        setContentCache((prev) => ({
          ...prev,
          examples: {
            ...prev.examples,
            [cacheKey]: examplesData,
          },
        }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingTabData(false);
      }
    };
    if (
      activeTab === "example" &&
      explanation &&
      explanation !== "Loading..."
    ) {
      generateExample();
    }
  }, [
    activeTab,
    explanation,
    selectedTopic,
    currentWeekIndex,
    currentTopicIndex,
    contentCache.examples,
  ]);

  useEffect(() => {
    if (selectedTopic && explanation && explanation !== "Loading...") {
      setLearningContext({ topic: selectedTopic, explanation });
    } else {
      setLearningContext({ topic: '', explanation: '' });
    }
  }, [selectedTopic, explanation, setLearningContext]);

  useEffect(() => {
    const generateSimplifiedExp = async () => {
      if (!selectedTopic || !explanation || explanation === "Loading...")
        return;
      const cacheKey = getCacheKey(
        selectedTopic,
        currentWeekIndex,
        currentTopicIndex
      );

      if (contentCache.simplifiedExps[cacheKey]) {
        setSimplifiedExp(contentCache.simplifiedExps[cacheKey]);
        return;
      }
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
        const simplifiedText = res.data.simplifiedexplanation;
        setSimplifiedExp(simplifiedText);

        setContentCache((prev) => ({
          ...prev,
          simplifiedExps: {
            ...prev.simplifiedExps,
            [cacheKey]: simplifiedText,
          },
        }));
      } catch (err) {
        console.error("Simplification failed:", err);
      } finally {
        setLoadingTabData(false);
      }
    };
    if (
      activeTab === "simplify" &&
      explanation &&
      explanation !== "Loading..."
    ) {
      generateSimplifiedExp();
    }
  }, [
    activeTab,
    explanation,
    selectedTopic,
    currentWeekIndex,
    currentTopicIndex,
    contentCache.simplifiedExps,
  ]);

  useEffect(() => {
    fetchRoadmap();
  }, [fetchRoadmap]);

  if (!roadmap)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-xs sm:max-w-sm"
        >
          <div className="relative">
            <div className="w-14 h-14 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          </div>
          <p className="text-gray-700 text-base font-medium">
            Loading roadmap...
          </p>
        </motion.div>
      </div>
    );

  const handlePrevButton = () => {
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
    if (updating) return;
    setUpdating(true);

    try {
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
          week_id: currentWeek.ID,
          topic_index: currentTopicIndex,
          value: !currentlyCompleted,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await fetchRoadmap();
    } catch (err) {
      console.error("⚠️ Error updating completion status:", err);
      alert("Failed to update completion status.");
    } finally {
      setUpdating(false);
    }
  };

  const handleNextButton = () => {
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
    setSelectedTopic(topic);
    setSidebarOpen(false);
    const cacheKey = getCacheKey(topic, weekIndex, topicIndex);

    if (contentCache.explanations[cacheKey]) {
      setExplanation(contentCache.explanations[cacheKey]);
      if (contentCache.simplifiedExps[cacheKey]) {
        setSimplifiedExp(contentCache.simplifiedExps[cacheKey]);
      } else {
        setSimplifiedExp("");
      }
      if (contentCache.examples[cacheKey]) {
        setExamples(contentCache.examples[cacheKey]);
      } else {
        setExamples([]);
      }
      return;
    }

    setLoadingTabData(true);
    setExplanation("Loading...");
    setSimplifiedExp("");
    setExamples([]);

    try {
      const res = await axios.post(
        "http://localhost:8080/explain-topic",
        { topic },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const explanationText = res.data.explanation;
      setExplanation(explanationText);

      setContentCache((prev) => ({
        ...prev,
        explanations: {
          ...prev.explanations,
          [cacheKey]: explanationText,
        },
      }));
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
      console.log("Code copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const RoadmapSidebar = () => {
    const totalWeeks = roadmap.weeks.length;
    const compactMode = totalWeeks > 6;

    return (
      <>
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close roadmap sidebar"
          />
        )}

        <motion.aside
          className={`
  ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
  lg:translate-x-0 transition-transform duration-300
  fixed lg:sticky top-0 left-0 z-50 lg:z-auto
  w-[90vw] xs:w-72 sm:w-80 lg:w-72 xl:w-80 2xl:w-96 lg:max-w-[24rem] xl:max-w-[26rem]
  h-screen lg:h-[90vh]
  bg-white rounded-none lg:rounded-2xl
  border-r lg:border border-gray-100
  shadow-sm self-start p-3 xs:p-3 sm:p-4
  overflow-y-auto
  ${compactMode ? "text-sm space-y-2.5 xs:space-y-3" : "space-y-3 xs:space-y-4"}
`}
        >
          <button
            className="lg:hidden absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors z-10"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close roadmap sidebar"
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

          <div className="mb-3 xs:mb-4 sm:mb-6">
            <h2 className="text-base xs:text-lg sm:text-xl font-bold flex items-center gap-2 xs:gap-3 text-gray-900 mb-2">
              <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-sm xs:text-base flex-shrink-0">
                🧭
              </div>
              <span className="min-w-0 whitespace-normal break-words text-pretty leading-tight">
                Roadmap
              </span>
            </h2>
          </div>

          <motion.ul className="space-y-3">
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
                    className={`border border-gray-100 rounded-lg bg-white hover:bg-gray-50 transition-colors ${
                      compactMode
                        ? "p-2.5 xs:p-3 sm:p-3"
                        : "p-3 xs:p-3.5 sm:p-4"
                    }`}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <button
                      onClick={() => setOpenWeek(isOpen ? null : idx)}
                      className={`flex items-center justify-between w-full text-left font-semibold ${
                        compactMode
                          ? "text-xs xs:text-sm sm:text-sm"
                          : "text-sm xs:text-base sm:text-base"
                      } text-gray-900 group min-h-[44px] py-2`}
                    >
                      <div className="flex items-center min-w-0">
                        <motion.span
                          className="mr-2 sm:mr-2.5 text-gray-400 flex-shrink-0"
                          animate={{ rotate: isOpen ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          ▶
                        </motion.span>
                        <span className="mr-2 sm:mr-2.5 text-base sm:text-lg flex-shrink-0">
                          📁
                        </span>
                        <span className="group-hover:text-gray-700 transition-colors min-w-0 whitespace-normal break-words text-pretty leading-snug">
                          {week.week}. {week.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ml-2">
                        <div className="w-10 sm:w-14 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-indigo-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                          />
                        </div>
                        <span className="text-[11px] sm:text-xs text-gray-500 min-w-[2rem] sm:min-w-[3rem] text-right tabular-nums">
                          {completedTopics}/{topics.length}
                        </span>
                      </div>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2 overflow-hidden"
                        >
                          {topics.map((topic, i) => (
                            <motion.li
                              key={i}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.06 * i }}
                            >
                              <motion.button
                                onClick={() =>
                                  handleExplainTopic(topic, idx, i)
                                }
                                className={`flex items-center w-full text-left rounded-lg px-2 xs:px-3 sm:px-3 py-2.5 xs:py-3 transition-all duration-200 min-h-[44px] ${
                                  progress[i]
                                    ? "text-green-700 bg-green-50 border border-green-200"
                                    : "text-gray-700 hover:bg-gray-100"
                                } ${
                                  selectedTopic === topic
                                    ? "border border-indigo-300 bg-indigo-50"
                                    : "border border-transparent"
                                }`}
                                style={{
                                  fontSize: compactMode
                                    ? "0.8125rem"
                                    : "0.875rem",
                                  lineHeight: compactMode ? "1.25" : "1.4",
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
                                  } min-w-0 whitespace-normal break-words text-pretty leading-snug line-clamp-3`}
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

  const MainSection = () => (
    <div className="flex-1 lg:flex-[3] xl:flex-[3.25] 2xl:flex-[3.5] min-w-0 rounded-none lg:rounded-2xl h=[100svh] lg:h-[90vh] w-full max-w-none flex flex-col overflow-hidden lg:mr-6 xl:mr-6 bg-white border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200 flex-shrink-0 min-w-0">
        <div className="flex items-center mb-4 lg:mb-6 min-w-0">
          <button
            className="lg:hidden mr-3 group relative min-h-[44px] min-w-[44px]"
            onClick={handleRoadmapClick}
            aria-label="Open roadmap"
          >
            {showHint && (
              <div className="absolute -bottom-12 left-0 bg-indigo-600 text-white px-2 xs:px-3 py-1.5 rounded-md text-xs font-medium shadow-sm z-50">
                Tap for Roadmap
                <div className="absolute bottom-full left-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-indigo-600"></div>
              </div>
            )}

            <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm">
              <svg
                className="w-5 h-5 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              </svg>
            </div>
          </button>

          <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 flex-1 min-w-0 text-pretty break-words">
            {roadmap?.title || "Learning Roadmap"}
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl border border-gray-200 overflow-x-auto min-w-0">
          {["Content", "Simplify", "Quiz", "Example"].map((tab) => (
            <motion.button
              key={tab}
              className={`flex-shrink-0 px-3 sm:px-4 py-2 sm:py-2.5 font-semibold rounded-lg transition-colors text-sm sm:text-base ${
                activeTab === tab.toLowerCase()
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-white"
              }`}
              onClick={() => setActiveTab(tab.toLowerCase())}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {tab}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Main scrollable content */}
      <div
        className="flex-1 text-gray-700 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 md:space-y-8 custom-scrollbar w-full bg-white min-w-0"
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
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 border border-gray-200 rounded-2xl flex items-center justify-center mb-4 text-2xl sm:text-3xl">
                  📘
                </div>
                <p className="text-gray-500 text-base sm:text-lg px-4">
                  Click a topic and switch to this tab to generate an
                  explanation.
                </p>
              </div>
            ) : (
              <>
                {selectedTopic && (
                  <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900 flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-xs sm:text-sm">
                      📘
                    </div>
                    <span className="break-words">{selectedTopic}</span>
                  </h2>
                )}

                <div className="prose max-w-none w-full overflow-x-hidden prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl prose-p:text-base prose-p:leading-7 prose-p:mb-4">
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        return !inline && match ? (
                          <div className="my-6 rounded-lg overflow-hidden border border-gray-200">
                            <div className="bg-gray-50 px-4 py-2 text-sm text-gray-600 border-b border-gray-200">
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
                            className="bg-gray-100 px-2 py-1 rounded text-indigo-700 font-mono text-sm"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },
                      table({ children, ...props }) {
                        return (
                          <div className="my-6 overflow-x-auto rounded-lg border border-gray-200 bg-white">
                            <table
                              className="w-full text-sm text-left text-gray-700"
                              {...props}
                            >
                              {children}
                            </table>
                          </div>
                        );
                      },
                      thead({ children, ...props }) {
                        return (
                          <thead
                            className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200"
                            {...props}
                          >
                            {children}
                          </thead>
                        );
                      },
                      th({ children, ...props }) {
                        return (
                          <th
                            className="px-4 py-3 font-semibold text-gray-900 border-r border-gray-200 last:border-r-0"
                            {...props}
                          >
                            {children}
                          </th>
                        );
                      },
                      tbody({ children, ...props }) {
                        return (
                          <tbody className="bg-white" {...props}>
                            {children}
                          </tbody>
                        );
                      },
                      tr({ children, ...props }) {
                        return (
                          <tr
                            className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                            {...props}
                          >
                            {children}
                          </tr>
                        );
                      },
                      td({ children, ...props }) {
                        return (
                          <td
                            className="px-4 py-3 border-r border-gray-200 last:border-r-0"
                            {...props}
                          >
                            {children}
                          </td>
                        );
                      },
                      blockquote({ children, ...props }) {
                        return (
                          <div
                            className="my-6 p-4 border-l-4 border-indigo-400 bg-indigo-50 rounded-r-lg"
                            {...props}
                          >
                            <div className="text-gray-700 italic">
                              {children}
                            </div>
                          </div>
                        );
                      },
                      ul({ children, ...props }) {
                        return (
                          <ul
                            className="list-disc list-inside my-4 space-y-2 text-gray-700"
                            {...props}
                          >
                            {children}
                          </ul>
                        );
                      },
                      ol({ children, ...props }) {
                        return (
                          <ol
                            className="list-decimal list-inside my-4 space-y-2 text-gray-700"
                            {...props}
                          >
                            {children}
                          </ol>
                        );
                      },
                      li({ children, ...props }) {
                        return (
                          <li
                            className="text-gray-700 leading-relaxed"
                            {...props}
                          >
                            {children}
                          </li>
                        );
                      },
                      h1({ children, ...props }) {
                        return (
                          <h1
                            className="text-3xl font-bold text-gray-900 mb-6 mt-8 pb-2 border-b border-gray-200"
                            {...props}
                          >
                            {children}
                          </h1>
                        );
                      },
                      h2({ children, ...props }) {
                        return (
                          <h2
                            className="text-2xl font-bold text-gray-900 mb-4 mt-6 flex items-center gap-2"
                            {...props}
                          >
                            <span className="w-2 h-6 bg-indigo-600 rounded"></span>
                            {children}
                          </h2>
                        );
                      },
                      h3({ children, ...props }) {
                        return (
                          <h3
                            className="text-xl font-semibold text-indigo-700 mb-3 mt-5"
                            {...props}
                          >
                            {children}
                          </h3>
                        );
                      },
                      p({ children, ...props }) {
                        return (
                          <p
                            className="text-gray-700 leading-7 mb-4"
                            {...props}
                          >
                            {children}
                          </p>
                        );
                      },
                      strong({ children, ...props }) {
                        return (
                          <strong
                            className="font-semibold text-gray-900"
                            {...props}
                          >
                            {children}
                          </strong>
                        );
                      },
                      em({ children, ...props }) {
                        return (
                          <em className="italic text-indigo-700" {...props}>
                            {children}
                          </em>
                        );
                      },
                      hr({ ...props }) {
                        return (
                          <hr
                            className="my-8 border-0 h-px bg-gray-200"
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
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 border border-gray-200 rounded-2xl flex items-center justify-center mb-4 text-xl sm:text-2xl">
                  😅
                </div>
                <p className="text-gray-500 text-base sm:text-lg px-4">
                  Sorry we are currently down
                </p>
              </div>
            ) : (
              <>
                {selectedTopic && (
                  <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900 flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center text-xs sm:text-sm">
                      🎯
                    </div>
                    <span className="break-words">
                      {selectedTopic} simplified!
                    </span>
                  </h2>
                )}
                <div className="prose max-w-none w-full overflow-x-hidden">
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        return !inline && match ? (
                          <div className="my-6 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                            <div className="bg-gray-50 px-4 py-2 text-sm text-gray-600 border-b border-gray-200 flex items-center gap-2">
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
                            className="bg-gray-100 px-2 py-1 rounded-md text-indigo-700 font-mono text-sm border border-gray-200"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },
                      table({ children, ...props }) {
                        return (
                          <div className="my-8 overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
                            <table
                              className="w-full text-sm text-left text-gray-700 border-collapse min-w-full"
                              {...props}
                            >
                              {children}
                            </table>
                          </div>
                        );
                      },
                      thead({ children, ...props }) {
                        return (
                          <thead
                            className="text-sm text-gray-700 uppercase bg-gray-50 border-b-2 border-gray-200"
                            {...props}
                          >
                            {children}
                          </thead>
                        );
                      },
                      th({ children, ...props }) {
                        return (
                          <th
                            className="px-6 py-4 font-semibold text-gray-900 border-r border-gray-200 last:border-r-0 whitespace-nowrap"
                            {...props}
                          >
                            {children}
                          </th>
                        );
                      },
                      tbody({ children, ...props }) {
                        return (
                          <tbody
                            className="bg-white divide-y divide-gray-100"
                            {...props}
                          >
                            {children}
                          </tbody>
                        );
                      },
                      tr({ children, ...props }) {
                        return (
                          <tr
                            className="hover:bg-gray-50 transition-colors"
                            {...props}
                          >
                            {children}
                          </tr>
                        );
                      },
                      td({ children, ...props }) {
                        return (
                          <td
                            className="px-6 py-4 border-r border-gray-100 last:border-r-0"
                            {...props}
                          >
                            {children}
                          </td>
                        );
                      },
                      blockquote({ children, ...props }) {
                        return (
                          <div
                            className="my-6 p-6 border-l-4 border-indigo-400 bg-indigo-50 rounded-r-lg"
                            {...props}
                          >
                            <div className="flex items-start gap-3">
                              <div className="text-indigo-600 text-lg">💡</div>
                              <div className="text-gray-700 italic leading-relaxed flex-1">
                                {children}
                              </div>
                            </div>
                          </div>
                        );
                      },
                      h1({ children, ...props }) {
                        return (
                          <h1
                            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 mt-8 pb-3 relative"
                            {...props}
                          >
                            {children}
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-200"></span>
                          </h1>
                        );
                      },
                      h2({ children, ...props }) {
                        return (
                          <h2
                            className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 mt-8 flex items-center gap-3"
                            {...props}
                          >
                            <div className="w-1 h-8 bg-indigo-600 rounded-full"></div>
                            <span>{children}</span>
                          </h2>
                        );
                      },
                      h3({ children, ...props }) {
                        return (
                          <h3
                            className="text-xl sm:text-2xl font-semibold text-indigo-700 mb-3 mt-6 flex items-center gap-2"
                            {...props}
                          >
                            <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                            {children}
                          </h3>
                        );
                      },
                      h4({ children, ...props }) {
                        return (
                          <h4
                            className="text-lg sm:text-xl font-medium text-gray-900 mb-2 mt-4"
                            {...props}
                          >
                            {children}
                          </h4>
                        );
                      },
                      ul({ children, ...props }) {
                        return (
                          <ul
                            className="list-disc my-6 space-y-2 text-gray-700 pl-5"
                            {...props}
                          >
                            {children}
                          </ul>
                        );
                      },
                      ol({ children, ...props }) {
                        return (
                          <ol
                            className="list-decimal my-6 space-y-2 text-gray-700 pl-5"
                            {...props}
                          >
                            {children}
                          </ol>
                        );
                      },
                      li({ children, ...props }) {
                        return (
                          <li
                            className="text-gray-700 leading-relaxed"
                            {...props}
                          >
                            {children}
                          </li>
                        );
                      },
                      p({ children, ...props }) {
                        return (
                          <p
                            className="text-gray-700 leading-8 mb-6 text-base sm:text-lg"
                            {...props}
                          >
                            {children}
                          </p>
                        );
                      },
                      strong({ children, ...props }) {
                        return (
                          <strong
                            className="font-semibold text-gray-900"
                            {...props}
                          >
                            {children}
                          </strong>
                        );
                      },
                      em({ children, ...props }) {
                        return (
                          <em
                            className="italic text-indigo-700 font-medium"
                            {...props}
                          >
                            {children}
                          </em>
                        );
                      },
                      a({ children, href, ...props }) {
                        return (
                          <a
                            href={href}
                            className="text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
                            target="_blank"
                            rel="noopener noreferrer"
                            {...props}
                          >
                            {children}
                          </a>
                        );
                      },
                      hr({ ...props }) {
                        return (
                          <div className="my-12">
                            <div className="h-px bg-gray-200" />
                          </div>
                        );
                      },
                    }}
                  >
                    {simplifiedExp}
                  </ReactMarkdown>
                </div>
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
            currentWeekIndex={currentWeekIndex}
            currentTopicIndex={currentTopicIndex}
          />
        )}

        {/* Example Tab */}
        {activeTab === "example" && (
          <div className="space-y-4 sm:space-y-6">
            {examples.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 sm:h-64 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 border border-gray-200 rounded-2xl flex items-center justify-center mb-4 text-xl sm:text-2xl">
                  😅
                </div>
                <p className="text-gray-500 text-base sm:text-lg px-4">
                  Sorry we are currently down
                </p>
              </div>
            ) : (
              examples.map((ex, idx) => (
                <div
                  key={idx}
                  className="relative bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative z-10">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-lg sm:text-xl">
                          📌
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                          {ex.title}
                        </h3>
                        <div className="w-12 h-0.5 bg-indigo-600 mt-2 rounded-full"></div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
                        {ex.explanation}
                      </p>
                    </div>

                    <motion.div
                      className="relative mb-6 p-4 sm:p-5 rounded-xl bg-indigo-50 border border-indigo-100"
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="relative flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-sm">💡</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs uppercase tracking-wide text-indigo-700 font-semibold mb-1">
                            Key Insight
                          </div>
                          <blockquote className="text-indigo-900 font-medium leading-relaxed text-sm sm:text-base">
                            {ex.highlight}
                          </blockquote>
                        </div>
                      </div>
                    </motion.div>

                    {ex.code && (
                      <motion.div
                        className="relative"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <div className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-t-xl border border-gray-200">
                          <span className="text-xs text-gray-500 font-mono">
                            example.code
                          </span>
                          <button
                            onClick={() => handleCopyCode(ex.code)}
                            className="text-xs text-gray-600 hover:text-gray-800 transition-colors px-2 py-1 rounded bg-white border border-gray-200"
                          >
                            Copy
                          </button>
                        </div>

                        <motion.pre className="bg-gray-900 p-4 sm:p-6 rounded-b-xl text-sm sm:text-base overflow-x-auto border-l border-r border-b border-gray-200 text-green-400">
                          <code className="font-mono leading-relaxed block">
                            {ex.code}
                          </code>
                        </motion.pre>
                      </motion.div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Sticky bottom nav */}
      <div className="p-3 sm:p-4 md:p-6 border-t border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-center justify-between gap-1 sm:gap-3">
          <motion.button
            className="flex items-center justify-center gap-1 sm:gap-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-lg sm:rounded-xl px-2 sm:px-6 py-2 sm:py-3 font-semibold transition-colors text-xs sm:text-base min-w-0 flex-1 sm:flex-none sm:w-auto"
            onClick={handlePrevButton}
            whileHover={{ scale: 1.03, x: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="text-sm sm:text-lg">⬅️</span>
            <span className="hidden xs:inline sm:inline">Previous</span>
            <span className="xs:hidden sm:hidden">Prev</span>
          </motion.button>

          <motion.button
            disabled={updating}
            className={`px-2 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-colors text-xs sm:text-base min-w-0 flex-1 sm:flex-none sm:w-auto ${
              isCurrentTopicCompleted()
                ? "bg-rose-600 hover:bg-rose-700 text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            } ${updating ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={handleMarkAsCompletedButton}
            whileHover={!updating ? { scale: 1.03 } : {}}
            whileTap={!updating ? { scale: 0.97 } : {}}
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
            className="flex items-center justify-center gap-1 sm:gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg sm:rounded-xl px-2 sm:px-6 py-2 sm:py-3 font-semibold transition-colors text-xs sm:text-base min-w-0 flex-1 sm:flex-none sm:w-auto"
            onClick={handleNextButton}
            whileHover={{ scale: 1.03, x: 2 }}
            whileTap={{ scale: 0.97 }}
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
            <span className="font-semibold text-base sm:text-lg">Generating content...</span>
            <span className="text-slate-500 text-xs sm:text-sm mt-2">This may take a moment</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="min-h-screen flex flex-col lg:flex-row justify-start mx-auto px-3 sm:px-5 md:px-6 lg:px-8 py-2 sm:py-4 md:py-6 items-start gap-3 sm:gap-5 lg:gap-6 xl:gap-8 overflow-x-hidden bg-gray-50 w-full max-w-none relative">
        <MainSection />
        <RoadmapSidebar />

        {/* Chatbot Area */}
        <div className="fixed bottom-6 right-6 z-40">
            <AnimatePresence>
                {chatbotOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <MyChatbot />
                    </motion.div>
                )}
            </AnimatePresence>
            <motion.button
                onClick={() => setChatbotOpen(!chatbotOpen)}
                className="w-16 h-16 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label={chatbotOpen ? "Close chat" : "Open chat"}
            >
                {chatbotOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                )}
            </motion.button>
        </div>
      </div>

      <style jsx>{`
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