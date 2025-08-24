import React, { useState, useEffect } from 'react';
import { User, Edit3, Trash2, BookOpen, Clock, Trophy } from 'lucide-react';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    bio: ''
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setEditForm(parsedUser);
    }

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8080/profile/stats", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    fetchStats();
  }, []);

  const recentActivity = [
    { title: "React Hooks Quiz", score: "95%", date: "2 days ago" },
    { title: "JavaScript Fundamentals", status: "Completed", date: "1 week ago" },
    { title: "CSS Grid Layout", score: "87%", date: "1 week ago" }
  ];

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // Here you would typically make an API call to update the user profile
    setUser({ ...user, ...editForm });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm(user);
    setIsEditing(false);
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(false);
    // Here you would typically make an API call to delete the user account
    alert('Account would be deleted');
  };

  if (!user || !stats) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-200 rounded w-64"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <User size={24} className="text-gray-600" />
            </div>
            
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your Name"
                  />
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your Email"
                  />
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Bio"
                    rows="2"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-semibold text-gray-900">{user.name}</h1>
                  <p className="text-gray-600 mt-1">{user.email}</p>
                  <p className="text-gray-600 text-sm mt-1">{user.bio || 'No bio yet.'}</p>
                  <p className="text-gray-500 text-sm mt-2">Joined {user.joinDate || 'recently'}</p>
                </>
              )}
            </div>
          </div>

          {!isEditing && (
            <div className="flex space-x-2">
              <button
                onClick={handleEdit}
                className="border border-gray-300 text-gray-700 px-3 py-2 rounded hover:bg-gray-50 transition-colors flex items-center space-x-1"
              >
                <Edit3 size={16} />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-600 px-3 py-2 rounded hover:bg-red-50 transition-colors flex items-center space-x-1"
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Learning Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4">
            <BookOpen size={24} className="text-gray-600 mx-auto mb-2" />
            <p className="text-2xl font-semibold text-gray-900">{stats.topicsExplored}</p>
            <p className="text-gray-600 text-sm">Topics Explored</p>
          </div>
          <div className="text-center p-4">
            <Trophy size={24} className="text-gray-600 mx-auto mb-2" />
            <p className="text-2xl font-semibold text-gray-900">{stats.roadmapsGenerated}</p>
            <p className="text-gray-600 text-sm">Roadmaps Generated</p>
          </div>
          <div className="text-center p-4">
            <Clock size={24} className="text-gray-600 mx-auto mb-2" />
            <p className="text-2xl font-semibold text-gray-900">0</p>
            <p className="text-gray-600 text-sm">Hours</p>
          </div>
          <div className="text-center p-4">
            <div className="w-6 h-6 bg-gray-600 rounded mx-auto mb-2 flex items-center justify-center">
              <span className="text-white text-xs font-bold">0</span>
            </div>
            <p className="text-2xl font-semibold text-gray-900">0</p>
            <p className="text-gray-600 text-sm">Day Streak</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div>
                <p className="font-medium text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-500">{activity.date}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">
                  {activity.score || activity.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Account</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleDeleteAccount}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors flex-1"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 transition-colors flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;