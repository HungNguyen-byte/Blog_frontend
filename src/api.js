// project/src/api.js
import axios from "axios";

const baseURL = `${
  process.env.REACT_APP_API_URL ?? "http://localhost:8080"
}/api`;

const API = axios.create({
  baseURL,
  withCredentials: true,
});

API.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("blogUser") || "{}");
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    // Handle request errors (e.g., log or reject)
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle response errors globally (e.g., token expiry, network issues)
    if (error.response?.status === 401) {
      // Optional: Logout user or refresh token
      console.warn("Unauthorized - logging out");
      localStorage.removeItem("blogUser");
    }
    console.error("API error:", error.message);
    return Promise.reject(error);
  }
);

export default API;