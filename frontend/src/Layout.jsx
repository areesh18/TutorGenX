// Layout.jsx
import { NavLink, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col p-4 space-y-4 border-r border-slate-700">
        <h2 className="text-xl font-bold mb-6">TutorGenX</h2>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `px-3 py-2 rounded-lg transition ${
              isActive ? "bg-blue-600" : "hover:bg-slate-700"
            }`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `px-3 py-2 rounded-lg transition ${
              isActive ? "bg-blue-600" : "hover:bg-slate-700"
            }`
          }
        >
          Dashboard
        </NavLink>
        {/* <NavLink
          to="/profile"
          className={({ isActive }) =>
            `px-3 py-2 rounded-lg transition ${
              isActive ? "bg-blue-600" : "hover:bg-slate-700"
            }`
          }
        >
          Profile
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `px-3 py-2 rounded-lg transition ${
              isActive ? "bg-blue-600" : "hover:bg-slate-700"
            }`
          }
        >
          Settings
        </NavLink> */}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-slate-800 ">
        <Outlet /> {/* This is where each page loads */}
      </div>
    </div>
  );
}
