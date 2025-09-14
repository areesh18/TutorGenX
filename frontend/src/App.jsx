import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import LearnPage from "./pages/LearnPage";
import Layout from "./Layout";
import Profile from "./pages/Profile";
import Courses from "./pages/Courses";
import BookSection from "./pages/BookSection";
import Ytsection from "./pages/Ytsection";
import QuizFromPDF from "./pages/QuizFromPDF";  
import Flashcards from "./pages/Flashcards";


function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/learn/:roadmapId" element={<LearnPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/booksection" element={<BookSection />} />
          <Route path="/ytsection" element={<Ytsection />} />
          <Route path="/quizfrompdf" element={<QuizFromPDF />} />
          <Route path="/flashcards" element={<Flashcards />} />
          
        </Route>
      </Routes>
    </>
  );
}

export default AppWrapper;
