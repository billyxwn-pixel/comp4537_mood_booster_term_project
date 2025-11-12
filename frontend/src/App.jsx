import React, { useState, useEffect } from 'react'
import axios from 'axios'
import LoginPage from './components/LoginPage'
import UserLandingPage from './components/UserLandingPage'
import AdminLandingPage from './components/AdminLandingPage'

// Configure axios base URL (only used for direct axios calls in this file)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://mood-booster-backend.onrender.com'
axios.defaults.baseURL = API_BASE_URL

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  useEffect(() => {
    // Check for stored token
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      setIsAuthenticated(true)
      
      // Verify token is still valid
      verifyToken(storedToken)
    }
  }, [])

  const verifyToken = async (tokenToVerify) => {
    try {
      const response = await axios.get('/api/user/profile', {
        headers: { Authorization: `Bearer ${tokenToVerify}` }
      })
      
      if (response.data.success) {
        setUser(response.data.user)
        setIsAuthenticated(true)
      } else {
        handleLogout()
      }
    } catch (error) {
      handleLogout()
    }
  }

  const handleLogin = (userData, userToken) => {
    setUser(userData)
    setToken(userToken)
    setIsAuthenticated(true)
    localStorage.setItem('token', userToken)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    setToken(null)
    setIsAuthenticated(false)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />
  }

  if (user && user.is_admin) {
    return <AdminLandingPage user={user} token={token} onLogout={handleLogout} />
  }

  return <UserLandingPage user={user} token={token} onLogout={handleLogout} />
}

export default App
