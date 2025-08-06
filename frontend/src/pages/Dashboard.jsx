import React from "react";
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
function Dashboard() {
  const [goal, setGoal] = useState("");
  const [roadmap, setRoadmap] = useState([]);
  const [msg, setMsg] = useState("");
  const [savedRoadmaps, setSavedRoadmaps] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  useEffect(() => {
    const fetchSavedRoadmaps = async () => {
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
    };

    fetchSavedRoadmaps();
  }, [token]);
  if (!token) return <Navigate to="/login" />;

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
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4 text-center">
          🎯 Your AI Career Roadmap
        </h2>

        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="What do you want to become?"
            className="w-full p-3 border rounded mb-4"
            rows={3}
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
          >
            Generate Roadmap
          </button>
        </form>

        {msg && <p className="text-center text-sm mb-4">{msg}</p>}

        {roadmap.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-2">📅 Weekly Plan</h3>
            <ul className="space-y-4 ">
              {roadmap.map((week) => (
                <li key={week.week} className="border  p-4 rounded bg-gray-50">
                  <h4 className="font-bold ">
                    Week {week.week}: {week.title}
                  </h4>
                  <ul className="list-disc list-inside mt-2 text-sm text-gray-700">
                    {week.topics.map((topic, i) => (
                      <li key={i}>{topic}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {savedRoadmaps.length > 0 && (
        <div className="mt-10  ">
          <div className="flex justify-between ">
            <h3 className="text-xl font-semibold mb-2">
              🗂️ Your Saved Roadmaps
            </h3>
            <button
              onClick={() => handleDeleteAll()}
              className="text-sm text-red-600 hover:underline ml-2"
            >
              Delete All
            </button>
          </div>
          {/* <div className="space-y-6 bg-red-600">
            {savedRoadmaps.map((roadmap, i) => (
              <div
                key={roadmap.ID || i}
                className="border rounded p-4  shadow bg-green-500"
              >
                <div className="flex justify-between bg-blue-600">
                  <p className="text-sm text-gray-600 mb-1">
                    📅 Created:{" "}
                    {new Date(roadmap.CreatedAt).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => handleDelete(roadmap.ID)}
                    className="text-sm text-red-600 hover:underline ml-2"
                  >
                    Delete
                  </button>
                </div>

                <h4 className="font-bold text-lg mb-2">{roadmap.goal}</h4>
                <ul className="space-y-2">
                  {roadmap.weeks.map((week) => (
                    <li key={week.ID} className="border p-3 rounded bg-gray-50">
                      <h5 className="font-semibold">
                        Week {week.week}: {week.title}
                      </h5>
                      <ul className="text-sm text-gray-700 mt-1 space-y-1">
                        {(() => {
                          let topics = [];
                          let progress = [];

                          try {
                            topics = JSON.parse(week.topics || "[]");
                          } catch (err) {
                            console.error("Invalid topics JSON:", week.topics);
                          }

                          try {
                            progress = JSON.parse(week.progress || "[]");
                          } catch (err) {
                            console.error(
                              "Invalid progress JSON:",
                              week.progress
                            );
                          }

                          // Ensure progress has same length as topics
                          while (progress.length < topics.length) {
                            progress.push(false);
                          }

                          return topics.map((topic, i) => {
                            const checked = progress[i];

                            return (
                              <li
                                key={i}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() =>
                                    handleCheckboxToggle(
                                      roadmap.ID,
                                      week.ID,
                                      i,
                                      !checked
                                    )
                                  }
                                  className="accent-blue-600"
                                />
                                <span
                                  className={
                                    checked ? "line-through text-gray-400" : ""
                                  }
                                >
                                  {topic}
                                </span>
                              </li>
                            );
                          });
                        })()}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div> */}

          <div className=" grid grid-cols-3 ">
            {savedRoadmaps.map((roadmap, i) => {
              // 🔢 1. Calculate progress
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
                  className="bg-white w-[25vw]  rounded-xl border border-gray-100 p-4 mb-6 shadow-sm transition hover:shadow-md max-w-full"
                >
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800 truncate ">
                        🎯 {roadmap.goal}
                      </h2>
                      <p className="text-xs text-gray-400">
                        Created:{" "}
                        {new Date(roadmap.CreatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(roadmap.ID)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                      <span>
                        Progress: {completedTopics}/{totalTopics}
                      </span>
                      <span>{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Weeks */}
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
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
                          <div key={week.ID} className="bg-gray-50 rounded p-2">
                            <h4 className="font-medium text-gray-700 text-sm mb-1">
                              Week {week.week}: {week.title}
                            </h4>
                            <ul className="space-y-1">
                              {topics.map((topic, i) => (
                                <li
                                  key={i}
                                  className="flex items-center space-x-2 text-xs"
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
                                    className="accent-blue-600"
                                  />
                                  <span
                                    className={
                                      progress[i]
                                        ? "line-through text-gray-400"
                                        : ""
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
                  <button
                    onClick={() => navigate(`/learn/${roadmap.ID}`)}
                    className="mt-3 bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700"
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
