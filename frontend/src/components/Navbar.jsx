// src/components/Navbar.jsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  UserCircleIcon, 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  HomeIcon,
  Bars3Icon,
  XMarkIcon
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

  const NavLink = ({ to, children, icon: Icon, external = false }) => {
    const baseClasses = "flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 font-medium";
    const activeClasses = "bg-blue-600 text-white";
    const inactiveClasses = "hover:bg-gray-800 hover:text-blue-400";
    
    const linkClasses = `${baseClasses} ${isActivePath(to) ? activeClasses : inactiveClasses}`;

    if (external) {
      return (
        <a href={to} className={linkClasses} target="_blank" rel="noopener noreferrer">
          {Icon && <Icon className="w-4 h-4" />}
          <span>{children}</span>
        </a>
      );
    }

    return (
      <Link to={to} className={linkClasses}>
        {Icon && <Icon className="w-4 h-4" />}
        <span>{children}</span>
      </Link>
    );
  };

  return (
    <nav className={`bg-gray-900 text-white px-4 sm:px-6 py-4 shadow-lg border-b border-gray-700 ${bgClass}`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <h1 className="text-2xl font-extrabold tracking-wide hover:scale-105 transition-transform duration-200">
            Tutor<span className="text-blue-400">GenX</span>
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Navigation Links */}
          <div className="flex items-center space-x-2">
            <NavLink to="/" icon={HomeIcon}>Home</NavLink>
            
            {isLoggedIn && (
              <NavLink to="/dashboard" icon={ChartBarIcon}>Dashboard</NavLink>
            )}
          </div>

          {/* Auth Section */}
          {isLoggedIn ? (
            <div className="relative ml-6">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 bg-gray-800 rounded-lg px-3 py-2 hover:bg-gray-700 transition-colors duration-200"
              >
                <UserCircleIcon className="w-6 h-6" />
                <span className="text-sm font-medium">
                  {user?.name || user?.email || 'User'}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-700">
                    <p className="text-sm text-gray-300">Signed in as</p>
                    <p className="text-sm font-medium truncate">{user?.email}</p>
                  </div>
                  
                  <Link
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
                  </Link>
                  
                  <hr className="border-gray-700 my-1" />
                  
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
              <div className="flex space-x-2 ml-6">
                <button
                  onClick={() => navigate("/signup")}
                  className="px-4 py-2 text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
                >
                  Sign up
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Login
                </button>
              </div>
            )
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <Bars3Icon className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-gray-700">
          <div className="flex flex-col space-y-2 pt-4">
            <NavLink to="/" icon={HomeIcon}>Home</NavLink>
            
            {isLoggedIn && (
              <NavLink to="/dashboard" icon={ChartBarIcon}>Dashboard</NavLink>
            )}

            {isLoggedIn ? (
              <>
                <div className="border-t border-gray-700 pt-2 mt-2">
                  <div className="px-3 py-2">
                    <p className="text-sm text-gray-300">Signed in as</p>
                    <p className="text-sm font-medium">{user?.email}</p>
                  </div>
                </div>
                
                <NavLink to="/profile" icon={UserCircleIcon}>Profile</NavLink>
                <NavLink to="/settings" icon={Cog6ToothIcon}>Settings</NavLink>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-left text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </>
            ) : (
              currentPath !== "/login" && (
                <div className="border-t border-gray-700 pt-2 mt-2 space-y-2">
                  <button
                    onClick={() => {
                      navigate("/signup");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-blue-400 hover:text-blue-300 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    Sign up
                  </button>
                  <button
                    onClick={() => {
                      navigate("/login");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left bg-blue-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Login
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </nav>
  );
}