// project/src/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("blogUser") || "{}");
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default API;