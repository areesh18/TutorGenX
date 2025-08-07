import React from "react";
import { useEffect, useState, useCallback } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
function Dashboard() {
  const [goal, setGoal] = useState("");
  const [roadmap, setRoadmap] = useState([]);
  const [msg, setMsg] = useState("");
  const [savedRoadmaps, setSavedRoadmaps] = useState([]);
  const [UnsavedRoadmap, setUnsavedRoadmap] = useState(true);
  const [newGoal, setNewGoal] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const fetchSavedRoadmaps = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:8080/roadmaps", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSavedRoadmaps(res.data);
    } catch (err) {
      console.error("Error fetching saved roadmaps:", err);
    }
  }, [token]);
  useEffect(() => {
    fetchSavedRoadmaps();
  }, [token, fetchSavedRoadmaps]);
  if (!token) return <Navigate to="/login" />;
  const handleSaveButton = async () => {
    try {
      await axios.post(
        "http://localhost:8080/save-roadmap",
        {
          goal: newGoal,
          roadmap,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUnsavedRoadmap(false);
      setRoadmap([]);
      setMsg("Roadmap Saved✅");
      fetchSavedRoadmaps();
    } catch (err) {
      console.error("Error saving roadmap:", err);
      alert("Failed to save roadmap");
    }
  };
  const handleDiscardButton = () => {
    setNewGoal("");
    setRoadmap([]);
    setMsg("Roadmap Discarded");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("Generating roadmap..");
    try {
      const res = await axios.post(
        "http://localhost:8080/roadmap",
        { goal },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRoadmap(res.data.roadmap);
      setUnsavedRoadmap(true);
      setNewGoal(res.data.goal);
      /* fetchSavedRoadmaps(); */
      setGoal("");
      setMsg("Roadmap Generated");
    } catch (err) {
      setGoal("");
      console.error(err);

      // 👇 Custom message if backend sent one
      if (
        err.response &&
        err.response.data &&
        typeof err.response.data === "string"
      ) {
        setMsg(err.response.data); // Shows: "Please enter a valid career or learning goal."
      } else {
        setMsg("Failed to generate roadmap");
      }
    }
  };
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this roadmap?"
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8080/delete-roadmap?id=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Refresh roadmaps
      setSavedRoadmaps((prev) => prev.filter((rm) => rm.ID !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete roadmap");
    }
  };
  const handleDeleteAll = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete All roadmaps?"
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8080/delete-all-roadmaps`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Refresh roadmaps
      setSavedRoadmaps([]);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete roadmap");
    }
  };
  const handleCheckboxToggle = async (
    roadmapId,
    weekId,
    topicIndex,
    newValue
  ) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:8080/update-progress",
        {
          roadmap_id: roadmapId,
          week_id: weekId,
          topic_index: topicIndex,
          value: newValue,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh roadmap list after update
      const res = await axios.get("http://localhost:8080/roadmaps", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSavedRoadmaps(res.data);
    } catch (err) {
      console.error("Failed to update progress:", err);
      alert("Could not update progress. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6 font-sans tracking-tight">
      <div className="max-w-2xl mx-auto p-6 rounded-3xl shadow-xl bg-white/90 border border-gray-200/60 backdrop-blur-sm">
        {/* Title */}
        <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-900 tracking-tight">
          🎯 Your AI Career Roadmap
        </h2>

        {/* Input Form */}
        <form
          onSubmit={handleSubmit}
          className="mb-8 bg-gray-50/70 shadow-inner rounded-2xl p-5 border border-gray-200/70 backdrop-blur-sm"
        >
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g. I want to become a data scientist specializing in AI..."
            className="w-full p-4 border border-gray-300/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/80 focus:border-blue-500/70 placeholder-gray-400 resize-none text-gray-700 text-base transition"
            rows={3}
            required
          />
          <button
            type="submit"
            className="mt-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-3 rounded-xl font-semibold shadow-md hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 w-full text-lg"
          >
            🚀 Generate My Roadmap
          </button>
        </form>

        {msg && <p className="text-center text-sm mb-4 text-gray-600">{msg}</p>}

        {/* Generated Roadmap */}
        {roadmap.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-200/70 p-6 mb-6 shadow-md hover:shadow-2xl transition-all duration-300">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              📅 Weekly Plan
            </h3>

            <ul className="space-y-4">
              {roadmap.map((week) => (
                <li
                  key={week.week}
                  className="border border-gray-200/70 p-5 rounded-2xl bg-gray-50/60 hover:bg-gray-100/70 transition duration-200"
                >
                  <h4 className="font-semibold text-gray-800 text-lg">
                    Week {week.week}:{" "}
                    <span className="font-normal">{week.title}</span>
                  </h4>
                  <ul className="list-disc list-inside mt-3 text-sm text-gray-600 space-y-1">
                    {week.topics.map((topic, i) => (
                      <li key={i} className="hover:text-blue-600 transition">
                        {topic}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mt-6">
              <button
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-5 rounded-xl font-medium shadow hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transition-all duration-200"
                onClick={() => handleSaveButton()}
              >
                💾 Save Roadmap
              </button>
              <button
                className="flex-1 py-2 px-5 rounded-xl font-medium text-red-500 border border-red-300/60 hover:bg-red-50 hover:shadow transition-all duration-200"
                onClick={() => handleDiscardButton()}
              >
                🗑 Discard
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Saved Roadmaps */}
      {savedRoadmaps.length > 0 && (
        <div className="mt-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              🗂️ Your Saved Roadmaps
            </h3>
            <button
              onClick={() => handleDeleteAll()}
              className="text-xs sm:text-sm text-red-600 hover:text-red-700 hover:underline transition-colors"
            >
              Delete All
            </button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {savedRoadmaps.map((roadmap, i) => {
              let totalTopics = 0;
              let completedTopics = 0;

              roadmap.weeks.forEach((week) => {
                let topics = [];
                let progress = [];
                try {
                  topics = JSON.parse(week.topics || "[]");
                  progress = JSON.parse(week.progress || "[]");
                } catch (err) {
                  console.error("JSON parse error:", err);
                }
                totalTopics += topics.length;
                completedTopics += progress.filter((p) => p).length;
              });

              const progressPercent =
                totalTopics === 0
                  ? 0
                  : Math.round((completedTopics / totalTopics) * 100);

              return (
                <div
                  key={roadmap.ID || i}
                  className="bg-white/90 rounded-3xl border border-gray-200/60 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 leading-snug">
                        🎯 {roadmap.goal}
                      </h2>
                      <p className="text-xs text-gray-500">
                        Created on{" "}
                        {new Date(roadmap.CreatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(roadmap.ID)}
                      className="text-xs text-red-500 hover:text-red-600 hover:underline transition-colors"
                    >
                      ✕ Delete
                    </button>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
                      <span>
                        Progress:{" "}
                        <span className="font-medium">{completedTopics}</span> /{" "}
                        {totalTopics}
                      </span>
                      <span className="font-semibold">{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Week List */}
                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300">
                    {roadmap.weeks
                      .slice()
                      .sort((a, b) => a.week - b.week)
                      .map((week) => {
                        let topics = [];
                        let progress = [];
                        try {
                          topics = JSON.parse(week.topics || "[]");
                          progress = JSON.parse(week.progress || "[]");
                        } catch (err) {
                          return err;
                        }
                        while (progress.length < topics.length)
                          progress.push(false);

                        return (
                          <div
                            key={week.ID}
                            className="bg-gray-50/70 border border-gray-200/70 rounded-xl p-3 hover:border-blue-300 transition"
                          >
                            <h4 className="font-semibold text-gray-800 text-sm mb-2">
                              📅 Week {week.week}:{" "}
                              <span className="font-normal">{week.title}</span>
                            </h4>
                            <ul className="space-y-1.5">
                              {topics.map((topic, i) => (
                                <li
                                  key={i}
                                  className="flex items-center gap-2 text-sm text-gray-700"
                                >
                                  <input
                                    type="checkbox"
                                    checked={progress[i]}
                                    onChange={() =>
                                      handleCheckboxToggle(
                                        roadmap.ID,
                                        week.ID,
                                        i,
                                        !progress[i]
                                      )
                                    }
                                    className="accent-blue-600 cursor-pointer"
                                  />
                                  <span
                                    className={
                                      progress[i]
                                        ? "line-through text-gray-400"
                                        : "hover:text-blue-600 transition"
                                    }
                                  >
                                    {topic}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => navigate(`/learn/${roadmap.ID}`)}
                    className="mt-4 w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-xl font-medium shadow hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                  >
                    Start Learning →
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
