"use client"
import { useEffect, useState, useCallback } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"

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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.98, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.98, opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl ring-1 ring-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <span className="text-xl text-red-600" aria-hidden="true">
                ⚠️
              </span>
              <span className="sr-only">Warning</span>
            </div>

            <motion.h3
              initial={{ y: 6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mb-2 text-center text-lg font-semibold text-gray-900"
            >
              {title}
            </motion.h3>

            <motion.p
              initial={{ y: 6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mb-6 text-center text-sm leading-relaxed text-gray-600"
            >
              {message}
            </motion.p>

            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex gap-3">
              <motion.button
                onClick={onCancel}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {cancelText}
              </motion.button>
              <motion.button
                onClick={onConfirm}
                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white ${
                  isDestructive ? "bg-red-600 hover:bg-red-700" : "bg-indigo-600 hover:bg-indigo-700"
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                aria-label={confirmText}
              >
                {confirmText}
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Courses() {
  const [savedRoadmaps, setSavedRoadmaps] = useState([])
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: null, // 'single' or 'all'
    roadmapId: null,
    title: "",
    message: "",
  })

  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  const fetchSavedRoadmaps = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:8080/roadmaps", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setSavedRoadmaps(res.data)
    } catch (err) {
      console.error("Error fetching saved roadmaps:", err)
    }
  }, [token])

  useEffect(() => {
    fetchSavedRoadmaps()
  }, [token, fetchSavedRoadmaps])

  if (!token) return <Navigate to="/login" />

  // Open delete modal for single roadmap
  const handleDeleteClick = (id, title = "Learning Roadmap") => {
    setDeleteModal({
      isOpen: true,
      type: "single",
      roadmapId: id,
      title: "Delete Roadmap?",
      message: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
    })
  }

  // Open delete modal for all roadmaps
  const handleDeleteAllClick = () => {
    setDeleteModal({
      isOpen: true,
      type: "all",
      roadmapId: null,
      title: "Delete All Roadmaps?",
      message: `Are you sure you want to delete all ${savedRoadmaps.length} roadmaps? This action cannot be undone.`,
    })
  }

  // Handle modal confirmation
  const handleDeleteConfirm = async () => {
    try {
      if (deleteModal.type === "single") {
        await axios.delete(`http://localhost:8080/delete-roadmap?id=${deleteModal.roadmapId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setSavedRoadmaps((prev) => prev.filter((rm) => rm.ID !== deleteModal.roadmapId))
      } else if (deleteModal.type === "all") {
        await axios.delete(`http://localhost:8080/delete-all-roadmaps`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setSavedRoadmaps([])
      }

      // Close modal
      setDeleteModal({
        isOpen: false,
        type: null,
        roadmapId: null,
        title: "",
        message: "",
      })
    } catch (err) {
      console.error("Delete failed:", err)
      alert("Failed to delete roadmap(s)")
      // Close modal even on error
      setDeleteModal({
        isOpen: false,
        type: null,
        roadmapId: null,
        title: "",
        message: "",
      })
    }
  }

  // Handle modal cancellation
  const handleDeleteCancel = () => {
    setDeleteModal({
      isOpen: false,
      type: null,
      roadmapId: null,
      title: "",
      message: "",
    })
  }

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

      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:p-8 font-sans text-gray-900">
        {/* Saved Roadmaps */}
        <AnimatePresence>
          {savedRoadmaps.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="mx-auto mt-2 max-w-7xl"
            >
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mb-6 flex items-center justify-between"
              >
                <h3 className="flex items-center gap-2 text-xl font-semibold sm:text-2xl">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-indigo-100 text-indigo-700">
                    📁
                  </span>
                  <span className="text-balance">Your Saved Courses</span>
                </h3>
                <motion.button
                  onClick={handleDeleteAllClick}
                  className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  aria-label="Delete all saved courses"
                >
                  Delete All
                </motion.button>
              </motion.div>

              {/* Cards grid */}
              <motion.div
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {savedRoadmaps.map((roadmap, i) => {
                  let totalTopics = 0
                  let completedTopics = 0

                  roadmap.weeks.forEach((week) => {
                    let topics = []
                    let progress = []
                    try {
                      topics = JSON.parse(week.topics || "[]")
                      progress = JSON.parse(week.progress || "[]")
                    } catch (err) {
                      console.error("JSON parse error:", err)
                    }
                    totalTopics += topics.length
                    completedTopics += progress.filter((p) => p).length
                  })

                  const progressPercent = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100)

                  return (
                    <motion.div
                      key={roadmap.ID || i}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * i, duration: 0.25 }}
                      className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-5"
                      whileHover={{ y: -4 }}
                    >
                      {/* Card header */}
                      <motion.div
                        initial={{ y: -6, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 + 0.05 * i }}
                        className="mb-3 flex items-start justify-between"
                      >
                        <div className="flex-1">
                          <h2 className="mb-1 flex items-center gap-2 text-base font-semibold text-gray-900">
                            🎯 {roadmap?.title || "Learning Roadmap"}
                          </h2>
                          <p className="text-xs text-gray-500">
                            Created on {new Date(roadmap.CreatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <motion.button
                          onClick={() => handleDeleteClick(roadmap.ID, roadmap?.title || "Learning Roadmap")}
                          className="ml-2 rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          aria-label="Delete roadmap"
                        >
                          Delete
                        </motion.button>
                      </motion.div>

                      {/* Progress */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15 + 0.05 * i }}
                        className="mb-4"
                      >
                        <div className="mb-2 flex items-center justify-between text-xs text-gray-600">
                          <span>
                            Progress: {completedTopics} / {totalTopics}
                          </span>
                          <span className="font-semibold text-gray-900">{progressPercent}%</span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                          <motion.div
                            className="h-full rounded-full bg-indigo-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.6, delay: 0.2 + 0.05 * i }}
                          />
                        </div>
                      </motion.div>

                      {/* Week List */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 + 0.05 * i }}
                        className="custom-scrollbar max-h-48 space-y-3 overflow-y-auto"
                      >
                        {roadmap.weeks
                          .slice()
                          .sort((a, b) => a.week - b.week)
                          .map((week, weekIndex) => {
                            let topics = []
                            let progress = []
                            try {
                              topics = JSON.parse(week.topics || "[]")
                              progress = JSON.parse(week.progress || "[]")
                            } catch (err) {
                              return null
                            }
                            while (progress.length < topics.length) progress.push(false)

                            return (
                              <motion.div
                                key={week.ID}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.05 * weekIndex }}
                                className="rounded-lg border border-gray-200 bg-gray-50 p-3 hover:bg-gray-100"
                                whileHover={{ x: 2 }}
                              >
                                <motion.h4
                                  initial={{ y: -4, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  transition={{ delay: 0.1 + 0.05 * weekIndex }}
                                  className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900"
                                >
                                  📚 {week.week}: {week.title}
                                </motion.h4>
                                <motion.ul
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.15 + 0.05 * weekIndex }}
                                  className="space-y-1.5"
                                >
                                  {topics.map((topic, topicIndex) => (
                                    <motion.li
                                      key={topicIndex}
                                      initial={{ opacity: 0, x: -6 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: 0.03 * topicIndex }}
                                      className={`flex items-center gap-2 text-sm ${
                                        progress[topicIndex]
                                          ? "line-through text-gray-400"
                                          : "text-gray-700 hover:text-indigo-700"
                                      }`}
                                      whileHover={{ x: 1 }}
                                    >
                                      <motion.span
                                        className={`h-1.5 w-1.5 rounded-full ${
                                          progress[topicIndex] ? "bg-indigo-600" : "bg-gray-400"
                                        }`}
                                        initial={{ scale: 0.8 }}
                                        animate={{ scale: 1 }}
                                      />
                                      {topic}
                                    </motion.li>
                                  ))}
                                </motion.ul>
                              </motion.div>
                            )
                          })}
                      </motion.div>

                      {/* CTA */}
                      <motion.button
                        onClick={() => navigate(`/learn/${roadmap.ID}`)}
                        className="mt-5 w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-indigo-700"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 + 0.05 * i }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        Start Learning →
                      </motion.button>
                    </motion.div>
                  )
                })}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f3f4f6; /* gray-100 */
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c7d2fe; /* indigo-200 */
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a5b4fc; /* indigo-300 */
        }
      `}</style>
    </>
  )
}

export default Courses
