import React, { useState, useEffect, useRef } from 'react'
import ApiService from '../services/api'

/**
 * User Landing Page Component
 * Main chat interface for regular users
 */
function UserLandingPage({ user, token, onLogout }) {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [userProfile, setUserProfile] = useState(user)
  const [hasExceededLimit, setHasExceededLimit] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    // Load user profile to get API call info
    loadUserProfile()
    // Load chat history
    loadChatHistory()
  }, [])

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadUserProfile = async () => {
    const result = await ApiService.getUserProfile()
    if (result.success) {
      setUserProfile(result.user)
      setHasExceededLimit(result.user.api_calls_used >= 20)
    }
  }

  const loadChatHistory = async () => {
    const result = await ApiService.getChatHistory()
    if (result.success && result.history) {
      const chatMessages = result.history.map(msg => ({
        type: 'user',
        text: msg.user_message
      }))
      const botMessages = result.history.map(msg => ({
        type: 'bot',
        text: msg.bot_response
      }))
      
      // Interleave messages
      const allMessages = []
      for (let i = 0; i < chatMessages.length; i++) {
        allMessages.push(chatMessages[i])
        if (botMessages[i]) {
          allMessages.push(botMessages[i])
        }
      }
      
      setMessages(allMessages)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!inputMessage.trim() || loading) {
      return
    }

    const userMessage = inputMessage.trim()
    setInputMessage('')
    setLoading(true)

    // Add user message to UI immediately
    const newUserMessage = { type: 'user', text: userMessage }
    setMessages(prev => [...prev, newUserMessage])

    try {
      const result = await ApiService.sendMessage(userMessage)
      
      if (result.success) {
        // Add bot response
        const botMessage = { type: 'bot', text: result.response }
        setMessages(prev => [...prev, botMessage])
        
        // Update user profile
        setUserProfile(prev => ({
          ...prev,
          api_calls_used: result.apiCallsUsed,
          api_calls_remaining: result.apiCallsRemaining
        }))
        setHasExceededLimit(result.hasExceededLimit)
      } else {
        // Show error message
        const errorMessage = { type: 'bot', text: `Error: ${result.error}` }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      const errorMessage = { type: 'bot', text: 'Error sending message. Please try again.' }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const apiCallsRemaining = userProfile ? Math.max(0, 20 - userProfile.api_calls_used) : 0

  return (
    <div className="chat-container">
      <div className="chat-card">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Mood Booster Chatbot</h2>
          <div>
            <span className="me-3">Welcome, {userProfile?.email}</span>
            <button className="btn btn-outline-danger" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>

        <div className="api-info">
          <strong>API Calls:</strong> {userProfile?.api_calls_used || 0} / 20 used
          {apiCallsRemaining > 0 && (
            <span className="text-success"> ({apiCallsRemaining} remaining)</span>
          )}
        </div>

        {hasExceededLimit && (
          <div className="warning">
            <strong>Warning:</strong> You have exceeded your free API calls (20 calls). 
            The service will continue to work, but please note this limitation.
          </div>
        )}

        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="text-center text-muted mt-5">
              <p>Start a conversation with the Mood Booster Chatbot!</p>
              <p>Tell me what's on your mind, and I'll try to boost your mood! 😊</p>
            </div>
          )}
          
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.type}`}
            >
              {msg.text}
            </div>
          ))}
          
          {loading && (
            <div className="message bot">
              <em>Thinking...</em>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage}>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message here..."
              disabled={loading}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !inputMessage.trim()}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserLandingPage
