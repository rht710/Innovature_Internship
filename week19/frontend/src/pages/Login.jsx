import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogIn, Key, User, AlertCircle } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect target after successful login (default to dashboard)
  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    const result = await login(username, password);
    setLoading(false);

    if (result.success) {
      navigate(from, { replace: true });
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
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Welcome Back</h2>
          <p className="text-slate-500 text-sm mt-1">Sign in to your secure portal</p>
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
              placeholder="Enter your username"
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
              placeholder="Enter your password"
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
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center text-sm text-slate-500 border-t border-slate-100 pt-6">
          New here?{" "}
          <Link to="/register" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
