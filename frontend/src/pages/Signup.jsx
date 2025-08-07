import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();
  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/signup", {
        name,
        email,
        password,
      });

      if (res.status === 200) {
        setName("");
        setEmail("");
        setPassword("");
        console.log("Signup successful");
        setMsg("Signup successful ✅ Please login now.");
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      }
    } catch (err) {
      console.error(err);
      setMsg("Signup failed ❌");
      setName("");
      setEmail("");
      setPassword("");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <form
        onSubmit={handleSignup}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-200 transition-transform hover:scale-[1.01]"
      >
        <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-900">
          📝 Sign Up
        </h2>

        {/* Full Name */}
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-4 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
          required
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
          required
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
          required
        />

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold shadow hover:bg-green-700 hover:shadow-lg transition-all duration-200 text-lg"
        >
          Create Account
        </button>

        {/* Already have an account */}
        <p className="text-center text-sm mt-5 text-gray-600">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-blue-600 hover:underline font-medium"
          >
            Login
          </a>
        </p>

        {/* Status Message */}
        {msg && (
          <p
            className={`mt-4 text-center text-sm font-medium ${
              msg.includes("successful") ? "text-green-600" : "text-red-600"
            }`}
          >
            {msg}
          </p>
        )}
      </form>
    </div>
  );
}

export default Signup;
