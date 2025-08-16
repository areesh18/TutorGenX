import React from "react";
import { useEffect, useState, useCallback } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

function Dashboard() {
  const [goal, setGoal] = useState("");
  const [roadmap, setRoadmap] = useState([]);
  const [msg, setMsg] = useState("");
  const [savedRoadmaps, setSavedRoadmaps] = useState([]);
  const [UnsavedRoadmap, setUnsavedRoadmap] = useState(true);
  const [newGoal, setNewGoal] = useState("");
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
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
      setGoal("");
      setMsg("Roadmap Generated");
    } catch (err) {
      setGoal("");
      console.error(err);

      if (
        err.response &&
        err.response.data &&
        typeof err.response.data === "string"
      ) {
        setMsg(err.response.data);
      } else {
        setMsg("Failed to generate roadmap");
      }
    } finally {
      setLoading(false);
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
    <>
      {loading && (
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
            <span className="text-white font-semibold text-lg">Generating roadmap...</span>
            <span className="text-gray-400 text-sm mt-2">This may take a moment</span>
          </motion.div>
        </motion.div>
      )}

      <div 
        className="min-h-screen p-6 font-sans"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 15s ease infinite',
        }}
      >
        {/* Main Content Card */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto p-8 rounded-2xl border border-slate-700/50"
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 50%, rgba(15, 23, 42, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Title */}
          <motion.h2 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent flex items-center justify-center gap-3"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
              🎯
            </div>
            Your AI Career Roadmap
          </motion.h2>

          {/* Input Form */}
          <motion.form 
            onSubmit={handleSubmit} 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. I want to become a data scientist specializing in AI..."
              className="w-full p-4 border border-slate-600 rounded-xl bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-base transition-all duration-300"
              rows={3}
              required
              whileFocus={{ scale: 1.02 }}
            />
            <motion.button
              type="submit"
              disabled={loading}
              className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 w-full text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  🚀 Generate My Roadmap
                </>
              )}
            </motion.button>
          </motion.form>

          {msg && (
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-sm mb-4 text-slate-300"
            >
              {msg}
            </motion.p>
          )}

          {/* Generated Roadmap */}
          <AnimatePresence>
            {roadmap.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="bg-slate-700/50 rounded-2xl border border-slate-600/50 p-6 mb-6 backdrop-blur-sm"
                style={{
                  background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.4) 0%, rgba(30, 41, 59, 0.6) 100%)',
                }}
              >
                <motion.h3 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold text-white mb-6 flex items-center gap-3"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                    📅
                  </div>
                  Weekly Plan
                </motion.h3>

                <ul className="space-y-4">
                  {roadmap.map((week, index) => (
                    <motion.li
                      key={week.week}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index, duration: 0.4 }}
                      className="border border-slate-600/50 p-5 rounded-xl bg-gradient-to-r from-slate-600/30 to-slate-700/20 backdrop-blur-sm hover:from-slate-600/40 hover:to-slate-500/30 transition-all duration-300"
                      whileHover={{ scale: 1.02, y: -2 }}
                    >
                      <motion.h4 
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 + 0.1 * index }}
                        className="font-semibold text-white text-lg mb-3 flex items-center gap-3"
                      >
                        <span className="text-xl">📚</span>
                        Week {week.week}: {week.title}
                      </motion.h4>
                      <motion.ul 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 + 0.1 * index }}
                        className="space-y-2"
                      >
                        {week.topics.map((topic, i) => (
                          <motion.li 
                            key={i} 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + 0.05 * i }}
                            className="text-sm text-slate-300 flex items-center gap-3 hover:text-cyan-300 transition-colors duration-200"
                            whileHover={{ x: 4 }}
                          >
                            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                            {topic}
                          </motion.li>
                        ))}
                      </motion.ul>
                    </motion.li>
                  ))}
                </ul>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-col sm:flex-row sm:justify-between gap-3 mt-6"
                >
                  <motion.button
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 px-5 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                    onClick={() => handleSaveButton()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    💾 Save Roadmap
                  </motion.button>
                  <motion.button
                    className="flex-1 py-3 px-5 rounded-xl font-medium text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-all duration-300"
                    onClick={() => handleDiscardButton()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🗑 Discard
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Saved Roadmaps */}
        <AnimatePresence>
          {savedRoadmaps.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 max-w-7xl mx-auto"
            >
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex justify-between items-center mb-6"
              >
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                    📁
                  </div>
                  Your Saved Roadmaps
                </h3>
                <motion.button
                  onClick={() => handleDeleteAll()}
                  className="text-sm text-red-400 hover:text-red-300 hover:underline transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Delete All
                </motion.button>
              </motion.div>

              <motion.div 
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
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
                    <motion.div
                      key={roadmap.ID || i}
                      initial={{ opacity: 0, y: 30, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.1 * i, duration: 0.4 }}
                      className="rounded-2xl border border-slate-700/50 p-6 transition-all duration-300 hover:border-slate-600/70"
                      style={{
                        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 50%, rgba(15, 23, 42, 0.9) 100%)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                      }}
                      whileHover={{ y: -5, scale: 1.02 }}
                    >
                      <motion.div 
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 + 0.1 * i }}
                        className="flex justify-between items-start mb-4"
                      >
                        <div className="flex-1">
                          <h2 className="text-lg font-bold text-white leading-tight mb-2 flex items-center gap-2">
                            🎯 {roadmap.goal}
                          </h2>
                          <p className="text-xs text-slate-400">
                            Created on {new Date(roadmap.CreatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <motion.button
                          onClick={() => handleDelete(roadmap.ID)}
                          className="text-xs text-red-400 hover:text-red-300 ml-2 p-2 hover:bg-red-500/10 rounded-lg transition-all"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          ✕ Delete
                        </motion.button>
                      </motion.div>

                      {/* Progress */}
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + 0.1 * i }}
                        className="mb-5"
                      >
                        <div className="flex justify-between items-center text-xs text-slate-300 mb-2">
                          <span>Progress: {completedTopics} / {totalTopics}</span>
                          <span className="font-semibold text-white">{progressPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-600/50 rounded-full h-2.5 overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 1, delay: 0.5 + 0.1 * i }}
                          />
                        </div>
                      </motion.div>

                      {/* Week List */}
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 + 0.1 * i }}
                        className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar"
                      >
                        {roadmap.weeks
                          .slice()
                          .sort((a, b) => a.week - b.week)
                          .map((week, weekIndex) => {
                            let topics = [];
                            let progress = [];
                            try {
                              topics = JSON.parse(week.topics || "[]");
                              progress = JSON.parse(week.progress || "[]");
                            } catch (err) {
                              return null;
                            }
                            while (progress.length < topics.length)
                              progress.push(false);

                            return (
                              <motion.div
                                key={week.ID}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * weekIndex }}
                                className="bg-slate-700/40 border border-slate-600/30 rounded-xl p-4 backdrop-blur-sm hover:bg-slate-600/40 transition-all duration-300"
                                whileHover={{ x: 4 }}
                              >
                                <motion.h4 
                                  initial={{ y: -5, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  transition={{ delay: 0.2 + 0.1 * weekIndex }}
                                  className="font-semibold text-white text-sm mb-3 flex items-center gap-2"
                                >
                                  📚 Week {week.week}: {week.title}
                                </motion.h4>
                                <motion.ul 
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.3 + 0.1 * weekIndex }}
                                  className="space-y-1"
                                >
                                  {topics.map((topic, topicIndex) => (
                                    <motion.li
                                      key={topicIndex}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: 0.05 * topicIndex }}
                                      className={`text-sm flex items-center gap-2 transition-colors duration-200 ${
                                        progress[topicIndex]
                                          ? "line-through text-slate-400"
                                          : "text-slate-300 hover:text-cyan-300"
                                      }`}
                                      whileHover={{ x: 2 }}
                                    >
                                      <motion.span 
                                        className={`w-1.5 h-1.5 rounded-full ${progress[topicIndex] ? 'bg-green-500' : 'bg-slate-500'}`}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.1 + 0.05 * topicIndex, type: "spring" }}
                                      />
                                      {topic}
                                    </motion.li>
                                  ))}
                                </motion.ul>
                              </motion.div>
                            );
                          })}
                      </motion.div>

                      
                      <motion.button
                        onClick={() => navigate(`/learn/${roadmap.ID}`)}
                        className="mt-5 w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + 0.1 * i }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Start Learning →
                      </motion.button>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
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

export default Dashboard;