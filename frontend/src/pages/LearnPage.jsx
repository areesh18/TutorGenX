import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import "react-toastify/dist/ReactToastify.css";
import { AnimatePresence } from "framer-motion";

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
  const [showScore, setShowScore] = useState(false);
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
    const onKey = (e) => e.key === "Escape" && setShowScore(false);

    // Attach the function to the 'keydown' event
    window.addEventListener("keydown", onKey);

    // Cleanup: remove event listener when component unmounts
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const handleOptionClick = (e, option) => {
    e.preventDefault(); // stops page reload
    setSelectedOption(option);
  };

  useEffect(() => {
    fetchRoadmap();
  }, [fetchRoadmap]);

  if (!roadmap) return <p>Loading roadmap...</p>;
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
      <aside
        className={`w-72 bg-white  rounded-xl border border-gray-200 shadow-sm self-start p-5 ${
          compactMode ? "text-sm space-y-2" : "space-y-3"
        }`}
      >
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
            <span className="text-xl">🧭</span>
            Roadmap
          </h2>
          <span className="inline-block text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
            Generic
          </span>
        </div>

        {/* Weeks */}
        <ul className="space-y-1">
          {roadmap.weeks
            .slice()
            .sort((a, b) => a.week - b.week)
            .map((week, idx) => {
              const topics = JSON.parse(week.topics);
              const progress = JSON.parse(week.progress);
              const isOpen = openWeek === idx;
              console.log(`Week ${week.week} progress:`, progress);

              return (
                <li
                  key={week.ID}
                  className={`border border-gray-200 rounded-lg ${
                    compactMode ? "p-2" : "p-3"
                  } bg-white`}
                >
                  {/* Week Title */}
                  <button
                    onClick={() => setOpenWeek(isOpen ? null : idx)}
                    className={`flex items-center w-full text-left font-medium ${
                      compactMode ? "text-sm" : "text-base"
                    } text-gray-800`}
                  >
                    <span className="mr-2">{isOpen ? "▼" : "▶"}</span>
                    <span className="mr-2">📁</span>
                    {week.week}. {week.title}
                  </button>

                  {/* Topics */}
                  {isOpen && (
                    <ul className="mt-2 space-y-1">
                      {topics.map((topic, i) => (
                        <li key={i}>
                          <button
                            onClick={() => handleExplainTopic(topic, idx, i)}
                            className={`flex items-center w-full text-left rounded-md px-2 py-1 transition ${
                              progress[i]
                                ? "text-green-600 line-through"
                                : "text-gray-700"
                            } ${
                              selectedTopic === topic
                                ? "bg-orange-100 border-l-4 border-orange-500 font-bold"
                                : "hover:bg-gray-50"
                            }`}
                            style={{
                              fontSize: compactMode ? "0.75rem" : "0.875rem",
                            }}
                          >
                            <span className="mr-2">
                              {progress[i] ? "✔️" : "📄"}
                            </span>
                            {topic}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
        </ul>
      </aside>
    );
  };

  //Main section
  const MainSection = () => (
    <div className="flex-1 bg-white shadow rounded-xl h-[85vh] max-w-3xl flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold mb-4">{roadmap.goal}</h1>

        {/* Tabs */}
        <div className="flex space-x-6 border-b pb-2">
          {["Content", "Simplify", "Quiz", "Example"].map((tab) => (
            <button
              key={tab}
              className={`pb-2 px-2 font-semibold transition-colors ${
                activeTab === tab.toLowerCase()
                  ? "border-b-2 border-orange-500 text-orange-500"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              onClick={() => setActiveTab(tab.toLowerCase())}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main scrollable content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Content Tab */}
        {activeTab === "content" && (
          <div>
            {explanation === "" ? (
              <p className="text-gray-500">
                Click a topic and switch to this tab to generate an explanation.
              </p>
            ) : (
              <>
                {selectedTopic && (
                  <h2 className="text-xl font-semibold mb-4">
                    📘 {selectedTopic}
                  </h2>
                )}
                <div className="prose max-w-none">
                  <ReactMarkdown>{explanation}</ReactMarkdown>
                </div>
              </>
            )}
          </div>
        )}

        {/* Simplify Tab */}
        {activeTab === "simplify" && (
          <div>
            {simplifiedExp === "" ? (
              <p className="text-gray-500">
                Click a topic and switch to this tab to generate a simplified
                explanation.
              </p>
            ) : (
              <>
                {selectedTopic && (
                  <h2 className="text-xl font-semibold mb-4">
                    📘 {selectedTopic} simplified!
                  </h2>
                )}
                <div className="prose max-w-none">
                  <ReactMarkdown>{simplifiedExp}</ReactMarkdown>
                </div>
              </>
            )}
          </div>
        )}

        {/* Quiz Tab */}
        {activeTab === "quiz" && (
          <div className="space-y-6">
            {quiz.length === 0 ? (
              <p className="text-gray-500">
                Click a topic and switch to this tab to generate a quiz.
              </p>
            ) : (
              quiz.map((q, idx) => (
                <div key={idx} className="bg-white p-4 rounded shadow-sm">
                  <h3 className="font-semibold text-base mb-2">
                    {idx + 1}. {q.question}
                  </h3>
                  <ul className="space-y-2 bg-white p-2 rounded">
                    {q.options.map((opt, i) => {
                      const optionLetter = String.fromCharCode(65 + i);
                      const isCorrect = optionLetter === q.answer;
                      const isSelected = selectedAnswers[idx] === optionLetter;

                      return (
                        <li key={i}>
                          <label
                            className={`flex items-center space-x-2 p-2 rounded cursor-pointer
            ${showScore && isCorrect ? "bg-green-200" : ""}
            ${showScore && isSelected && !isCorrect ? "bg-red-200" : ""}
          `}
                          >
                            <input
                              type="radio"
                              name={`q-${idx}`}
                              value={optionLetter}
                              checked={isSelected}
                              disabled={showScore} // prevent changes after submission
                              onChange={() =>
                                setSelectedAnswers((prev) => ({
                                  ...prev,
                                  [idx]: optionLetter,
                                }))
                              }
                            />
                            <span>
                              {optionLetter}. {opt}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))
            )}

            {quiz.length > 0 && (
              <button
                onClick={() => {
                  // calculate score
                  let total = 0;
                  quiz.forEach((q, idx) => {
                    if (selectedAnswers[idx] === q.answer) total++;
                  });
                  setScore(total);
                  setShowScore(true);
                }}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow-sm transition-colors"
              >
                Submit Quiz
              </button>
            )}

            {/* Animated Popup (Framer Motion) */}
            <AnimatePresence>
              {showScore && (
                <motion.div
                  className="fixed inset-0 z-50 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Backdrop */}
                  <motion.div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowScore(false)}
                  />

                  {/* Modal */}
                  <motion.div
                    className="relative bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  >
                    <h2 className="text-2xl font-bold mb-2">
                      🎉 Quiz Completed!
                    </h2>
                    <p className="mb-2 text-gray-600">
                      You scored <span className="font-semibold">{score}</span>{" "}
                      out of {quiz.length}.
                    </p>

                    {/* ✅ Conditional Message */}
                    {score === quiz.length ? (
                      <p className="text-green-600 font-medium">
                        Perfect score! 🏆
                      </p>
                    ) : score >= quiz.length / 2 ? (
                      <p className="text-blue-600 font-medium">
                        Good job! Keep practicing to improve! 💪
                      </p>
                    ) : (
                      <p className="text-red-600 font-medium">
                        Don’t give up — you’ll get it next time! 🚀
                      </p>
                    )}

                    <div className="flex justify-end gap-3 mt-4">
                      <button
                        onClick={() => setShowScore(false)}
                        className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAnswers({});
                          setScore(0);
                          setShowScore(false);
                        }}
                        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Try Again
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Example Tab */}
        {activeTab === "example" && (
          <div className="space-y-4">
            {examples.length === 0 ? (
              <p className="text-gray-500">
                Click a topic and switch to this tab to generate an example.
              </p>
            ) : (
              examples.map((ex, idx) => (
                <div key={idx} className="bg-white p-4 rounded shadow">
                  <h3 className="text-lg font-semibold mb-1">📌 {ex.title}</h3>
                  <p className="mb-2">{ex.explanation}</p>
                  <blockquote className="italic text-blue-600 mb-2">
                    💡 {ex.highlight}
                  </blockquote>
                  {ex.code && (
                    <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                      <code>{ex.code}</code>
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Sticky bottom nav */}

      <div className="p-4 border-t  flex items-center justify-between">
        <button
          className="bg-white border border-blue-300 text-blue-600 rounded-full px-4 py-2 hover:bg-blue-50 transition"
          onClick={handlePrevButton}
        >
          Prev ⬅️
        </button>
        <button
          disabled={updating}
          className={`rounded-full px-4 py-2 transition ${
            isCurrentTopicCompleted()
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
          onClick={handleMarkAsCompletedButton}
        >
          {isCurrentTopicCompleted()
            ? "Mark As Incomplete ❌"
            : "Mark As Complete ✅"}
        </button>

        <button
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-2 transition"
          onClick={handleNextButton}
        >
          Next ➡️
        </button>
      </div>
    </div>
  );

  return (
    <>
      {loadingTabData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center justify-center min-w-[30vw] min-h-[30vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid mb-4"></div>
            <span className="text-gray-600 font-semibold">Loading...</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}

      <div className="flex flex-row justify-between  mx-auto px-[10vw] py-4 bg-blue-50 min-h-screen items-start">
        {/* Main Section (middle) */}
        <MainSection />
        {/* Right Sidebar (Roadmap) */}
        <RoadmapSidebar />
      </div>
    </>
  );
}

export default LearnPage;
