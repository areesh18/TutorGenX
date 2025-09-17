"use client"

import { NavLink, Outlet } from "react-router-dom"
import { useState } from "react"
import MyChatbot from "./components/Chatbot"; // Import the chatbot
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
          "px-3 py-2.5 rounded-md transition-colors",
          isActive ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
        ].join(" ")
      }
    >
      <span className="w-5 h-5 text-gray-500 shrink-0 [&>svg]:w-5 [&>svg]:h-5">{children}</span>

      <span className={`${collapsed ? "flex lg:hidden" : "flex"} flex-col min-w-0`}>
        <span className="font-medium leading-5 text-pretty">{label}</span>
        {sublabel ? <span className="text-xs text-gray-500 leading-4">{sublabel}</span> : null}
      </span>

      {collapsed && (
        <span className="hidden lg:block absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          {label}
        </span>
      )}
    </NavLink>
  )
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [chatbotOpen, setChatbotOpen] = useState(false); // State for chatbot visibility

  const toggleSidebar = () => setSidebarOpen((s) => !s)
  const toggleCollapse = () => setSidebarCollapsed((c) => !c)

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          "bg-white border-r border-gray-200 text-gray-900 flex flex-col transition-all duration-300 ease-in-out",
          "fixed lg:static inset-y-0 left-0 z-30 transform",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
          sidebarCollapsed ? "lg:w-16" : "lg:w-72",
          "w-72",
          "h-full",
        ].join(" ")}
      >
        {/* Brand / Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-indigo-600 text-white grid place-items-center">
              {/* book icon */}
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <path
                  d="M5 5.5A2.5 2.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V19a0 0 0 0 1 0 0H7.5A2.5 2.5 0 0 1 5 16.5v-11Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path d="M5 6h12.5A1.5 1.5 0 0 1 19 7.5V20" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-base font-semibold tracking-tight">TutorGenX</h1>
                <p className="text-xs text-gray-500">Smart Learning Platform</p>
              </div>
            )}
          </div>

          {/* Desktop collapse */}
          <button
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={toggleCollapse}
            className="hidden lg:inline-flex p-2 rounded-md border hover:bg-gray-100 text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/70"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className={`w-5 h-5 transition-transform ${sidebarCollapsed ? "rotate-180" : ""}`}
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
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 text-gray-500"
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
        <nav className="flex-1 px-3 py-4 overflow-y-auto overflow-x-hidden">
          <div className="space-y-6">
            <div>
              {!sidebarCollapsed && (
                <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Navigation</h3>
              )}
              <div className="space-y-1 group">
                <Item
                  to="/dashboard"
                  label="Dashboard"
                  sublabel="Learning overview"
                  titleWhenCollapsed="Dashboard"
                  collapsed={sidebarCollapsed}
                >
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 12l7-7 4 4 7-7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Item>
                <Item
                  to="/courses"
                  label="Courses"
                  sublabel="Browse courses"
                  titleWhenCollapsed="Courses"
                  collapsed={sidebarCollapsed}
                >
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </Item>
                {/* <Item
                  to="/ytsection"
                  label="Videos"
                  sublabel="YouTube resources"
                  titleWhenCollapsed="Videos"
                  collapsed={sidebarCollapsed}
                >
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M10 9l5 3-5 3V9z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                    <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </Item> */}
                <Item
                  to="/booksection"
                  label="Books"
                  sublabel="Reading library"
                  titleWhenCollapsed="Books"
                  collapsed={sidebarCollapsed}
                >
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M6 4h10a2 2 0 012 2v14H6a2 2 0 01-2-2V6a2 2 0 012-2z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path d="M6 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </Item>
                <Item
                  to="/quizfrompdf"
                  label="Create Quiz"
                  sublabel="AI-assisted creation"
                  titleWhenCollapsed="Create"
                  collapsed={sidebarCollapsed}
                >
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 4v16M20 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </Item>
                <Item
                  to="/flashcards"
                  label="Create Flashcards"
                  sublabel="AI-assisted creation"
                  titleWhenCollapsed="Create"
                  collapsed={sidebarCollapsed}
                >
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 4v16M20 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </Item>
                <Item
                  to="/create-course"
                  label="Create Course"
                  sublabel="AI-assisted creation"
                  titleWhenCollapsed="Create"
                  collapsed={sidebarCollapsed}
                >
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 4v16M20 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </Item>
              </div>
            </div>
            
          </div>
        </nav>

        {/* Profile */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <Item
            to="/profile"
            label="Profile"
            sublabel="Progress & settings"
            titleWhenCollapsed="Profile"
            collapsed={sidebarCollapsed}
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M6 4h10a2 2 0 012 2v14H6a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" />
              <path d="M6 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </Item>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col h-full relative">
        {/* Mobile top bar */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <button
            onClick={toggleSidebar}
            aria-label="Open sidebar"
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <h2 className="text-base font-semibold">TutorGenX</h2>
          <div className="w-10 flex justify-end">
            <div className="w-8 h-8 rounded-md bg-indigo-600 text-white grid place-items-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <path d="M6 4h10a2 2 0 012 2v14H6a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div
            className={`mx-auto w-full min-w-0 ${
              sidebarCollapsed
                ? "max-w-[100rem] 2xl:max-w-[110rem]"
                : "max-w-[90rem] xl:max-w-[96rem]"
            }`}
          >
            <Outlet />
          </div>
        </main>
        
        {/* Chatbot Area */}
        <div className="absolute bottom-6 right-6 z-40">
            <AnimatePresence>
                {chatbotOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <MyChatbot />
                    </motion.div>
                )}
            </AnimatePresence>
            <motion.button
                onClick={() => setChatbotOpen(!chatbotOpen)}
                className="w-16 h-16 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label={chatbotOpen ? "Close chat" : "Open chat"}
            >
                {chatbotOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                )}
            </motion.button>
        </div>
      </div>
    </div>
  )
}