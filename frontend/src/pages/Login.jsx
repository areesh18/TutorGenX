import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  /* const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/login", {
        email,
        password,
      });
      const token = res.data.token;
      console.log("Received token:", token);
      localStorage.setItem("token", token);
      setMsg("Login Successful");
      setEmail("");
      setPassword("");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1100);
    } catch (err) {
      console.error(err);
      setMsg("Login failed");
      setEmail("");
      setPassword("");
    }
  }; */

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/login", {
        email,
        password,
      });

      const token = res.data.token;
      const userName = res.data.name; // "Arees" from  API response

      console.log("Received token:", token);
      console.log("User name:", userName);

      // Store token
      localStorage.setItem("token", token);

      // Store user data
      localStorage.setItem(
        "user",
        JSON.stringify({
          name: userName, // "Arees" from API
          email: email, // email from form input
        })
      );

      setMsg("Login Successful");
      setEmail("");
      setPassword("");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1100);
    } catch (err) {
      console.error(err);
      setMsg("Login failed");
      setEmail("");
      setPassword("");
    }
  };
  return (
    <div
      className="min-h-screen font-sans flex flex-col items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%)",
        backgroundSize: "400% 400%",
        animation: "gradientShift 15s ease infinite",
      }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            y: [20, -20, 20],
            x: [10, -10, 10],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      <motion.form
        onSubmit={handleLogin}
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-full max-w-md p-8 rounded-3xl border border-slate-700/50 transition-transform hover:scale-[1.01]"
        style={{
          background:
            "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 50%, rgba(15, 23, 42, 0.95) 100%)",
          backdropFilter: "blur(20px)",
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        }}
        whileHover={{ y: -5 }}
      >
        {/* Animated diagonal lines */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-0 left-0 w-full h-full"
            style={{
              background:
                "linear-gradient(45deg, transparent 30%, rgba(59, 130, 246, 0.1) 50%, transparent 70%)",
            }}
            animate={{
              x: ["-100%", "100%"],
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
              background:
                "linear-gradient(-45deg, transparent 30%, rgba(139, 92, 246, 0.1) 50%, transparent 70%)",
            }}
            animate={{
              x: ["100%", "-100%"],
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

        {/* Header */}
        <div className="text-center mb-8 relative z-10">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg"
          >
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </motion.div>
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent"
          >
            Login
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-slate-400 text-sm"
          >
            Welcome back to TutorGenX
          </motion.p>
        </div>

        {/* Floating Elements */}
        <motion.div
          className="absolute -top-4 -left-4 w-20 h-20 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full blur-xl"
          animate={{
            y: [-10, 10, -10],
            x: [-5, 5, -5],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-6 -right-6 w-16 h-16 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-xl"
          animate={{
            y: [10, -10, 10],
            x: [5, -5, 5],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />

        {/* Email Field */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mb-4 relative z-10"
        >
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
            required
          />
        </motion.div>

        {/* Password Field */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mb-6 relative z-10"
        >
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
            required
          />
        </motion.div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 mx-auto group relative overflow-hidden z-10"
          whileHover={{
            scale: 1.02,
            y: -2,
            boxShadow: "0 15px 30px -10px rgba(59, 130, 246, 0.4)",
          }}
          whileTap={{ scale: 0.98 }}
        >
          <span>🔐</span>
          <span>Login</span>
        </motion.button>

        {/* Signup Link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center text-sm mt-6 text-slate-400 relative z-10"
        >
          Don't have an account?{" "}
          <a
            href="/signup"
            className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition-colors duration-200"
          >
            Sign Up
          </a>
        </motion.p>

        {/* Status Message */}
        {msg && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 p-3 rounded-lg text-center text-sm font-medium relative z-10"
          >
            <p
              className={`${
                msg === "Login Successful"
                  ? "text-green-400 bg-green-500/10 border border-green-500/20"
                  : "text-red-400 bg-red-500/10 border border-red-500/20"
              } p-3 rounded-lg backdrop-blur-sm`}
            >
              {msg}
            </p>
          </motion.div>
        )}

        {/* Decorative Elements */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-slate-600/30 rounded-full pointer-events-none"
          style={{
            background:
              "conic-gradient(from 0deg, transparent, rgba(59, 130, 246, 0.1), transparent)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        {/* Particle Effects */}
        {[...Array(4)].map((_, i) => (
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
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.form>

      <style jsx>{`
        @keyframes gradientShift {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </div>
  );
}

export default Login;
