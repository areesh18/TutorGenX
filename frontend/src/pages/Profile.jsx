import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Edit3, Trash2, BookOpen, Zap, Brain, Save, X, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// A reusable card for displaying user statistics
const StatCard = ({ icon, value, label, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white p-4 rounded-xl flex items-center gap-4 border border-gray-200"
  >
    <div className="bg-indigo-100 text-indigo-600 p-3 rounded-lg">
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  </motion.div>
);

// A modal for confirming destructive actions like account deletion
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-lg"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-700 mb-6">{message}</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors"
            >
              Confirm
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);


const Profile = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ courses: 0, quizzes: 0, flashcards: 0 });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setEditForm({ name: parsedUser.name });
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
    const updatedUser = { ...user, name: editForm.name };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsEditing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate('/login');
  };

  const handleDeleteAccount = () => {
    handleLogout();
    // Here you would typically also make an API call to delete the user from the database
  };

  if (loading) {
    return (
      <div className="text-center p-6">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading Profile...</p>
      </div>
    );
  }

  if (!user) {
    return <div className="text-center p-6 text-red-600">User not found. Please log in.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-2xl p-6"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between">
          <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4 sm:gap-6">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center border-2 border-indigo-200">
              <User size={40} className="text-gray-600" />
            </div>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-lg font-semibold w-full"
                  placeholder="Your Name"
                />
                 <p className="text-gray-500">{user.email}</p>
              </div>
            ) : (
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-500 mt-1">{user.email}</p>
              </div>
            )}
          </div>
          <div className="flex space-x-2 mt-4 sm:mt-0">
            {isEditing ? (
              <>
                <button onClick={handleSave} className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm">
                  <Save size={16} /> Save
                </button>
                <button onClick={() => setIsEditing(false)} className="border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-2 text-sm">
                  <X size={16} /> Cancel
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-2 text-sm">
                <Edit3 size={16} /> Edit
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard icon={<BookOpen />} value={stats.courses} label="Courses" delay={0.1} />
        <StatCard icon={<Zap />} value={stats.quizzes} label="Quizzes" delay={0.2} />
        <StatCard icon={<Brain />} value={stats.flashcards} label="Flashcard Sets" delay={0.3} />
      </div>
      
      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white border border-gray-200 rounded-2xl p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Actions</h2>
        <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleLogout}
              className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <LogOut size={16} /> Log Out
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-50 text-red-700 px-4 py-2 rounded-lg hover:bg-red-100 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Trash2 size={16} /> Delete Account
            </button>
        </div>
      </motion.div>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="This action is permanent and cannot be undone. Are you sure you want to proceed?"
      />
    </div>
  );
};

export default Profile;