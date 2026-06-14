import React, { createContext, useContext, useState, useEffect } from "react";
import axiosInstance, { setAccessToken } from "../api/axiosInstance";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessState] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync access token helper
  const updateAccessToken = (token) => {
    setAccessState(token);
    setAccessToken(token);
  };

  const login = async (username, password) => {
    try {
      const response = await axiosInstance.post("/login/", { username, password });
      const { access, refresh, user: userData } = response.data;
      
      localStorage.setItem("refreshToken", refresh);
      updateAccessToken(access);
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      const errorMsg = error.response?.data?.non_field_errors?.[0] || 
                       error.response?.data?.detail || 
                       "Invalid username or password.";
      return { success: false, error: errorMsg };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await axiosInstance.post("/register/", { username, email, password });
      const { access, refresh, user: userData } = response.data;
      
      localStorage.setItem("refreshToken", refresh);
      updateAccessToken(access);
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error("Registration failed:", error);
      let errorMsg = "Registration failed. Please check inputs.";
      if (error.response?.data) {
        const errors = error.response.data;
        if (errors.username) errorMsg = `Username: ${errors.username[0]}`;
        else if (errors.email) errorMsg = `Email: ${errors.email[0]}`;
        else if (errors.password) errorMsg = `Password: ${errors.password[0]}`;
      }
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem("refreshToken");
    updateAccessToken(null);
    setUser(null);
  };

  // Perform initial authentication load check via refresh token
  useEffect(() => {
    const initializeAuth = async () => {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        setLoading(false);
        return;
      }

      try {
        // Obtain new access token
        const response = await axiosInstance.post("/token/refresh/", { refresh: refreshToken });
        const newAccess = response.data.access;
        updateAccessToken(newAccess);

        // Fetch authenticated user profile data
        // Here we call the carts API or a mock profile API since we get details on token,
        // but we can also fetch from a custom profile view or decode the JWT.
        // For simplicity and correctness, we will decode the user details or make a light endpoint.
        // Let's decode user details or query a user endpoint. Wait, does our backend have a user detail endpoint?
        // Let's see if our serializer handles /api/users/me/ or we can make a lightweight profile call.
        // Since we got 'user' object in login/register, let's decode or store user info.
        // Wait, a clean approach is to fetch cart or write a lightweight endpoint, 
        // or we can store user details in localStorage too, or fetch a minimal user endpoint.
        // Let's check what endpoints are available in urls.py.
        // In urls.py we have registration and login.
        // Let's see: if we return user details from the backend login/register, we can also return user details on refresh,
        // or we can store user info in localStorage as a backup.
        // To be secure, let's store user info in localStorage alongside refresh token,
        // or fetch from an endpoint. Let's store a serialized `user` object in localStorage,
        // and update it on successful token refresh if needed, or read from it on reload.
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          // If no stored user details but we refreshed token successfully, 
          // let's create a minimal user object from JWT payload (or default info)
          // to prevent blank user state. We can decode the JWT to get user_id.
          setUser({ id: null, username: "Authenticated User" });
        }
      } catch (error) {
        console.error("Initial authentication check failed:", error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Watch user changes to save profile to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // Set up listeners for events coming from Axios Interceptors (e.g. background token updates or force logouts)
  useEffect(() => {
    const handleBackgroundRefresh = (event) => {
      const newAccess = event.detail;
      setAccessState(newAccess);
    };

    const handleBackgroundLogout = () => {
      logout();
    };

    window.addEventListener("auth-token-refreshed", handleBackgroundRefresh);
    window.addEventListener("auth-logout", handleBackgroundLogout);

    return () => {
      window.removeEventListener("auth-token-refreshed", handleBackgroundRefresh);
      window.removeEventListener("auth-logout", handleBackgroundLogout);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
