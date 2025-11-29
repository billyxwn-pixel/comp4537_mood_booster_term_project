import React, { useState } from 'react'
import ApiService from '../services/api'

/**
 * Login Page Component
 * Handles user registration and login
 */
function LoginPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let result
      if (isLogin) {
        result = await ApiService.login(email, password)
      } else {
        result = await ApiService.register(email, password)
      }

      if (result.success) {
        onLogin(result.user, result.token)
      } else {
        setError(result.error || 'An error occurred')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="text-center mb-4">
          {isLogin ? 'Login' : 'Register'}
        </h2>
        <p className="text-center text-muted mb-4">
          Mood Booster Chatbot
        </p>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              minLength={3}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 mb-3"
            disabled={loading}
          >
            {loading ? 'Loading...' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="text-center">
          <button
            type="button"
            className="btn btn-link"
            onClick={() => {
              setIsLogin(!isLogin)
              setError('')
            }}
          >
            {isLogin
              ? "Don't have an account? Register"
              : 'Already have an account? Login'}
          </button>
        </div>

       
      </div>
    </div>
  )
}

export default LoginPage
