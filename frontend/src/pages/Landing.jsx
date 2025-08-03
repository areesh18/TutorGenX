import { useEffect } from "react";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  });
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-2xl font-bold text-blue-600">TutorGenX</h1>
        <div className="space-x-4">
          <button onClick={() => navigate("/")} className="text-gray-700">
            Home
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Dashboard
          </button>
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Login
            </button>
          )}
        </div>
      </header>

      <main className="text-center max-w-3xl mx-auto">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-6">
          Build Your Career Roadmap with AI 🧠
        </h2>
        <p className="text-gray-600 text-lg mb-8">
          Just tell us your goal — we'll generate a step-by-step weekly plan
          tailored just for you.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-blue-600 text-white px-6 py-3 rounded-full text-lg hover:bg-blue-700 transition"
        >
          Get Started
        </button>
      </main>
    </div>
  );
}

export default Landing;
