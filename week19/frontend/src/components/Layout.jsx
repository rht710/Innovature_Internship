import { Link, Outlet, useLocation } from "react-router-dom";
import { ShoppingBag, Home, Info, Globe, User, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navLinks = [
    { path: "/", label: "Products", icon: <Home className="w-5 h-5" /> },
    { path: "/about", label: "About", icon: <Info className="w-5 h-5" /> },
  ];

  if (user) {
    navLinks.push({ path: "/dashboard", label: "Dashboard", icon: <User className="w-5 h-5" /> });
    navLinks.push({ path: "/admin", label: "Admin", icon: <Shield className="w-5 h-5" /> });
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-indigo-600 font-bold text-xl hover:opacity-90 transition-opacity">
            <ShoppingBag className="w-8 h-8 text-indigo-600" />
            <span>ShopHub</span>
          </Link>

          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-1 sm:gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === link.path
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {link.icon}
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="hidden md:inline text-sm font-semibold text-slate-600">
                    Hi, {user.username}
                  </span>
                  <button
                    onClick={logout}
                    className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-semibold transition-all"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3 py-2 text-slate-600 hover:text-slate-900 rounded-lg text-sm font-medium transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link to="/" className="flex items-center gap-2 text-slate-900 font-bold text-xl">
              <ShoppingBag className="w-6 h-6 text-indigo-600" />
              <span>ShopHub</span>
            </Link>
            <p className="text-slate-500 text-sm max-w-xs text-center md:text-left">
              A premium full-stack integrated React & Django e-commerce platform catalog.
            </p>
          </div>

          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-slate-600 transition-colors">
              <Globe className="w-6 h-6" />
            </a>
          </div>
          
          <p className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} ShopHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

