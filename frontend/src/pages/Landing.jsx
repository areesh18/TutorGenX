import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-8 flex items-center justify-center">
      <main className="text-center max-w-3xl mx-auto bg-white rounded-3xl shadow-lg p-10 border border-gray-200 transition-transform hover:scale-[1.01]">
        {/* Title */}
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
          Build Your Career Roadmap with AI 🧠
        </h2>

        {/* Subtitle */}
        <p className="text-gray-600 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
          Just tell us your goal — and we’ll create a{" "}
          <span className="font-semibold text-blue-600">
            step-by-step weekly plan
          </span>
          {" "}tailored just for you.
        </p>

        {/* Button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow hover:bg-blue-700 hover:shadow-lg transition-all duration-200"
        >
          🚀 Get Started
        </button>
      </main>
    </div>
  );
}

export default Landing;