import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ReactMarkdown from "react-markdown";

function LearnPage() {
  const { roadmapId } = useParams();
  const [roadmap, setRoadmap] = useState(null);
  const [activeTab, setActiveTab] = useState("roadmap");
  const [openWeek, setOpenWeek] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [explanation, setExplanation] = useState("");
  const [quiz, setQuiz] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  useEffect(() => {
    const generateQuiz = async () => {
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
      }
    };

    if (activeTab === "quiz" && explanation) {
      generateQuiz();
    }
  }, [activeTab, explanation]);

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
          {selectedTopic && (
            <h2 className="text-xl font-semibold mb-2">📘 {selectedTopic}</h2>
          )}
          <div className="prose max-w-none max-h-[60vh] overflow-y-auto bg-white rounded p-4 shadow-inner">
            <ReactMarkdown>{explanation}</ReactMarkdown>
          </div>
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
        <div>🧠 Coming soon: simplified explanations</div>
      )}
    </div>
  );
  return (
    <div className="flex flex-row justify-between items-center mx-auto px-[10vw] py-8 bg-zinc-100 min-h-screen">
      {/* Main Content */}
      <MainSection />
      {/* Sidebar */}
      <RoadmapSidebar />
    </div>
  );
}

export default LearnPage;
