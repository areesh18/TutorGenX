import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import Navbar from "./components/Navbar";
import LearnPage from "./pages/LearnPage";

function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

function App() {
  const location = useLocation();

  const getBgColor = () => {
    switch (location.pathname) {
      case "/":
        return "bg-transparent";
      /* case "/signup":
        return "bg-green-500";
      case "/login":
        return "bg-purple-500";
      case "/dashboard":
        return "bg-yellow-500"; */
      default:
        return "bg-gray-800";
    }
  };
  const showNavbar = !(
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/signup" 
  );
  return (
    <>
      {showNavbar && <Navbar bgClass={getBgColor()} />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Landing />} />
        <Route path="/learn/:roadmapId" element={<LearnPage />} />
      </Routes>
    </>
  );
}

export default AppWrapper;
