import axios from 'axios'

// Force console log to verify this file is loaded
console.log('📦 api.js module loaded at:', new Date().toISOString())

/**
 * API Service class
 * Handles all API calls to the backend
 */
class ApiService {
  constructor(baseURL) {
    // Production backend URL
    this.PRODUCTION_BACKEND_URL = 'https://mood-booster-backend.onrender.com'
    
    // Store the passed baseURL for potential use
    this._passedBaseURL = baseURL
    
    // Initialize baseURL (will be set properly in getBaseURL)
    this._baseURL = null
    
    this.setupAxios()
    
    // Log initialization
    console.log('🔧 ApiService initialized')
    console.log('Initial baseURL will be determined on first use')
  }
  
  // Getter that ensures correct baseURL at runtime
  getBaseURL() {
    // Detect if we're in production (not localhost) - check at runtime
    const isProduction = typeof window !== 'undefined' && 
                        window.location.hostname !== 'localhost' && 
                        window.location.hostname !== '127.0.0.1'
    
    // If we already have a valid baseURL and we're in production, ensure it's not localhost
    if (this._baseURL && isProduction && !this._baseURL.includes('localhost')) {
      return this._baseURL
    }
    
    // In production, ALWAYS use the production backend URL
    if (isProduction) {
      this._baseURL = this.PRODUCTION_BACKEND_URL
      console.log('🚀 Production mode - Using:', this._baseURL)
      return this._baseURL
    }
    
    // For local development
    if (this._passedBaseURL) {
      this._baseURL = this._passedBaseURL
    } else {
      const runtimeConfig = typeof window !== 'undefined' && window.APP_CONFIG?.API_BASE_URL
      const envURL = import.meta.env.VITE_API_BASE_URL
      const validEnvURL = envURL && envURL !== 'undefined' && envURL.trim() !== '' ? envURL : null
      this._baseURL = runtimeConfig || validEnvURL || 'http://localhost:3000'
    }
    
    // Ensure baseURL doesn't end with a slash
    if (this._baseURL.endsWith('/')) {
      this._baseURL = this._baseURL.slice(0, -1)
    }
    
    return this._baseURL
  }
  
  get baseURL() {
    return this.getBaseURL()
  }
  
  set baseURL(value) {
    this._baseURL = value
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
      // Runtime check: Force production URL if we're on Vercel
      let url = `${this.baseURL}/api/auth/login`
      const isProduction = typeof window !== 'undefined' && 
                          window.location.hostname !== 'localhost' && 
                          window.location.hostname !== '127.0.0.1'
      
      if (isProduction && url.includes('localhost')) {
        console.error('🚨 CRITICAL: Detected localhost in production! Overriding URL.')
        url = 'https://mood-booster-backend.onrender.com/api/auth/login'
        this.baseURL = 'https://mood-booster-backend.onrender.com'
      }
      
      console.log('=== LOGIN REQUEST ===')
      console.log('Current hostname:', typeof window !== 'undefined' ? window.location.hostname : 'N/A')
      console.log('Is Production:', isProduction)
      console.log('this.baseURL:', this.baseURL)
      console.log('Login request URL:', url)
      console.log('====================')
      
      const response = await axios.post(url, {
        email,
        password
      })
      return response.data
    } catch (error) {
      console.error('Login error:', error)
      console.error('Error URL:', error.config?.url)
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
