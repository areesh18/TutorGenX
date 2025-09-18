import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { BookOpen, Zap, Brain, ChevronRight } from 'lucide-react';

const FeatureCard = ({ icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white p-6 rounded-lg border border-gray-200"
  >
    <div className="flex items-center gap-4 mb-4">
      <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
    <p className="text-gray-600">{description}</p>
  </motion.div>
);

function Landing() {
  const navigate = useNavigate();

  const handleGetStartedClick = () => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar bgClass={`bg-gray-200`} />

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center py-20 px-6"
      >
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
          The Smarter Way to Learn
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
          Your personal AI tutor for creating custom learning paths, generating quizzes, and much more.
        </p>
        <motion.button
          onClick={handleGetStartedClick}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          Get Started for Free
        </motion.button>
      </motion.section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Everything you need to succeed
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BookOpen />}
              title="Personalized Roadmaps"
              description="Create custom learning paths tailored to your goals. Our AI designs a step-by-step curriculum to guide your studies."
              delay={0.2}
            />
            <FeatureCard
              icon={<Zap />}
              title="Instant Quizzes & Flashcards"
              description="Generate quizzes and flashcards from any PDF document. Test your knowledge and reinforce your learning effortlessly."
              delay={0.4}
            />
            <FeatureCard
              icon={<Brain />}
              title="AI-Powered Assistance"
              description="Get explanations, examples, and summaries for any topic. Our AI tutor is available 24/7 to help you understand complex concepts."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">1</div>
              <p className="text-lg text-gray-700">Set Your Goal</p>
            </div>
            <ChevronRight className="hidden md:block text-gray-400" />
            <div className="flex items-center gap-4">
              <div className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">2</div>
              <p className="text-lg text-gray-700">Follow Your Path</p>
            </div>
            <ChevronRight className="hidden md:block text-gray-400" />
            <div className="flex items-center gap-4">
              <div className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">3</div>
              <p className="text-lg text-gray-700">Achieve Mastery</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-6 bg-indigo-600 text-white text-center">
        <h2 className="text-4xl font-bold mb-4">
          Ready to start learning?
        </h2>
        <p className="text-xl mb-8">
          Join TutorGenX today and unlock your full potential.
        </p>
        <motion.button
          onClick={() => navigate("/signup")}
          className="bg-white text-indigo-600 px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          Sign Up Now
        </motion.button>
      </section>
    </div>
  );
}

export default Landing;