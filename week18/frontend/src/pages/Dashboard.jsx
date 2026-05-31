import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance";
import { User, Mail, Shield, ShoppingBag, Calendar, Lock, ArrowRight } from "lucide-react";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [loadingCart, setLoadingCart] = useState(true);

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        setLoadingCart(true);
        // Call the authenticated cart endpoint to verify the JWT token works!
        const response = await axiosInstance.get("/carts/");
        // Carts usually return a list, let's extract quantity of items
        const cartList = response.data;
        if (cartList && cartList.length > 0) {
          const itemsCount = cartList[0].items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
          setCartItemsCount(itemsCount);
        } else {
          setCartItemsCount(0);
        }
      } catch (error) {
        console.error("Error fetching cart for dashboard:", error);
      } finally {
        setLoadingCart(false);
      }
    };

    fetchCartData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-in">
      
      {/* Welcome Section */}
      <div className="bg-gradient-to-r bg-indigo-600 text-white rounded-3xl p-8 md:p-12 shadow-xl mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <span className="bg-indigo-500/50 text-indigo-100 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
            Secure Session Active
          </span>
          <h1 className="text-4xl md:text-5xl font-black mt-3 tracking-tight">
            Hello, {user?.username || "Valued Member"}!
          </h1>
          <p className="text-indigo-100 text-lg mt-2 max-w-xl">
            Welcome to your account control panel. Your session is protected using industry-standard JWT encryption.
          </p>
        </div>
        <div className="relative z-10 flex-shrink-0">
          <button
            onClick={logout}
            className="px-6 py-3 bg-white text-indigo-600 hover:bg-slate-50 font-bold rounded-xl transition-all shadow-md flex items-center gap-2 hover:-translate-y-0.5"
          >
            Logout Securely
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        {/* Subtle decorative background circles */}
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-white/5 rounded-full translate-x-20 translate-y-20 blur-2xl"></div>
        <div className="absolute left-1/3 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-20 blur-2xl"></div>
      </div>

      {/* Grid Content */}
      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Profile Card */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-md p-8 flex flex-col gap-6">
          <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4">
            Security & Profile Details
          </h2>

          <div className="grid sm:grid-cols-2 gap-6">
            
            {/* Username */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Username</span>
                <span className="font-semibold text-slate-700">{user?.username}</span>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Email Address</span>
                <span className="font-semibold text-slate-700">{user?.email || "No email linked"}</span>
              </div>
            </div>

            {/* User ID */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Account ID</span>
                <span className="font-semibold text-slate-700">#{user?.id || user?.user_id || "N/A"}</span>
              </div>
            </div>

            {/* Security Type */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Encryption Mode</span>
                <span className="font-semibold text-indigo-600 flex items-center gap-1">
                  HS256 JWT
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats / Cart Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-8 flex flex-col gap-6">
          <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4">
            Shopping Cart Status
          </h2>

          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-16 h-16 bg-indigo-55 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-4 shadow-indigo-100">
              <ShoppingBag className="w-8 h-8" />
            </div>

            {loadingCart ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-slate-400">Loading secure cart...</span>
              </div>
            ) : (
              <div>
                <span className="text-4xl font-extrabold text-slate-800">{cartItemsCount}</span>
                <p className="text-sm text-slate-500 mt-1">Items currently in your cart</p>
              </div>
            )}
          </div>

          <div className="mt-auto border-t border-slate-100 pt-6 flex items-center gap-3 text-xs text-slate-400">
            <Calendar className="w-4 h-4" />
            <span>Session renewed: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
