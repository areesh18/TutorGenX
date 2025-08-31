// src/components/Navbar.jsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  HomeIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function Navbar({ bgClass }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    setIsLoggedIn(!!token);
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setShowUserMenu(false);
    navigate("/");
  };

  const isActivePath = (path) => currentPath === path;

  const NavLink = ({
    to,
    children,
    icon: Icon,
    external = false,
    mobile = false,
  }) => {
    const baseClasses = mobile
      ? "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium w-full"
      : "flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium";

    const activeClasses = mobile
      ? "text-blue-600 bg-blue-50 border border-blue-200"
      : "bg-blue-600 text-white shadow-md";

    const inactiveClasses = mobile
      ? "hover:text-blue-600 text-gray-600 hover:bg-gray-50 border border-gray-200"
      : "hover:bg-gray-100 hover:text-blue-600 text-gray-700";

    const linkClasses = `${baseClasses} ${
      isActivePath(to) ? activeClasses : inactiveClasses
    }`;

    const handleClick = () => {
      if (mobile) {
        setIsMobileMenuOpen(false);
      }
    };

    if (external) {
      return (
        <a
          href={to}
          className={linkClasses}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
        >
          {Icon && <Icon className={mobile ? "w-5 h-5" : "w-4 h-4"} />}
          <span>{children}</span>
        </a>
      );
    }

    return (
      <Link to={to} className={linkClasses} onClick={handleClick}>
        {Icon && <Icon className={mobile ? "w-5 h-5" : "w-4 h-4"} />}
        <span>{children}</span>
      </Link>
    );
  };

  // Animation variants for mobile menu
  const menuVariants = {
    closed: {
      opacity: 0,
      y: -20,
      scale: 0.95,
    },
    open: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
  };

  const backdropVariants = {
    closed: {
      opacity: 0,
    },
    open: {
      opacity: 1,
    },
  };

  const itemVariants = {
    closed: {
      opacity: 0,
      x: -20,
    },
    open: {
      opacity: 1,
      x: 0,
    },
  };

  return (
    <>
      <nav className={`bg-white/95 backdrop-blur-lg w-[93vw] mx-auto mt-2 rounded-xl text-gray-900 px-4 sm:px-6 py-4 shadow-xl border border-gray-300/60 ${bgClass} relative z-50`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-wide hover:scale-105 transition-transform duration-200 text-gray-900">
              Tutor<span className="text-blue-600">GenX</span>
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Navigation Links */}
            <div className="flex items-center space-x-2">
              <NavLink to="/" icon={HomeIcon}>
                Home
              </NavLink>

              {isLoggedIn && (
                <NavLink to="/dashboard" icon={ChartBarIcon}>
                  Dashboard
                </NavLink>
              )}
            </div>

            {/* Auth Section */}
            {isLoggedIn ? (
              <div className="relative ml-6">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 hover:bg-gray-100 transition-colors duration-200 min-h-[44px] text-gray-700"
                >
                  <UserCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 text-gray-500" />
                  <span className="text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-none">
                    {user?.name || user?.email || "User"}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 text-gray-400 ${
                      showUserMenu ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm text-gray-500">Signed in as</p>
                      <p className="text-sm font-medium truncate text-gray-900">
                        {user?.email}
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors text-gray-700"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <UserCircleIcon className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm hover:bg-red-50 transition-colors text-red-600 hover:text-red-700"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              currentPath !== "/login" && (
                <div className="flex space-x-1 sm:space-x-2 ml-4 sm:ml-6">
                  <button
                    onClick={() => navigate("/signup")}
                    className="px-2 sm:px-4 py-2 text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200 text-sm sm:text-base rounded-lg hover:bg-gray-50"
                  >
                    Sign up
                  </button>
                  <button
                    onClick={() => navigate("/login")}
                    className="bg-blue-600 text-white px-2 sm:px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base"
                  >
                    Login
                  </button>
                </div>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center relative z-50 text-gray-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={isMobileMenuOpen ? "open" : "closed"}
              variants={{
                closed: { rotate: 0 },
                open: { rotate: 180 },
              }}
              transition={{ duration: 0.2 }}
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </motion.div>
          </motion.button>
        </div>

        {/* Click outside to close user menu */}
        {showUserMenu && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowUserMenu(false)}
          />
        )}
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 md:hidden bg-black/20 backdrop-blur-sm"
              variants={backdropVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile Menu */}
            <motion.div
              className="fixed top-20 left-4 right-4 z-50 md:hidden"
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{
                duration: 0.3,
                ease: [0.04, 0.62, 0.23, 0.98],
              }}
            >
              <div className="bg-white/98 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-300/60 p-6">
                {/* Navigation Links */}
                <motion.div
                  className="space-y-3"
                  variants={{
                    open: {
                      transition: { staggerChildren: 0.07, delayChildren: 0.1 },
                    },
                    closed: {
                      transition: {
                        staggerChildren: 0.05,
                        staggerDirection: -1,
                      },
                    },
                  }}
                  initial="closed"
                  animate="open"
                  exit="closed"
                >
                  <motion.div variants={itemVariants}>
                    <NavLink to="/" icon={HomeIcon} mobile>
                      Home
                    </NavLink>
                  </motion.div>

                  {isLoggedIn && (
                    <motion.div variants={itemVariants}>
                      <NavLink to="/dashboard" icon={ChartBarIcon} mobile>
                        Dashboard
                      </NavLink>
                    </motion.div>
                  )}

                  {isLoggedIn ? (
                    <>
                      <motion.div
                        variants={itemVariants}
                        className="border-t pt-4 mt-4 border-gray-200"
                      >
                        <div className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-200">
                          <p className="text-sm text-gray-500">Signed in as</p>
                          <p className="text-sm font-medium text-gray-900">
                            {user?.email}
                          </p>
                        </div>
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <NavLink to="/profile" icon={UserCircleIcon} mobile>
                          Profile
                        </NavLink>
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium w-full text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200"
                        >
                          <ArrowRightOnRectangleIcon className="w-5 h-5" />
                          <span>Sign out</span>
                        </button>
                      </motion.div>
                    </>
                  ) : (
                    currentPath !== "/login" && (
                      <motion.div
                        variants={itemVariants}
                        className="border-t pt-4 mt-4 space-y-3 border-gray-200"
                      >
                        <button
                          onClick={() => {
                            navigate("/signup");
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 text-gray-600 hover:text-blue-600 rounded-xl transition-all duration-200 font-medium flex items-center bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200"
                        >
                          Sign up
                        </button>
                        <button
                          onClick={() => {
                            navigate("/login");
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full text-left text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center bg-blue-600 hover:bg-blue-700"
                        >
                          Login
                        </button>
                      </motion.div>
                    )
                  )}
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}