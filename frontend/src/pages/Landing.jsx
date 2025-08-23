import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 font-sans relative overflow-hidden">
      <Navbar bgClass={`bg-gray-200`}/>
      {/* Geometric Shapes - Large and Bold */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Left side shapes */}
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute -left-16 top-20 w-40 h-40 bg-cyan-200 opacity-80"
          style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
        />
        
        <motion.div
          animate={{ 
            rotate: [45, 405],
            y: [-10, 10, -10]
          }}
          transition={{ 
            rotate: { duration: 15, repeat: Infinity, ease: "linear" },
            y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute -left-12 top-80 w-32 h-32 bg-cyan-300 opacity-70 rotate-45"
        />
        
        <motion.div
          animate={{ 
            rotate: [0, -360],
            scale: [0.9, 1.1, 0.9]
          }}
          transition={{ 
            rotate: { duration: 25, repeat: Infinity, ease: "linear" },
            scale: { duration: 7, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute left-4 bottom-40 w-24 h-24 bg-yellow-300 opacity-90"
          style={{ 
            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
          }}
        />

        {/* Right side shapes */}
        <motion.div
          animate={{ 
            rotate: [0, 360],
            x: [-5, 5, -5]
          }}
          transition={{ 
            rotate: { duration: 18, repeat: Infinity, ease: "linear" },
            x: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute -right-20 top-16 w-48 h-48 bg-red-400 opacity-85 rounded-full"
        />
        
        <motion.div
          animate={{ 
            rotate: [0, 180, 360],
            y: [5, -5, 5]
          }}
          transition={{ 
            rotate: { duration: 12, repeat: Infinity, ease: "linear" },
            y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute -right-16 top-64 w-36 h-36 bg-green-400 opacity-80"
          style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
        />
        
        <motion.div
          animate={{ 
            rotate: [45, 405],
            scale: [1, 1.15, 1]
          }}
          transition={{ 
            rotate: { duration: 22, repeat: Infinity, ease: "linear" },
            scale: { duration: 9, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute -right-8 bottom-32 w-28 h-28 bg-blue-500 opacity-90 rotate-45"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block mb-8"
          >
            <span className="text-gray-600 text-lg font-medium">AI-Powered Learning Platform</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-4 leading-tight"
          >
            Learn Better with Your{" "}
            <span className="text-blue-600">AI Tutor</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl md:text-2xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Create a custom learning pathway to help you achieve your educational goals.
          </motion.p>

          {/* CTA Button */}
          <motion.button
            onClick={() => navigate("/dashboard")}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl mb-12"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="flex items-center gap-3">
              Start Learning
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </motion.button>

          {/* Popular Topics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mb-12"
          >
            <p className="text-gray-600 mb-6 text-lg">Example topics you can learn:</p>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                "Machine Learning Basics",
                "Programming Fundamentals", 
                "Study Skills"
              ].map((topic, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + index * 0.1, duration: 0.4 }}
                  className="bg-white px-6 py-3 rounded-full border border-gray-200 text-gray-700 hover:border-blue-300 hover:shadow-sm transition-all duration-300 cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                >
                  {topic}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Video Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="mb-16"
          >
            <button className="flex items-center gap-3 mx-auto text-blue-600 hover:text-blue-700 font-medium transition-colors duration-300">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
              Learn how TutorGenX works
            </button>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-24 px-6 bg-blue-600 text-white relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute top-20 right-20 w-32 h-32 border-2 border-white rounded-full"
          />
          <motion.div
            animate={{ rotate: [360, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-20 left-20 w-24 h-24 border-2 border-white"
            style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Experience AI-Powered Learning
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl mb-16 opacity-90"
          >
            With TutorGenX, you learn at your own pace through personalized, interactive education.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Personalized Learning Paths",
                description: "Our AI creates customized learning roadmaps tailored to your goals and learning style."
              },
              {
                title: "Interactive Content", 
                description: "Engage with dynamic lessons, quizzes, and examples designed to enhance understanding."
              },
              {
                title: "Progress Tracking",
                description: "Monitor your learning journey with detailed progress tracking and achievement milestones."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/15 transition-all duration-300"
                whileHover={{ y: -5 }}
              >
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="opacity-90 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.button
            onClick={() => navigate("/dashboard")}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="mt-16 bg-white text-blue-600 hover:bg-gray-50 px-12 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            Start Your Journey Today
          </motion.button>
        </div>
      </motion.section>
    </div>
  );
}

export default Landing;