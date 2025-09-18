"use client"
import { useEffect, useState, useCallback } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import axios from "axios"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 8 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="w-12 h-12 mx-auto mb-4 rounded-full ring-8 ring-red-50 bg-red-100 flex items-center justify-center">
              <span className="text-xl" aria-hidden>
                ⚠️
              </span>
              <span className="sr-only">Warning</span>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">{title}</h3>

            {/* Message */}
            <p className="text-gray-600 text-center mb-6 leading-relaxed">{message}</p>

            {/* Buttons */}
            <div className="flex gap-3">
              <motion.button
                onClick={onCancel}
                className="flex-1 px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 font-medium transition-colors"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {cancelText}
              </motion.button>
              <motion.button
                onClick={onConfirm}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-white transition-colors ${
                  isDestructive ? "bg-red-600 hover:bg-red-700" : "bg-indigo-600 hover:bg-indigo-700"
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {confirmText}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const RoadmapModal = ({ isOpen, onClose, roadmap, onSave, onDiscard }) => {
  if (!roadmap) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.98, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.98, opacity: 0, y: 12 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="relative bg-white rounded-xl shadow-xl flex flex-col w-full max-w-7xl border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex-shrink-0 px-6 pt-6 pb-4 md:px-8 md:pt-8 md:pb-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 flex items-center gap-3">
                  <span className="text-3xl md:text-4xl" aria-hidden>
                    📅
                  </span>
                  <span className="text-balance">Topic Wise Plan</span>
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                  aria-label="Close"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto p-6 md:p-8 max-h-[65vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {roadmap.map((week, index) => (
                  <motion.div
                    key={week.week}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.03 * index }}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
                  >
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                      {index + 1}. {week.title}
                    </h4>
                    <ul className="space-y-1">
                      {week.topics.map((topic, i) => (
                        <li key={i} className="text-xs text-gray-700 flex gap-2">
                          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0" />
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Footer / Actions */}
            <div className="flex-shrink-0 px-6 py-4 md:px-8 md:py-5 border-t border-gray-200 bg-gray-50/50 rounded-b-xl">
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={onDiscard}
                  className="px-4 py-2.5 rounded-lg font-medium text-red-600 border border-red-200 bg-white hover:bg-red-50 transition-colors"
                >
                  Discard
                </button>
                <button
                  onClick={onSave}
                  className="px-4 py-2.5 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  Save Course
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
const FollowUpModal = ({ isOpen, onClose, onSubmit }) => {
    const [motivation, setMotivation] = useState("career");
    const [learningStyle, setLearningStyle] = useState("balanced");

    const handleFinalSubmit = (e) => {
      e.preventDefault();
      onSubmit({ motivation, learningStyle });
    };

    if (!isOpen) return null;

    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              className="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Personalize Your Course</h3>
              <p className="text-gray-600 mb-6">A few more details will help us create the perfect plan for you.</p>

              <form onSubmit={handleFinalSubmit} className="space-y-6">
                {/* Motivation Question */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What is your primary motivation for learning this?
                  </label>
                  <select
                    value={motivation}
                    onChange={(e) => setMotivation(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="career">For my career / To get a job</option>
                    <option value="exam">For an exam or certification</option>
                    <option value="hobby">As a hobby / Personal interest</option>
                    <option value="project">To build a specific project</option>
                  </select>
                </div>

                {/* Learning Style Question */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Which learning style do you prefer?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button type="button" onClick={() => setLearningStyle('practical')} className={`p-3 rounded-lg border text-sm ${learningStyle === 'practical' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white hover:bg-gray-50'}`}>Practical & Project-Based</button>
                    <button type="button" onClick={() => setLearningStyle('theoretical')} className={`p-3 rounded-lg border text-sm ${learningStyle === 'theoretical' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white hover:bg-gray-50'}`}>Theoretical & Conceptual</button>
                    <button type="button" onClick={() => setLearningStyle('balanced')} className={`p-3 rounded-lg border text-sm ${learningStyle === 'balanced' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white hover:bg-gray-50'}`}>A Balanced Mix</button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                    Generate Personalized Course
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  function CreateCourse() {
    const [isFollowUpModalOpen, setFollowUpModalOpen] = useState(false);
    const [generatedTitle, setGeneratedTitle] = useState("")
    const [goal, setGoal] = useState("")
    const [roadmap, setRoadmap] = useState([])
    const [msg, setMsg] = useState("")
    const [savedRoadmaps, setSavedRoadmaps] = useState([])
    const [UnsavedRoadmap, setUnsavedRoadmap] = useState(true)
    const [newGoal, setNewGoal] = useState("")
    const [loading, setLoading] = useState(false)
    const [showRoadmapModal, setShowRoadmapModal] = useState(false)

    // Modal states
    const [deleteModal, setDeleteModal] = useState({
      isOpen: false,
      type: null, // 'single' or 'all'
      roadmapId: null,
      title: "",
      message: "",
    })

    const navigate = useNavigate()
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")
    const user = userData ? JSON.parse(userData) : null
    const userName = user?.name || user?.email?.split("@")[0] || "User"

    function formatPossessive(name) {
      if (!name) return ""
      const lower = name.toLowerCase()
      return lower.endsWith("s") ? `${name}'` : `${name}'s`
    }

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

    const handleSaveButton = async () => {
      try {
        let finalTitle = newGoal

        try {
          const titleRes = await axios.post(
            "http://localhost:8080/generateTitle",
            { goalreq: newGoal },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            },
          )
          finalTitle = titleRes.data.title
          setGeneratedTitle(finalTitle)
        } catch (titleErr) {
          console.error("Failed to generate title:", titleErr)
        }

        await axios.post(
          "http://localhost:8080/save-course",
          {
            goal: newGoal,
            title: finalTitle,
            roadmap,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        )
        setShowRoadmapModal(false)
        setUnsavedRoadmap(false)
        setRoadmap([])
        setMsg("Course Saved✅")
        fetchSavedRoadmaps()
        navigate("/dashboard")
      } catch (err) {
        console.error("Error saving roadmap:", err)
        alert("Failed to save roadmap")
      }
    }

    const handleDiscardButton = () => {
      setNewGoal("")
      setRoadmap([])
      setShowRoadmapModal(false)
      setMsg("Course Discarded")
    }

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (goal.trim()) {
        setFollowUpModalOpen(true);
      }
    };
    // NEW: This function is called from the follow-up modal to finally generate the course
    const handleFinalSubmit = async (learningContext) => {
      setFollowUpModalOpen(false);
      setLoading(true);
      setMsg("Generating personalized course...");
      try {
        const res = await axios.post(
          "http://localhost:8080/roadmap",
          {
            goal,
            motivation: learningContext.motivation,
            learningStyle: learningContext.learningStyle
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setRoadmap(res.data.roadmap);
        setShowRoadmapModal(true);
        setNewGoal(res.data.goal);
        setGoal("");
        setMsg("Course Generated");
      } catch (err) {
        setGoal("");
        console.error(err);
        if (err.response && err.response.data && typeof err.response.data === "string") {
          setMsg(err.response.data);
        } else {
          setMsg("Failed to generate roadmap");
        }
      } finally {
        setLoading(false);
      }
    };

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
        {/* Loading Modal */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl shadow-xl p-8 flex flex-col items-center justify-center min-w-[280px] border border-gray-200"
            >
              <div className="relative mb-4">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              </div>
              <span className="text-gray-900 font-medium">Generating roadmap...</span>
              <span className="text-gray-500 text-sm mt-1">This may take a moment</span>
            </motion.div>
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={deleteModal.isOpen}
          title={deleteModal.title}
          message={deleteModal.message}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          confirmText={deleteModal.type === "all" ? "Delete All" : "Delete"}
        />
        {/* NEW: Add the follow-up modal */}
        <FollowUpModal
          isOpen={isFollowUpModalOpen}
          onClose={() => setFollowUpModalOpen(false)}
          onSubmit={handleFinalSubmit}
        />
        {/* Roadmap Preview Modal */}
        <RoadmapModal
          isOpen={showRoadmapModal}
          onClose={() => setShowRoadmapModal(false)}
          roadmap={roadmap}
          onSave={handleSaveButton}
          onDiscard={handleDiscardButton}
        />

        {/* Page background + hero */}
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 font-sans">
          <div className="max-w-4xl mx-auto">
            {/* Main Content Card */}
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="p-6 md:p-8 rounded-2xl border border-gray-200 bg-white shadow-sm"
            >
              {/* Title */}
              <motion.h2
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="text-2xl md:text-3xl font-semibold mb-2 text-center text-gray-900 text-balance"
              >
                Your Learning Journey Starts Here.
              </motion.h2>
              <p className="text-center text-gray-500 mb-6">
                Tell us your goal, and we'll generate a personalized learning plan for you.
              </p>

              {/* Input Form */}
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g., Learn Python for data analysis"
                  className="w-full p-4 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 resize-none text-base"
                  rows={3}
                  required
                  whileFocus={{ scale: 1.005 }}
                />
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={!loading ? { scale: 1.01 } : {}}
                  whileTap={!loading ? { scale: 0.99 } : {}}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>Generate My Course</>
                  )}
                </motion.button>
              </motion.form>

              {msg && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-sm mt-4 text-gray-600"
                >
                  {msg}
                </motion.p>
              )}
            </motion.div>

            {/* "Not sure where to start?" Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-8 text-center"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Not sure where to start? Try one of these:</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {['The History of Ancient Rome', 'Learn Python for Data Science', 'Mastering Digital Marketing', 'Introduction to Quantum Physics'].map((idea, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setGoal(idea)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-100 hover:border-indigo-300 hover:text-indigo-700 transition-colors"
                    whileHover={{ y: -2 }}
                  >
                    {idea}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </>
    )
  }

  export default CreateCourse