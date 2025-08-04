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
    <aside className="w-full md:w-96 max-w-xs bg-white rounded-xl border border-gray-100 p-4 shadow-sm mb-6 md:mb-0 md:ml-8 transition-all duration-200">
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
                          className={`flex items-center text-xs font-mono w-full text-left ${
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
    <div className="flex-1 bg-white shadow rounded-xl h-[95vh] max-w-[60vw] p-4">
      <h1 className="text-2xl font-bold mb-4">{roadmap.goal}</h1>
      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        {["content", "simplify", "quiz"].map((tab) => (
          <button
            key={tab}
            className={`py-1 px-3 border rounded ${
              activeTab === tab ? "bg-blue-600 text-white" : "bg-white"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      {/* Tab Content */}
      {activeTab === "content" && (
        <div className="">
          {/* <p className="text-gray-500 mb-2">
            Click a topic from the sidebar to load explanation here.
          </p> */}
          {selectedTopic && (
            <h2 className="text-xl font-semibold mb-2">📘 {selectedTopic}</h2>
          )}
          <div className="max-w-full max-h-[60vh] overflow-y-auto bg-white rounded p-3 shadow-inner">
            <ReactMarkdown>{explanation}</ReactMarkdown>
          </div>
        </div>
      )}
      {activeTab === "quiz" && <div>💡 Coming soon: quizzes</div>}
      {activeTab === "simplify" && (
        <div>🧠 Coming soon: simplified explanations</div>
      )}
    </div>
  );
  return (
    <div className="flex items-center min-h-screen mx-auto px-[5vw] justify-between  bg-zinc-100 ">
      {/* Main Content */}
      <MainSection />
      {/* Sidebar */}
      <RoadmapSidebar />
    </div>
  );
}

export default LearnPage;
