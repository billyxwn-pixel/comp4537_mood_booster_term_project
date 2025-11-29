/**
 * Admin Landing Page Component
 * Admin interface for viewing users and chat history
 * 
 * Note: ChatGPT was used for syntax correction and debugging
 */

import React, { useState, useEffect } from 'react'
import ApiService from '../services/api'

function AdminLandingPage({ user, token, onLogout }) {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [chatHistory, setChatHistory] = useState([])
  const [endpointStats, setEndpointStats] = useState([])
  const [userStats, setUserStats] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('stats') // 'stats' or 'users'

  useEffect(() => {
    loadUsers()
    loadEndpointStats()
    loadUserStats()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    setError('')
    
    try {
      const result = await ApiService.getAllUsers()
      if (result.success) {
        setUsers(result.users)
      } else {
        setError(result.error || 'Failed to load users')
      }
    } catch (err) {
      setError('An error occurred while loading users')
    } finally {
      setLoading(false)
    }
  }

  const loadUserChatHistory = async (userId) => {
    setLoading(true)
    setError('')
    
    try {
      const result = await ApiService.getUserChatHistory(userId)
      if (result.success) {
        setChatHistory(result.history || [])
        setSelectedUser(userId)
      } else {
        setError(result.error || 'Failed to load chat history')
      }
    } catch (err) {
      setError('An error occurred while loading chat history')
    } finally {
      setLoading(false)
    }
  }

  const loadEndpointStats = async () => {
    setLoading(true)
    setError('')
    
    try {
      const result = await ApiService.getEndpointStats()
      if (result.success) {
        setEndpointStats(result.stats || [])
      } else {
        setError(result.error || 'Failed to load endpoint stats')
      }
    } catch (err) {
      setError('An error occurred while loading endpoint stats')
    } finally {
      setLoading(false)
    }
  }

  const loadUserStats = async () => {
    setLoading(true)
    setError('')
    
    try {
      const result = await ApiService.getUserStats()
      if (result.success) {
        setUserStats(result.users || [])
      } else {
        setError(result.error || 'Failed to load user stats')
      }
    } catch (err) {
      setError('An error occurred while loading user stats')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const result = await ApiService.deleteUser(userId)
      if (result.success) {
        await loadUsers()
        await loadUserStats()
        if (selectedUser === userId) {
          setSelectedUser(null)
          setChatHistory([])
        }
        alert('User deleted successfully')
      } else {
        setError(result.error || 'Failed to delete user')
      }
    } catch (err) {
      setError('An error occurred while deleting user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="chat-container">
      <div className="chat-card">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Admin Dashboard</h2>
          <div>
            <span className="me-3">Welcome, {user?.email} (Admin)</span>
            <button className="btn btn-outline-danger" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* Tabs for Stats and Users */}
        <ul className="nav nav-tabs mb-4" role="tablist">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              API Statistics
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              User Management
            </button>
          </li>
        </ul>

        {activeTab === 'stats' && (
          <div className="row">
            {/* Table 1: Endpoint Usage Statistics */}
            <div className="col-12 mb-4">
              <h4>Endpoint Usage Statistics</h4>
              <p className="text-muted">Stats for each endpoint (how many times each endpoint served requests)</p>
              <div className="table-responsive">
                <table className="table table-striped table-bordered">
                  <thead className="table-dark">
                    <tr>
                      <th>Method</th>
                      <th>Endpoint</th>
                      <th>Requests</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && endpointStats.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center">Loading...</td>
                      </tr>
                    ) : endpointStats.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center">No endpoint stats available</td>
                      </tr>
                    ) : (
                      endpointStats.map((stat, index) => (
                        <tr key={index}>
                          <td>{stat.method}</td>
                          <td>{stat.endpoint}</td>
                          <td>{stat.request_count}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 2: User API Consumption */}
            <div className="col-12">
              <h4>User API Consumption Statistics</h4>
              <p className="text-muted">Breakdown of API usages/consumption stats for each user</p>
              <div className="table-responsive">
                <table className="table table-striped table-bordered">
                  <thead className="table-dark">
                    <tr>
                      <th>User ID</th>
                      <th>Email</th>
                      <th>Total Requests</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && userStats.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center">Loading...</td>
                      </tr>
                    ) : userStats.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center">No user stats available</td>
                      </tr>
                    ) : (
                      userStats.map((userStat) => (
                        <tr key={userStat.id}>
                          <td>{userStat.id}</td>
                          <td>{userStat.email}</td>
                          <td>{userStat.total_requests}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
        <div className="row">
          <div className="col-md-6">
            <h4>All Users</h4>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>API Calls</th>
                    <th>Admin</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && users.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center">Loading...</td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center">No users found</td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.email}</td>
                        <td>{u.api_calls_used}</td>
                        <td>{u.is_admin ? 'Yes' : 'No'}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-info me-2"
                            onClick={() => loadUserChatHistory(u.id)}
                          >
                            View Chat
                          </button>
                          {!u.is_admin && (
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteUser(u.id)}
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="col-md-6">
            <h4>
              Chat History
              {selectedUser && (
                <span className="text-muted ms-2">
                  (User ID: {selectedUser})
                </span>
              )}
            </h4>
            
            {!selectedUser ? (
              <div className="alert alert-info">
                Select a user to view their chat history
              </div>
            ) : loading ? (
              <div className="text-center">Loading chat history...</div>
            ) : chatHistory.length === 0 ? (
              <div className="alert alert-info">
                No chat history found for this user
              </div>
            ) : (
              <div className="chat-messages">
                {chatHistory.map((chat, index) => (
                  <div key={index} className="mb-3 p-3 border rounded">
                    <div className="mb-2">
                      <strong>User:</strong> {chat.user_message}
                    </div>
                    <div>
                      <strong>Bot:</strong> {chat.bot_response}
                    </div>
                    <small className="text-muted">
                      {new Date(chat.created_at).toLocaleString()}
                    </small>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  )
}

export default AdminLandingPage
