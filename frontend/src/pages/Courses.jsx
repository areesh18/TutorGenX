import React from "react";
import { useEffect, useState, useCallback } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

// Custom Modal Component
const DeleteConfirmModal = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  isDestructive = true,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-md border border-slate-700/50 relative"
            onClick={(e) => e.stopPropagation()}
            style={{
              background:
                "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 50%, rgba(15, 23, 42, 0.95) 100%)",
              backdropFilter: "blur(20px)",
              boxShadow:
                "0 25px 50px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            }}
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center"
            >
              <span className="text-2xl">⚠️</span>
            </motion.div>

            {/* Title */}
            <motion.h3
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-xl font-bold text-white text-center mb-3"
            >
              {title}
            </motion.h3>

            {/* Message */}
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-slate-300 text-center mb-6 leading-relaxed"
            >
              {message}
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="flex gap-3"
            >
              <motion.button
                onClick={onCancel}
                className="flex-1 px-4 py-3 bg-slate-600/50 hover:bg-slate-600/70 text-white rounded-xl font-medium transition-all duration-300 border border-slate-600/30"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {cancelText}
              </motion.button>
              <motion.button
                onClick={onConfirm}
                className={`flex-1 px-4 py-3 text-white rounded-xl font-medium transition-all duration-300 ${
                  isDestructive
                    ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                    : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {confirmText}
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function Courses() {
  const [savedRoadmaps, setSavedRoadmaps] = useState([]);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: null, // 'single' or 'all'
    roadmapId: null,
    title: "",
    message: "",
  });

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

  // Open delete modal for single roadmap
  const handleDeleteClick = (id, title = "Learning Roadmap") => {
    setDeleteModal({
      isOpen: true,
      type: "single",
      roadmapId: id,
      title: "Delete Roadmap?",
      message: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
    });
  };

  // Open delete modal for all roadmaps
  const handleDeleteAllClick = () => {
    setDeleteModal({
      isOpen: true,
      type: "all",
      roadmapId: null,
      title: "Delete All Roadmaps?",
      message: `Are you sure you want to delete all ${savedRoadmaps.length} roadmaps? This action cannot be undone.`,
    });
  };

  // Handle modal confirmation
  const handleDeleteConfirm = async () => {
    try {
      if (deleteModal.type === "single") {
        await axios.delete(
          `http://localhost:8080/delete-roadmap?id=${deleteModal.roadmapId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSavedRoadmaps((prev) =>
          prev.filter((rm) => rm.ID !== deleteModal.roadmapId)
        );
      } else if (deleteModal.type === "all") {
        await axios.delete(`http://localhost:8080/delete-all-roadmaps`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSavedRoadmaps([]);
      }

      // Close modal
      setDeleteModal({
        isOpen: false,
        type: null,
        roadmapId: null,
        title: "",
        message: "",
      });
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete roadmap(s)");
      // Close modal even on error
      setDeleteModal({
        isOpen: false,
        type: null,
        roadmapId: null,
        title: "",
        message: "",
      });
    }
  };

  // Handle modal cancellation
  const handleDeleteCancel = () => {
    setDeleteModal({
      isOpen: false,
      type: null,
      roadmapId: null,
      title: "",
      message: "",
    });
  };

  return (
    <>
      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        title={deleteModal.title}
        message={deleteModal.message}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        confirmText={deleteModal.type === "all" ? "Delete All" : "Delete"}
      />

      <div
        className="min-h-screen p-3 sm:p-4 md:p-6 font-sans"
        style={{
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%)",
          backgroundSize: "400% 400%",
          animation: "gradientShift 15s ease infinite",
        }}
      >
        {/* Saved Roadmaps */}
        <AnimatePresence>
          {savedRoadmaps.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-6 sm:mt-8 max-w-7xl mx-auto"
            >
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex justify-between items-center mb-6"
              >
                <h3 className="text-lg sm:text-xl md:text-2xl  font-bold text-white flex items-center gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8  rounded-lg flex items-center justify-center text-sm sm:text-base">
                    📁
                  </div>
                  <span className="break-words">Your Saved Courses</span>
                </h3>
                <motion.button
                  onClick={handleDeleteAllClick}
                  className="text-sm text-red-400 hover:text-red-300 border border-white px-2 py-1 rounded  hover:underline transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Delete All
                </motion.button>
              </motion.div>

              <motion.div
                className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
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
                      className="rounded-xl sm:rounded-2xl border border-slate-700/50 p-3 sm:p-4 md:p-6 transition-all duration-300 hover:border-slate-600/70"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 50%, rgba(15, 23, 42, 0.9) 100%)",
                        backdropFilter: "blur(20px)",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
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
                            🎯 {roadmap?.title || "Learning Roadmap"}
                          </h2>
                          <p className="text-xs text-slate-400">
                            Created on{" "}
                            {new Date(roadmap.CreatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <motion.button
                          onClick={() =>
                            handleDeleteClick(
                              roadmap.ID,
                              roadmap?.title || "Learning Roadmap"
                            )
                          }
                          className="text-xs text-red-400 hover:text-red-300 ml-2 p-2 hover:bg-red-500/10 rounded-lg transition-all"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          ❌ Delete
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
                          <span>
                            Progress: {completedTopics} / {totalTopics}
                          </span>
                          <span className="font-semibold text-white">
                            {progressPercent}%
                          </span>
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
                                  📚 {week.week}: {week.title}
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
                                        className={`w-1.5 h-1.5 rounded-full ${
                                          progress[topicIndex]
                                            ? "bg-green-500"
                                            : "bg-slate-500"
                                        }`}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{
                                          delay: 0.1 + 0.05 * topicIndex,
                                          type: "spring",
                                        }}
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
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
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

export default Courses;