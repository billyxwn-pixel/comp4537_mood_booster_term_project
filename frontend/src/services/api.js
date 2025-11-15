import axios from 'axios'

/**
 * API Service class
 * Handles all API calls to the backend
 */
class ApiService {
  constructor(baseURL) {
    // Priority order for baseURL:
    // 1. Explicitly passed baseURL (for testing)
    // 2. Runtime config from window (set in index.html or by Vercel)
    // 3. Vite build-time environment variable
    // 4. Fallback to default backend URL
    
    // Check for runtime config (useful for Vercel if env vars aren't working)
    const runtimeConfig = typeof window !== 'undefined' && window.APP_CONFIG?.API_BASE_URL
    
    // Check Vite build-time env var
    const envURL = import.meta.env.VITE_API_BASE_URL
    // Filter out localhost URLs in production
    const validEnvURL = envURL && 
                       envURL !== 'undefined' && 
                       envURL.trim() !== '' &&
                       !(envURL.includes('localhost') && typeof window !== 'undefined' && window.location.hostname !== 'localhost')
                       ? envURL : null
    
    // Determine the base URL with priority order
    let determinedURL = baseURL || runtimeConfig || validEnvURL || 'https://mood-booster-backend.onrender.com'
    
    // CRITICAL: Never use localhost in production (on Vercel)
    const isProduction = typeof window !== 'undefined' && 
                        window.location.hostname !== 'localhost' && 
                        window.location.hostname !== '127.0.0.1'
    
    if (isProduction && determinedURL.includes('localhost')) {
      console.error('🚨 ERROR: Attempted to use localhost in production! Overriding to production backend.')
      determinedURL = 'https://mood-booster-backend.onrender.com'
    }
    
    this.baseURL = determinedURL
    
    // Debug: Log the base URL being used (remove in production if desired)
    console.log('=== API Configuration ===')
    console.log('API Base URL:', this.baseURL)
    console.log('Runtime config:', runtimeConfig)
    console.log('VITE_API_BASE_URL from env:', import.meta.env.VITE_API_BASE_URL)
    console.log('Valid env URL:', validEnvURL)
    console.log('Is Production:', isProduction)
    console.log('Window.APP_CONFIG:', typeof window !== 'undefined' ? window.APP_CONFIG : 'N/A')
    console.log('========================')
    
    // Ensure baseURL doesn't end with a slash
    if (this.baseURL.endsWith('/')) {
      this.baseURL = this.baseURL.slice(0, -1)
    }
    
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
      const url = `${this.baseURL}/api/auth/login`
      console.log('Login request URL:', url) // Debug log
      const response = await axios.post(url, {
        email,
        password
      })
      return response.data
    } catch (error) {
      console.error('Login error:', error) // Debug log
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
