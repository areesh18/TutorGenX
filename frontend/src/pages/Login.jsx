import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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

  const handleLogin = async (e) => {
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
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-200 transition-transform hover:scale-[1.01]"
      >
        <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-900">
          🔐 Login
        </h2>

        {/* Email Field */}
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          required
        />

        {/* Password Field */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          required
        />

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold shadow hover:bg-blue-700 hover:shadow-lg transition-all duration-200 text-lg"
        >
          Login
        </button>

        {/* Signup Link */}
        <p className="text-center text-sm mt-5 text-gray-600">
          Don’t have an account?{" "}
          <a
            href="/signup"
            className="text-blue-600 hover:underline font-medium"
          >
            Sign Up
          </a>
        </p>

        {/* Status Message */}
        {msg && (
          <p
            className={`mt-4 text-center text-sm font-medium ${
              msg === "Login Successful" ? "text-green-600" : "text-red-600"
            }`}
          >
            {msg}
          </p>
        )}
      </form>
    </div>
  );
}

export default Login;
