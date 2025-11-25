import axios from "axios";

/**
 * Resolve the correct API base URL at runtime.
 */
function resolveBaseURL() {
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  const isLocalhost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "";

  const isVercel = hostname.includes("vercel.app");

  // 1. Prefer explicit environment variable
  const envURL = import.meta.env.VITE_API_BASE_URL;
  const hasEnvURL =
    typeof envURL === "string" &&
    envURL !== "undefined" &&
    envURL.trim() !== "";

  if (hasEnvURL) {
    console.log("[Api] Using VITE_API_BASE_URL:", envURL);
    return envURL.replace(/\/+$/, "");
  }

  // 2. If running on Vercel or any non localhost host, use production backend
  const PRODUCTION_BACKEND_URL = "https://mood-booster-backend.onrender.com";

  if (!isLocalhost || isVercel) {
    console.log(
      "[Api] No env URL. Non localhost host detected. Using production backend:",
      PRODUCTION_BACKEND_URL
    );
    return PRODUCTION_BACKEND_URL;
  }

  // 3. Fallback for local development only
  const localURL = "http://localhost:3000";
  console.log("[Api] Local development detected. Using:", localURL);
  return localURL;
}

const BASE_URL = resolveBaseURL();

/**
 * Axios instance configured for the backend API.
 */
const apiClient = axios.create({
  baseURL: BASE_URL,
});

// Attach auth token if present
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

class ApiService {
  /**
   * Register a new user
   */
  async register(email, password) {
    try {
      const response = await apiClient.post("/api/auth/register", {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Registration failed",
      };
    }
  }

  /**
   * Login user
   */
  async login(email, password) {
    try {
      console.log("[Api] Login using baseURL:", BASE_URL);
      const response = await apiClient.post("/api/auth/login", {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      console.error("[Api] Login error:", error?.message);
      console.error("[Api] Request URL:", error.config?.baseURL, error.config?.url);
      return {
        success: false,
        error: error.response?.data?.error || "Login failed",
      };
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile() {
    try {
      const response = await apiClient.get("/api/user/profile");
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to get profile",
      };
    }
  }

  /**
   * Send chat message
   */
  async sendMessage(message) {
    try {
      const response = await apiClient.post("/api/chat/send", {
        message,
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to send message",
      };
    }
  }

  /**
   * Get chat history
   */
  async getChatHistory() {
    try {
      const response = await apiClient.get("/api/chat/history");
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to get chat history",
      };
    }
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers() {
    try {
      const response = await apiClient.get("/api/admin/users");
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to get users",
      };
    }
  }

  /**
   * Get chat history for a specific user (admin only)
   */
  async getUserChatHistory(userId) {
    try {
      const response = await apiClient.get(
        `/api/admin/chat-history/${encodeURIComponent(userId)}`
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to get chat history",
      };
    }
  }

  /**
   * Delete a user (admin only)
   */
  async deleteUser(userId) {
    try {
      const response = await apiClient.delete(
        `/api/admin/users/${encodeURIComponent(userId)}`
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to delete user",
      };
    }
  }
}

export default new ApiService();
