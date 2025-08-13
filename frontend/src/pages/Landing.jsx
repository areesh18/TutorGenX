import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

function Landing() {
  const navigate = useNavigate();
  return (
    <>
      <div
        className="min-h-screen font-sans flex flex-col"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 15s ease infinite',
        }}
      >
        <Navbar
          bgClass={"bg-slate-800/95 backdrop-blur-md border-b border-slate-700 "}
        />
        
        <div className="flex-1 p-6 flex items-center justify-center">
          <motion.main 
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1}}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-4xl mx-auto p-8 rounded-3xl border border-slate-700/50 transition-transform hover:scale-[1.01] relative"
            style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 50%, rgba(15, 23, 42, 0.95) 100%)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
            whileHover={{ y: -5 }}
          >
            {/* Animated diagonal lines */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
              <motion.div
                className="absolute top-0 left-0 w-full h-full"
                style={{
                  background: 'linear-gradient(45deg, transparent 30%, rgba(59, 130, 246, 0.1) 50%, transparent 70%)',
                }}
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                  repeatDelay: 2,
                }}
              />
              <motion.div
                className="absolute top-0 left-0 w-full h-full"
                style={{
                  background: 'linear-gradient(-45deg, transparent 30%, rgba(139, 92, 246, 0.1) 50%, transparent 70%)',
                }}
                animate={{
                  x: ['100%', '-100%'],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                  repeatDelay: 1.5,
                  delay: 1,
                }}
              />
            </div>

            {/* Title */}
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-3xl md:text-4xl font-extrabold mb-5 leading-tight bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent"
            >
              Build Your Career Roadmap with{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                AI
              </span>
              🧠
            </motion.h2>

            {/* Subtitle */}
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-slate-300 leading-relaxed text-base md:text-lg mb-8 max-w-2xl mx-auto"
            >
              Just tell us your goal — and we'll create a{" "}
              <span className="font-semibold text-blue-400">
                step-by-step weekly plan
              </span>{" "}
              tailored just for you.
            </motion.p>

            {/* Floating Elements */}
            <motion.div 
              className="absolute -top-4 -left-4 w-20 h-20 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full blur-xl"
              animate={{ 
                y: [-10, 10, -10],
                x: [-5, 5, -5],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
            <motion.div 
              className="absolute -bottom-6 -right-6 w-16 h-16 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-xl"
              animate={{ 
                y: [10, -10, 10],
                x: [5, -5, 5],
                opacity: [0.4, 0.7, 0.4]
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 1
              }}
            />

            {/* Button */}
            <motion.button
              onClick={() => navigate("/dashboard")}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-full text-base font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 mx-auto group relative overflow-hidden"
              whileHover={{ 
                scale: 1.05, 
                y: -2,
                boxShadow: "0 15px 30px -10px rgba(59, 130, 246, 0.4)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <span>🚀</span>
              <span>Start Learning</span>
            </motion.button>

            {/* Decorative Elements */}
            <motion.div 
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.1, scale: 1 }}
              transition={{ delay: 1.2, duration: 1 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-slate-600/30 rounded-full pointer-events-none"
              style={{
                background: 'conic-gradient(from 0deg, transparent, rgba(59, 130, 246, 0.1), transparent)',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />

            {/* Particle Effects */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${10 + Math.random() * 80}%`,
                }}
                animate={{
                  y: [-20, 20, -20],
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.main>
        </div>

        {/* Additional Info Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 px-6 pb-12"
        >
          {[
            { icon: "🎯", title: "Personalized", desc: "AI-crafted plans just for you" },
            { icon: "⚡", title: "Fast & Easy", desc: "Get started in seconds" },
            { icon: "📈", title: "Track Progress", desc: "Monitor your learning journey" }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 1.2 + i * 0.2, duration: 0.6 }}
              className="p-6 rounded-2xl border border-slate-700/50 text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)',
                backdropFilter: 'blur(20px)',
              }}
              whileHover={{ 
                y: -10, 
                scale: 1.05,
                boxShadow: "0 15px 30px -10px rgba(0, 0, 0, 0.3)"
              }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 1.4 + i * 0.2, duration: 0.5, type: "spring" }}
                className="text-3xl mb-3"
              >
                {item.icon}
              </motion.div>
              <motion.h3 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 + i * 0.2 }}
                className="text-white font-semibold mb-2"
              >
                {item.title}
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6 + i * 0.2 }}
                className="text-slate-400 text-sm"
              >
                {item.desc}
              </motion.p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
        }
      `}</style>
    </>
  );
}

export default Landing;