// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export const AuthContext = createContext();

const STORAGE_KEY = "blogUser";

/** Normalize user object from backend */
const normalizeUser = (backendUser, token, existingUser = null) => ({
  id: backendUser.id || backendUser.userid || backendUser._id,
  username: backendUser.username,
  email: backendUser.email,
  profilePic: backendUser.profilePic || "",
  bio: backendUser.bio || existingUser?.bio || "",
  isAdmin: 
    backendUser.isAdmin ?? 
    backendUser.isadmin ?? 
    (backendUser.role === "admin" ? true : undefined) ?? 
    false,
  token,
  // Preserve originalUsername for ownership checks (posts may have old username)
  originalUsername: existingUser?.originalUsername || backendUser.username,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Load user from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Normalize the stored user to ensure isAdmin is set correctly
        // Preserve originalUsername if it exists, otherwise use current username
        const normalized = normalizeUser(parsed, parsed.token, parsed);
        console.log("[AuthContext] User loaded from localStorage:", {
          before: { isAdmin: parsed.isAdmin, isadmin: parsed.isadmin, role: parsed.role },
          after: { isAdmin: normalized.isAdmin, username: normalized.username }
        });
        setUser(normalized);

        // Apply auth header automatically
        API.defaults.headers.common["Authorization"] = `Bearer ${parsed.token}`;
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  /** Save user to localStorage */
  const saveUser = (userObj) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userObj));
    setUser(userObj);

    // Attach token to axios automatically
    API.defaults.headers.common["Authorization"] = `Bearer ${userObj.token}`;
  };

  /** Login */
  const login = async (username, password) => {
    try {
      const res = await API.post("/auth/login", { username, password });
      const { token, user: backendUser } = res.data;

      console.log("[AuthContext] Backend user received:", {
        isAdmin: backendUser.isAdmin,
        isadmin: backendUser.isadmin,
        role: backendUser.role,
        raw: backendUser
      });

      const cleanUser = normalizeUser(backendUser, token);
      console.log("[AuthContext] Normalized user:", {
        isAdmin: cleanUser.isAdmin,
        username: cleanUser.username
      });
      saveUser(cleanUser);

      navigate("/");
    } catch (err) {
      const msg = err.response?.data || "Login failed";
      throw new Error(msg);
    }
  };

  /** Register */
  const register = async (username, email, password) => {
    try {
      await API.post("/auth/register", {
        username,
        email,
        password,
        profilePic: "",
        createdAt: new Date().toISOString(),
      });

      // Auto-login after register
      await login(username, password);
    } catch (err) {
      const msg = err.response?.data || "Registration failed";
      throw new Error(msg);
    }
  };

  /** Update user (for settings) */
  const updateUser = (updatedUserData) => {
    const updatedUser = {
      ...user,
      ...updatedUserData,
      // Preserve originalUsername for ownership checks
      originalUsername: user?.originalUsername || user?.username,
    };
    saveUser(updatedUser);
  };

  /** Logout */
  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
