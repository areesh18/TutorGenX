import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Landing() {
  const navigate = useNavigate();
  return (
    <>
      <div
        className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-blue-50
 flex flex-col gap-[10vh]"
      >
        <Navbar
          bgClass={"bg-transparent backdrop-blur-md border-b border-white/20 "}
        />
        <div className="  p-8 flex items-center justify-center">
          <main className="text-center max-w-3xl mx-auto bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl shadow-gray-300/50 p-10 border border-gray-200 transition-transform hover:scale-[1.01]">
            {/* Title */}
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
              Build Your Career Roadmap with{" "}
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                AI
              </span>
              🧠
            </h2>

            {/* Subtitle */}
            <p className="text-gray-500 leading-relaxed text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              Just tell us your goal — and we’ll create a{" "}
              <span className="font-semibold text-blue-600">
                step-by-step weekly plan
              </span>{" "}
              tailored just for you.
            </p>

            {/* Button */}
            <button
              onClick={() => navigate("/dashboard")}
              className=" bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 text-white px-8 py-4 rounded-full text-lg font-semibold   transition-all duration-200 hover:-translate-y-0.5"
            >
              🚀 Start Learning
            </button>
          </main>
        </div>
      </div>
    </>
  );
}

export default Landing;
