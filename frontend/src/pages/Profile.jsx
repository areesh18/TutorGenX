import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Edit3, Trash2, BookOpen, Zap, Brain, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StatCard = ({ icon, value, label }) => (
  <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-4 border border-gray-200">
    <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full">
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  </div>
);

const Profile = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ courses: 0, quizzes: 0, flashcards: 0 });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setEditForm({ name: parsedUser.name, email: parsedUser.email });
      }

      try {
        if (token) {
          const [resCourses, resQuizzes, resFlashcards] = await Promise.all([
            axios.get("http://localhost:8080/getsavedcourses", { headers: { Authorization: `Bearer ${token}` } }),
            axios.get("http://localhost:8080/my-quizzes", { headers: { Authorization: `Bearer ${token}` } }),
            axios.get("http://localhost:8080/my-flashcards", { headers: { Authorization: `Bearer ${token}` } }),
          ]);

          setStats({
            courses: (resCourses.data || []).length,
            quizzes: (resQuizzes.data || []).length,
            flashcards: (resFlashcards.data || []).length,
          });
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [token]);

  const handleSave = () => {
    const updatedUser = { ...user, name: editForm.name, email: editForm.email };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsEditing(false);
  };

  const handleDeleteAccount = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setShowDeleteConfirm(false);
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 animate-pulse">
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-48"></div>
              <div className="h-4 bg-gray-200 rounded w-64"></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-24 bg-white border border-gray-200 rounded-lg"></div>
          <div className="h-24 bg-white border border-gray-200 rounded-lg"></div>
          <div className="h-24 bg-white border border-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className="text-center p-6">User not found. Please log in.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-lg p-6"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <User size={32} className="text-gray-600" />
            </div>
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="border border-gray-300 rounded px-3 py-2 w-full"
                  placeholder="Your Name"
                />
                <input
                  type="email"
                  value={editForm.email}
                  disabled
                  className="border border-gray-300 rounded px-3 py-2 w-full bg-gray-100 cursor-not-allowed"
                  placeholder="Your Email"
                />
              </div>
            ) : (
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{user.name}</h1>
                <p className="text-gray-600 mt-1">{user.email}</p>
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <button onClick={handleSave} className="bg-indigo-600 text-white px-3 py-2 rounded hover:bg-indigo-700 flex items-center gap-2">
                  <Save size={16} /> Save
                </button>
                <button onClick={() => setIsEditing(false)} className="border border-gray-300 text-gray-700 px-3 py-2 rounded hover:bg-gray-100 flex items-center gap-2">
                  <X size={16} /> Cancel
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="border border-gray-300 text-gray-700 px-3 py-2 rounded hover:bg-gray-100 flex items-center gap-2">
                <Edit3 size={16} /> Edit
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={<BookOpen />} value={stats.courses} label="Courses Created" />
          <StatCard icon={<Zap />} value={stats.quizzes} label="Quizzes Taken" />
          <StatCard icon={<Brain />} value={stats.flashcards} label="Flashcard Sets" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white border border-red-200 rounded-lg p-6"
      >
        <h2 className="text-xl font-semibold text-red-700 mb-2">Danger Zone</h2>
        <p className="text-gray-600 mb-4">Deleting your account is a permanent action and cannot be undone.</p>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-2"
        >
          <Trash2 size={16} /> Delete Account
        </button>
      </motion.div>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Account Deletion</h3>
              <p className="text-gray-700 mb-6">Are you absolutely sure you want to delete your account?</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-100 flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex-1"
                >
                  Yes, Delete My Account
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile; 