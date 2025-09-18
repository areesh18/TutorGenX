"use client"

import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion";

function Item({
  to,
  label,
  sublabel,
  titleWhenCollapsed,
  collapsed,
  children, // icon
}) {
  return (
    <NavLink
      to={to}
      title={collapsed ? titleWhenCollapsed || label : ""}
      className={({ isActive }) =>
        [
          "group relative flex items-center w-full",
          collapsed ? "lg:justify-center lg:gap-0" : "gap-3",
          "px-3 py-2.5 rounded-lg transition-all duration-200 ease-out",
          isActive 
            ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-100 shadow-sm" 
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm border border-transparent",
        ].join(" ")
      }
    >
      <span className={`w-5 h-5 shrink-0 transition-colors duration-200 [&>svg]:w-5 [&>svg]:h-5 ${
        collapsed ? "text-gray-500 group-hover:text-blue-600" : "text-gray-400 group-hover:text-blue-600"
      }`}>
        {children}
      </span>

      <span className={`${collapsed ? "flex lg:hidden" : "flex"} flex-col min-w-0`}>
        <span className="font-medium leading-5 text-pretty text-sm">{label}</span>
        {sublabel ? <span className="text-xs text-gray-400 leading-4 mt-0.5">{sublabel}</span> : null}
      </span>

      {collapsed && (
        <span className="hidden lg:block absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap shadow-lg border border-gray-700 z-50">
          {label}
          <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 border-l border-b border-gray-700 rotate-45"></span>
        </span>
      )}
    </NavLink>
  )
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen((s) => !s)
  const toggleCollapse = () => setSidebarCollapsed((c) => !c)
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 text-gray-900 font-sans overflow-hidden">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            aria-label="Close sidebar"
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarCollapsed ? 64 : 288,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={[
          "bg-white/80 backdrop-blur-xl border-r border-gray-200/60 text-gray-900 flex flex-col transition-all duration-300 ease-in-out shadow-sm",
          "fixed lg:static inset-y-0 left-0 z-30 transform",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
          "w-72 lg:w-auto",
          "h-full",
        ].join(" ")}
      >
        {/* Brand / Header */}
        <div className="p-5 border-b border-gray-200/60 flex items-center justify-between flex-shrink-0 bg-white/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white grid place-items-center shadow-md">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <path
                  d="M5 5.5A2.5 2.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V19a0 0 0 0 1 0 0H7.5A2.5 2.5 0 0 1 5 16.5v-11Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path d="M5 6h12.5A1.5 1.5 0 0 1 19 7.5V20" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    TutorGenX
                  </h1>
                  <p className="text-xs text-gray-400 font-medium">Smart Learning Platform</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop collapse */}
          <button
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={toggleCollapse}
            className="hidden lg:inline-flex p-2 rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-gray-300 text-gray-500 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 transition-all duration-200"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className={`w-4 h-4 transition-transform duration-300 ${sidebarCollapsed ? "rotate-180" : ""}`}
              aria-hidden="true"
            >
              <path
                d="M15 19L8 12l7-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Mobile close */}
          <button
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path
                d="M6 18L18 6M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <div className="space-y-8">
            <div>
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1"
                  >
                    Navigation
                  </motion.h3>
                )}
              </AnimatePresence>
              <div className="space-y-1.5">
                <Item
                  to="/dashboard"
                  label="Dashboard"
                  sublabel="Learning overview"
                  titleWhenCollapsed="Dashboard"
                  collapsed={sidebarCollapsed}
                >
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Item>
                {/* <Item
                  to="/courses"
                  label="Courses"
                  sublabel="Browse courses"
                  titleWhenCollapsed="Courses"
                  collapsed={sidebarCollapsed}
                >
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Item> */}
                {/* <Item
                  to="/booksection"
                  label="Books"
                  sublabel="Reading library"
                  titleWhenCollapsed="Books"
                  collapsed={sidebarCollapsed}
                >
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Item> */}
                <Item
                  to="/quizfrompdf"
                  label="Create Quiz"
                  sublabel="AI-assisted creation"
                  titleWhenCollapsed="Create Quiz"
                  collapsed={sidebarCollapsed}
                >
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M21 12c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3 12v6c0 .552.448 1 1 1h16c.552 0 1-.448 1-1v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Item>
                <Item
                  to="/flashcards"
                  label="Create Flashcards"
                  sublabel="AI-assisted creation"
                  titleWhenCollapsed="Create Flashcards"
                  collapsed={sidebarCollapsed}
                >
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
                    <path d="M9 9h6v6H9z" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </Item>
                <Item
                  to="/create-course"
                  label="Create Course"
                  sublabel="AI-assisted creation"
                  titleWhenCollapsed="Create Course"
                  collapsed={sidebarCollapsed}
                >
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Item>
              </div>
            </div>
          </div>
        </nav>

        {/* Profile */}
        <div className="p-4 border-t border-gray-200/60 flex-shrink-0 bg-white/30">
        <button
            onClick={handleLogout}
            title={sidebarCollapsed ? "Logout" : ""}
            className={`group relative flex items-center w-full ${
              sidebarCollapsed ? "lg:justify-center lg:gap-0" : "gap-3"
            } px-3 py-2.5 rounded-lg transition-all duration-200 ease-out text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm border border-transparent mb-2`}
          >
            <span className={`w-5 h-5 shrink-0 transition-colors duration-200 [&>svg]:w-5 [&>svg]:h-5 ${
              sidebarCollapsed ? "text-gray-500 group-hover:text-red-600" : "text-gray-400 group-hover:text-red-600"
            }`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </span>
            <span className={`${sidebarCollapsed ? "flex lg:hidden" : "flex"} flex-col min-w-0`}>
              <span className="font-medium leading-5 text-pretty text-sm">Logout</span>
            </span>
            {sidebarCollapsed && (
              <span className="hidden lg:block absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap shadow-lg border border-gray-700 z-50">
                Logout
                <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 border-l border-b border-gray-700 rotate-45"></span>
              </span>
            )}
          </button>
          <Item
            to="/profile"
            label="Profile"
            sublabel="Progress & settings"
            titleWhenCollapsed="Profile"
            collapsed={sidebarCollapsed}
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
            </svg>
          </Item>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col h-full relative">
        {/* Mobile top bar */}
        <div className="lg:hidden bg-white/80 backdrop-blur-xl border-b border-gray-200/60 px-4 py-3 flex items-center justify-between flex-shrink-0 shadow-sm">
          <button
            onClick={toggleSidebar}
            aria-label="Open sidebar"
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            TutorGenX
          </h2>
          <div className="w-10 flex justify-end">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white grid place-items-center shadow-md">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <motion.div
            initial={false}
            animate={{
              maxWidth: sidebarCollapsed ? "100rem" : "90rem",
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="mx-auto w-full min-w-0 2xl:max-w-[110rem] xl:max-w-[96rem]"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}