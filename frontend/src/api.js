import axios from "axios";
import { ACCESS_TOKEN } from "./constants";

// Ensure there is a default backend URL if the environment variable is not set
const API_BASE_URL = import.meta.env.VITE_API_URL
  ? (import.meta.env.VITE_API_URL.endsWith("/") ? import.meta.env.VITE_API_URL : import.meta.env.VITE_API_URL + "/")
  : "http://127.0.0.1:8000/api/";

console.log("API Base URL:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
