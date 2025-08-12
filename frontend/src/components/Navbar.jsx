// src/components/Navbar.jsx
import { Link } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function Navbar({bgClass}) {
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
    <nav className={`bg-gray-900  px-6 py-4 flex justify-between items-center border-b-2 border-gray-50 ${bgClass}`}>
      {/* Logo */}
      <h1 className="text-2xl font-extrabold tracking-wide">
        Tutor<span className="text-blue-400">GenX</span>
      </h1>

      {/* Links */}
      <div className="flex items-center space-x-6">
        {currentPath !== "/" && (
          <Link
            to="/"
            className="hover:text-blue-400 transition-colors duration-200"
          >
            Home
          </Link>
        )}

        {currentPath !== "/dashboard" && (
          <Link
            to="/dashboard"
            className="hover:text-blue-400 transition-colors duration-200"
          >
            Dashboard
          </Link>
        )}

        {/* Auth Buttons */}
        {currentPath !== "/login" &&
          (isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-all duration-200"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200"
            >
              Login
            </button>
          ))}
      </div>
    </nav>
  );
}