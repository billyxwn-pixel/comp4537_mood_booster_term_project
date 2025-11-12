import axios from 'axios'

/**
 * API Service class
 * Handles all API calls to the backend
 */
class ApiService {
  constructor(baseURL) {
    this.baseURL = baseURL || import.meta.env.VITE_API_BASE_URL || 'https://mood-booster-backend.onrender.com'
    this.setupAxios()
  }

  setupAxios() {
    // Add token to requests if available
    axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )
  }

  /**
   * Register a new user
   */
  async register(email, password) {
    try {
      const response = await axios.post(`${this.baseURL}/api/auth/register`, {
        email,
        password
      })
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      }
    }
  }

  /**
   * Login user
   */
  async login(email, password) {
    try {
      const response = await axios.post(`${this.baseURL}/api/auth/login`, {
        email,
        password
      })
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      }
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile() {
    try {
      const response = await axios.get(`${this.baseURL}/api/user/profile`)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get profile'
      }
    }
  }

  /**
   * Send chat message
   */
  async sendMessage(message) {
    try {
      const response = await axios.post(`${this.baseURL}/api/chat/send`, {
        message
      })
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to send message'
      }
    }
  }

  /**
   * Get chat history
   */
  async getChatHistory() {
    try {
      const response = await axios.get(`${this.baseURL}/api/chat/history`)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get chat history'
      }
    }
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers() {
    try {
      const response = await axios.get(`${this.baseURL}/api/admin/users`)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get users'
      }
    }
  }

  /**
   * Get chat history for a specific user (admin only)
   */
  async getUserChatHistory(userId) {
    try {
      const response = await axios.get(`${this.baseURL}/api/admin/chat-history/${userId}`)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get chat history'
      }
    }
  }

  /**
   * Delete a user (admin only)
   */
  async deleteUser(userId) {
    try {
      const response = await axios.delete(`${this.baseURL}/api/admin/users/${userId}`)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to delete user'
      }
    }
  }
}

export default new ApiService()
