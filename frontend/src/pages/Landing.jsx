import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <main className="text-center max-w-3xl mx-auto">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-6">
          Build Your Career Roadmap with AI 🧠
        </h2>
        <p className="text-gray-600 text-lg mb-8">
          Just tell us your goal — we'll generate a step-by-step weekly plan
          tailored just for you.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-blue-600 text-white px-6 py-3 rounded-full text-lg hover:bg-blue-700 transition"
        >
          Get Started
        </button>
      </main>
    </div>
  );
}

export default Landing;
