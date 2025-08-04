import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ReactMarkdown from "react-markdown";

function LearnPage() {
  const { roadmapId } = useParams();
  const [roadmap, setRoadmap] = useState(null);
  const [activeTab, setActiveTab] = useState("Content");
  const [openWeek, setOpenWeek] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [explanation, setExplanation] = useState("");
  const [quiz, setQuiz] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [simplifiedExp, setSimplifiedExp] = useState("");
  const [examples, setExamples] = useState([]); // array of example objects
  const [loadingTabData, setLoadingTabData] = useState(false); // loading spinner

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
    const fetchRoadmap = async () => {
      const res = await axios.get(
        `http://localhost:8080/roadmap/${roadmapId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setRoadmap(res.data);
    };
    fetchRoadmap();
  }, [roadmapId]);

  if (!roadmap) return <p>Loading roadmap...</p>;

  const handleExplainTopic = async (topic) => {
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
  const RoadmapSidebar = () => (
    <aside className="w-80 max-w-xs bg-white rounded-xl border border-gray-100 p-4 shadow-sm self-start overflow-y-auto max-h-[90vh]">
      <h2 className="text-base font-semibold mb-1 flex items-center gap-2">
        <span className="inline-block text-xl">🧭</span>
        {/* {roadmap.goal} */}Roadmap
      </h2>
      <span className="inline-block text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded mb-4">
        Generic
      </span>
      <ul className="space-y-1">
        {roadmap.weeks
          .slice()
          .sort((a, b) => a.week - b.week)
          .map((week, idx) => {
            const topics = JSON.parse(week.topics);
            const progress = JSON.parse(week.progress);
            const isOpen = openWeek === idx;
            return (
              <li key={week.ID} className="transition-all">
                <button
                  className={`flex items-center w-full text-left font-mono font-medium text-gray-800 hover:bg-gray-50 px-2 py-1 rounded transition
                  ${isOpen ? "bg-gray-50" : ""}
                `}
                  onClick={() => setOpenWeek(isOpen ? null : idx)}
                >
                  <span className="mr-2 text-lg">{isOpen ? "▼" : "▶"}</span>
                  <span className="mr-2 text-base">📁</span>
                  {week.week}. {week.title}
                </button>
                {isOpen && (
                  <ul className="ml-8 mt-1 space-y-0.5 border border-gray-200 rounded bg-white py-2 px-2 shadow-sm">
                    {topics.map((topic, i) => (
                      <li
                        key={i}
                        className={`flex items-center text-xs font-mono ${
                          progress[i]
                            ? "text-green-600 line-through"
                            : "text-gray-700"
                        }`}
                      >
                        <button
                          onClick={() => handleExplainTopic(topic)}
                          className={` cursor-pointer flex items-center text-xs font-mono w-full text-left ${
                            progress[i]
                              ? "text-green-600 line-through"
                              : "text-gray-700"
                          }`}
                        >
                          <span className="mr-1 text-base">
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
  const MainSection = () => (
    <div className="flex-1 bg-white shadow rounded-xl h-[90vh] max-w-3xl p-6 overflow-y-auto">
      <h1 className="text-2xl font-bold mb-4">{roadmap.goal}</h1>
      {/* Tabs */}
      <div className="flex space-x-6 border-b mb-4">
        {["Content", "Simplify", "Quiz", "Example"].map((tab) => (
          <button
            key={tab}
            className={`pb-2 px-2 font-semibold ${
              activeTab === tab.toLowerCase()
                ? "border-b-2 border-orange-500 text-orange-500"
                : "text-gray-400"
            }`}
            onClick={() => setActiveTab(tab.toLowerCase())}
          >
            {tab}
          </button>
        ))}
      </div>
      {/* Tab Content */}
      {activeTab === "content" && (
        <div>
          {explanation === "" ? (
            <p className="text-gray-500">
              Click a topic and switch to this tab to generate a simplified
              explanation.
            </p>
          ) : (
            <>
              {selectedTopic && (
                <h2 className="text-xl font-semibold mb-2">
                  📘 {selectedTopic}
                </h2>
              )}
              <div className="prose max-w-none max-h-[60vh] overflow-y-auto bg-white rounded p-4 shadow-inner">
                <ReactMarkdown>{explanation}</ReactMarkdown>
              </div>
            </>
          )}
        </div>
      )}
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
                <ul className="space-y-2">
                  {q.options.map((opt, i) => {
                    const optionLetter = String.fromCharCode(65 + i); // A, B, C...
                    return (
                      <li key={i}>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name={`q-${idx}`}
                            value={optionLetter}
                            checked={selectedAnswers[idx] === optionLetter}
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
                let score = 0;
                quiz.forEach((q, idx) => {
                  if (selectedAnswers[idx] === q.answer) score++;
                });
                alert(`You scored ${score} out of ${quiz.length}`);
              }}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
            >
              Submit Quiz
            </button>
          )}
        </div>
      )}

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
                <h2 className="text-xl font-semibold mb-2">
                  📘 {selectedTopic} simplified!
                </h2>
              )}
              <div className="prose max-w-none max-h-[60vh] overflow-y-auto bg-white rounded p-4 shadow-inner">
                <ReactMarkdown>{simplifiedExp}</ReactMarkdown>
              </div>
            </>
          )}
        </div>
      )}
      {activeTab === "example" && (
        <div>
          {examples.length === 0 ? (
            <p className="text-gray-500">
              Click a topic and switch to this tab to generate an example.
            </p>
          ) : (
            examples.map((ex, idx) => (
              <div key={idx} className="bg-white p-4 rounded shadow mb-4">
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
  );
  return (
    <>
      {loadingTabData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center justify-center shadow min-w-[30vw] min-h-[30vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid mb-4"></div>
            <span className="text-gray-600 font-semibold">Loading...</span>
          </div>
        </div>
      )}

      <div className="flex flex-row justify-between items-center mx-auto px-[10vw] py-8 bg-zinc-100 min-h-screen">
        {/* Main Content */}
        <MainSection />
        {/* Sidebar */}
        <RoadmapSidebar />
      </div>
    </>
  );
}

export default LearnPage;
