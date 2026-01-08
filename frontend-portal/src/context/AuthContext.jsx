import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AuthContext = createContext();

// Create an axios instance with default config
const api = axios.create({
  // Use environment variable if available, otherwise fallback to localhost
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add token to headers if it exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      checkUserLoggedIn();
    } else {
      setLoading(false);
    }
  }, []);

  const checkUserLoggedIn = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.data);
    } catch (error) {
      console.error("Not logged in");
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });

      const { token, ...userData } = res.data;

      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // We manually construct the user object from response to update UI instantly
      setUser({ ...userData, _id: userData._id });

      toast.success("Welcome back!");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await api.post("/auth/register", { name, email, password });

      const { token, ...userData } = res.data;

      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser({ ...userData, _id: userData._id });

      toast.success("Account created successfully!");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    toast.info("Logged out");
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, loading, api }}
    >
      {children}
    </AuthContext.Provider>
  );
};
