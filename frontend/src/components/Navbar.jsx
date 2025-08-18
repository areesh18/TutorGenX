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
      : "flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 font-medium";

    const activeClasses = mobile
      ? "text-blue-400 border"
      : "bg-blue-600 text-white";

    const inactiveClasses = mobile
      ? "hover:text-blue-400 text-gray-200"
      : "hover:bg-gray-800 hover:text-blue-400";

    const mobileStyles = mobile
      ? isActivePath(to)
        ? {
            background: "rgba(59, 130, 246, 0.15)",
            border: "1px solid rgba(59, 130, 246, 0.4)",
            backdropFilter: "blur(10px)",
          }
        : {
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }
      : {};

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
      <nav
        className={`bg-gray-900 text-white px-4 sm:px-6 py-4 shadow-lg border-b border-gray-700 ${bgClass} relative z-50`}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-wide hover:scale-105 transition-transform duration-200">
              Tutor<span className="text-blue-400">GenX</span>
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
                  className="flex items-center space-x-2 bg-gray-800 rounded-lg px-3 py-2.5 hover:bg-gray-700 transition-colors duration-200 min-h-[44px]"
                >
                  <UserCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-none">
                    {user?.name || user?.email || "User"}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
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
                  <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-700">
                      <p className="text-sm text-gray-300">Signed in as</p>
                      <p className="text-sm font-medium truncate">
                        {user?.email}
                      </p>
                    </div>

                    {/* <Link
                      to="/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-gray-700 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <UserCircleIcon className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                    
                    <Link
                      to="/settings"
                      className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-gray-700 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Cog6ToothIcon className="w-4 h-4" />
                      <span>Settings</span>
                    </Link> */}

                    {/* <hr className="border-gray-700 my-1" /> */}

                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors text-red-400 hover:text-red-300"
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
                    className="px-2 sm:px-4 py-2 text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200 text-sm sm:text-base"
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
            className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center relative z-50"
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
              className="fixed inset-0 z-40 md:hidden"
              variants={backdropVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{ duration: 0.2 }}
              style={{
                background: "rgba(0, 0, 0, 0.3)",
                backdropFilter: "blur(12px)",
              }}
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
              <div
                className="rounded-2xl shadow-2xl border p-6"
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(20px) saturate(180%)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  boxShadow:
                    "0 8px 32px 0 rgba(31, 38, 135, 0.37), 0 25px 50px -12px rgba(0, 0, 0, 0.4)",
                }}
              >
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
                        className="border-t pt-4 mt-4"
                        style={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
                      >
                        <div
                          className="px-4 py-3 rounded-xl"
                          style={{
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          <p className="text-sm text-gray-300">Signed in as</p>
                          <p className="text-sm font-medium text-white">
                            {user?.email}
                          </p>
                        </div>
                      </motion.div>

                      {/* <motion.div variants={itemVariants}>
                        <NavLink to="/profile" icon={UserCircleIcon} mobile>Profile</NavLink>
                      </motion.div>
                      <motion.div variants={itemVariants}>
                        <NavLink to="/settings" icon={Cog6ToothIcon} mobile>Settings</NavLink>
                      </motion.div> */}

                      <motion.div variants={itemVariants}>
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium w-full text-red-400 hover:text-red-300"
                          style={{
                            background: "rgba(239, 68, 68, 0.1)",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            backdropFilter: "blur(10px)",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background =
                              "rgba(239, 68, 68, 0.15)";
                            e.target.style.borderColor =
                              "rgba(239, 68, 68, 0.4)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background =
                              "rgba(239, 68, 68, 0.1)";
                            e.target.style.borderColor =
                              "rgba(239, 68, 68, 0.3)";
                          }}
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
                        className="border-t pt-4 mt-4 space-y-3"
                        style={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
                      >
                        <button
                          onClick={() => {
                            navigate("/signup");
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 text-blue-400 hover:text-blue-300 rounded-xl transition-all duration-200 font-medium flex items-center"
                          style={{
                            background: "rgba(59, 130, 246, 0.1)",
                            border: "1px solid rgba(59, 130, 246, 0.3)",
                            backdropFilter: "blur(10px)",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background =
                              "rgba(59, 130, 246, 0.15)";
                            e.target.style.borderColor =
                              "rgba(59, 130, 246, 0.4)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background =
                              "rgba(59, 130, 246, 0.1)";
                            e.target.style.borderColor =
                              "rgba(59, 130, 246, 0.3)";
                          }}
                        >
                          Sign up
                        </button>
                        <button
                          onClick={() => {
                            navigate("/login");
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full text-left text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center"
                          style={{
                            background: "rgba(59, 130, 246, 0.6)",
                            border: "1px solid rgba(59, 130, 246, 0.8)",
                            backdropFilter: "blur(10px)",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background =
                              "rgba(59, 130, 246, 0.7)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background =
                              "rgba(59, 130, 246, 0.6)";
                          }}
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
