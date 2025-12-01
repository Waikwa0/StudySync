import React, { useState } from "react";
import { FaSyncAlt } from "react-icons/fa";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#062241] via-[#0a3a5d] to-[#2b3b73] px-6">
      <div className="w-full max-w-md">
        {/* Brand row */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#0f4ea8] flex items-center justify-center shadow-md">
              <FaSyncAlt className="text-white text-xl" />
            </div>
            <span className="text-white tracking-wider font-semibold text-lg">
              STUDYSYNC
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/6 backdrop-blur-md rounded-2xl p-8 shadow-lg">
          <h2 className="text-center text-white text-2xl font-medium mb-6">Login</h2>

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm text-white/80 mb-2">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@usiu.ac.ke"
                required
                className="w-full px-4 py-2 rounded-full bg-transparent border border-white/30 placeholder-white/40 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>

            <div>
              <label className="block text-sm text-white/80 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full px-4 py-2 rounded-full bg-transparent border border-white/30 placeholder-white/40 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>

            {error && <p className="text-red-400 text-center">{error}</p>}

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className={`px-5 py-2 rounded-full bg-[#0f4ea8] text-white font-medium shadow-sm hover:bg-[#0b3d8a] transition ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
