// src/components/Navbar.jsx
import { Link } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [location]);
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
  };
  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">TutorGenX</h1>
      <div className="space-x-6">
        {currentPath != "/" && (
          <Link to="/" className="hover:text-blue-400">
            Home
          </Link>
        )}

        {currentPath != "/dashboard" && (
          <Link to="/dashboard" className="hover:text-blue-400">
            Dashboard
          </Link>
        )}
        {/* <Link to="/flashcards" className="hover:text-blue-400">Flashcards</Link> */}
        {/* <Link to="/progress" className="hover:text-blue-400">Progress</Link> */}

        {currentPath != "/login" &&
          (isLoggedIn ? (
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
          ))}
      </div>
    </nav>
  );
}
