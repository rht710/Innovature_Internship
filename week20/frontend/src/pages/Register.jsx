import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserPlus, User, Mail, Key, AlertCircle } from "lucide-react";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    const result = await register(username, email, password);
    setLoading(false);

    if (result.success) {
      navigate("/dashboard", { replace: true });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 bg-slate-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-slate-100 animate-in">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-3 shadow-indigo-100">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Create Account</h2>
          <p className="text-slate-500 text-sm mt-1">Get started with your free catalog profile</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-500 p-4 rounded-xl flex items-start gap-3 mb-6 animate-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="text-sm font-medium leading-relaxed">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {/* Username Input */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-400" />
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-300 focus:outline-none transition-all bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-800"
              disabled={loading}
              required
            />
          </div>

          {/* Email Input */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-slate-400" />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-300 focus:outline-none transition-all bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-800"
              disabled={loading}
              required
            />
          </div>

          {/* Password Input */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-1.5">
              <Key className="w-4 h-4 text-slate-400" />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-300 focus:outline-none transition-all bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-800"
              disabled={loading}
              required
            />
          </div>

          {/* Confirm Password Input */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-1.5">
              <Key className="w-4 h-4 text-slate-400" />
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-300 focus:outline-none transition-all bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-800"
              disabled={loading}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center text-sm text-slate-500 border-t border-slate-100 pt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
