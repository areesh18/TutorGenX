// Layout.jsx
import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleCollapse = () => setSidebarCollapsed(!sidebarCollapsed);

  return (
    <div className="flex min-h-screen bg-gray-900 overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        bg-gray-800 text-white flex flex-col border-r border-gray-700 transition-all duration-300 ease-in-out
        fixed lg:static inset-y-0 left-0 z-30 transform 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0
        ${sidebarCollapsed && 'lg:w-16'}
        ${!sidebarCollapsed && 'lg:w-64'}
        w-64 h-screen flex-shrink-0
      `}>
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.84L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.84l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
              </svg>
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-white">AI LMS</h1>
                <p className="text-sm text-gray-400">Smart Learning Platform</p>
              </div>
            )}
          </div>
          
          {/* Desktop Collapse Toggle */}
          <button
            onClick={toggleCollapse}
            className="hidden lg:block p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg className={`w-5 h-5 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4 py-6 overflow-y-auto min-h-0">
          <div className="space-y-6">
            {/* Main Navigation */}
            <div>
              {!sidebarCollapsed && (
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Navigation
                </h3>
              )}
              <div className="space-y-1">
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2.5 rounded-lg transition-colors relative group ${
                      isActive 
                        ? "bg-amber-100 text-amber-900" 
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`
                  }
                  title={sidebarCollapsed ? "Dashboard" : ""}
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  {!sidebarCollapsed && (
                    <div>
                      <div className="font-medium">Dashboard</div>
                      <div className="text-xs text-gray-500">Learning overview</div>
                    </div>
                  )}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      Dashboard
                    </div>
                  )}
                </NavLink>

                <NavLink
                  to="/courses"
                  className={({ isActive }) =>
                    `flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2.5 rounded-lg transition-colors relative group ${
                      isActive 
                        ? "bg-amber-100 text-amber-900" 
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`
                  }
                  title={sidebarCollapsed ? "Courses" : ""}
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  {!sidebarCollapsed && (
                    <div>
                      <div className="font-medium">Courses</div>
                      <div className="text-xs text-gray-500">Browse courses</div>
                    </div>
                  )}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      Courses
                    </div>
                  )}
                </NavLink>

                <NavLink
                  to="/my-learning"
                  className={({ isActive }) =>
                    `flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2.5 rounded-lg transition-colors relative group ${
                      isActive 
                        ? "bg-amber-100 text-amber-900" 
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`
                  }
                  title={sidebarCollapsed ? "My Learning" : ""}
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  {!sidebarCollapsed && (
                    <div>
                      <div className="font-medium">My Learning</div>
                      <div className="text-xs text-gray-500">Your enrolled courses</div>
                    </div>
                  )}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      My Learning
                    </div>
                  )}
                </NavLink>

                <NavLink
                  to="/create-course"
                  className={({ isActive }) =>
                    `flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2.5 rounded-lg transition-colors relative group ${
                      isActive 
                        ? "bg-amber-100 text-amber-900" 
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`
                  }
                  title={sidebarCollapsed ? "Create Course" : ""}
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {!sidebarCollapsed && (
                    <div>
                      <div className="font-medium">Create Course</div>
                      <div className="text-xs text-gray-500">AI-assisted creation</div>
                    </div>
                  )}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      Create Course
                    </div>
                  )}
                </NavLink>
              </div>
            </div>

            {/* AI Features */}
            <div>
              {!sidebarCollapsed && (
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  AI Features
                </h3>
              )}
              <div className="space-y-1">
                <NavLink
                  to="/smart-learning"
                  className={({ isActive }) =>
                    `flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2.5 rounded-lg transition-colors relative group ${
                      isActive 
                        ? "bg-amber-100 text-amber-900" 
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`
                  }
                  title={sidebarCollapsed ? "Smart Learning" : ""}
                >
                  <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  {!sidebarCollapsed && (
                    <div>
                      <div className="font-medium">Smart Learning</div>
                      <div className="text-xs text-gray-500">AI personalizes your experience</div>
                    </div>
                  )}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      Smart Learning
                    </div>
                  )}
                </NavLink>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="p-4 border-t border-gray-700 flex-shrink-0">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2.5 rounded-lg transition-colors relative group ${
                isActive 
                  ? "bg-amber-100 text-amber-900" 
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`
            }
            title={sidebarCollapsed ? "Profile" : ""}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {!sidebarCollapsed && (
              <div>
                <div className="font-medium">Profile</div>
                <div className="text-xs text-gray-500">View progress & settings</div>
              </div>
            )}
            {sidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                Profile
              </div>
            )}
          </NavLink>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-900 flex flex-col h-screen overflow-hidden">
        {/* Top Bar for Mobile */}
        <div className="lg:hidden bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-white">AI LMS</h1>
          <div className="w-10 flex justify-end">
            <div className="w-8 h-8 bg-amber-700 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.84L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.84l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
              </svg>
            </div>
          </div>
        </div>
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}