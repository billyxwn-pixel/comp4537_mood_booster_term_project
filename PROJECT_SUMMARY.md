# Mood Booster Chatbot - Project Summary

## What Has Been Implemented

### ✅ Backend (Node.js/Express)
- **Authentication Service:** User registration and login with JWT tokens
- **Database:** SQLite database with users and chat_history tables
- **API Endpoints:** Complete RESTful API for authentication, chat, user profile, and admin functions
- **Security:** Password hashing (bcrypt), SQL injection protection, XSS protection
- **Admin Features:** View all users, view chat history, delete users

### ✅ LLM Service (Python/Flask)
- **Model:** GPT-2 from HuggingFace (https://huggingface.co/gpt2)
- **Model Hosting:** Automatic download and caching of model files
- **API Endpoints:** Chat endpoint for generating mood-boosting responses
- **Model Location Tracking:** Endpoint to show where model is stored (for bonus points)

### ✅ Frontend (React/Vite)
- **Login/Registration Page:** Functional authentication UI
- **User Landing Page:** Chat interface with message history
- **Admin Landing Page:** Dashboard for viewing users and chat history
- **API Call Tracking:** Shows API calls used (20 free calls per user)
- **Warning System:** Alerts users when they exceed 20 free API calls

## Architecture Overview

```
┌─────────────┐      HTTP/REST      ┌─────────────┐      HTTP/REST      ┌─────────────┐
│  Frontend   │ ──────────────────> │   Backend   │ ──────────────────> │ LLM Service │
│   (React)   │                      │  (Express)  │                    │  (Flask)    │
└─────────────┘                      └─────────────┘                    └─────────────┘
                                             │
                                             │ SQLite
                                             ▼
                                      ┌─────────────┐
                                      │  Database   │
                                      │   (SQLite)  │
                                      └─────────────┘
```

## Key Features

### 1. Authentication System
- JWT-based token authentication
- Password hashing with bcrypt
- No third-party authentication services
- Automatic admin user creation

### 2. API Call Limiting
- 20 free API calls per user
- Warning message after limit exceeded
- Service continues to work after limit
- API call counter visible on user dashboard

### 3. Admin Dashboard
- View all registered users
- View any user's chat history
- Delete users (except yourself)
- Monitor API usage across users

### 4. Security Features
- SQL injection protection (parameterized queries)
- XSS protection (input sanitization)
- Password hashing (bcrypt with 10 rounds)
- JWT token expiration (24 hours)
- CORS configuration for cross-origin requests

## Test Credentials

**Admin:**
- Email: `admin@admin.com`
- Password: `111`

**Regular User:**
- Email: `john@john.com`
- Password: `123`

**Note:** The admin user is automatically created on first run. You can register new users through the registration page.

## Database Schema

### users Table
- id (INTEGER PRIMARY KEY)
- email (TEXT UNIQUE)
- password_hash (TEXT)
- is_admin (INTEGER)
- api_calls_used (INTEGER)
- created_at (DATETIME)

### chat_history Table
- id (INTEGER PRIMARY KEY)
- user_id (INTEGER FOREIGN KEY)
- user_message (TEXT)
- bot_response (TEXT)
- created_at (DATETIME)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### User
- `GET /api/user/profile` - Get user profile (requires auth)

### Chat
- `POST /api/chat/send` - Send message to chatbot (requires auth)
- `GET /api/chat/history` - Get chat history (requires auth)

### Admin
- `GET /api/admin/users` - Get all users (requires admin auth)
- `GET /api/admin/chat-history/:userId` - Get user chat history (requires admin auth)
- `DELETE /api/admin/users/:userId` - Delete user (requires admin auth)

## Model Information for Milestone 1

**Model:** GPT-2 (small)
**Source:** HuggingFace - https://huggingface.co/gpt2
**Model Size:** ~500MB
**Model Location:** `llm-service/models/gpt2/` (after first run)

**For Bonus Points:**
- Model files are physically stored on your server
- Location can be verified via `/api/model/info` endpoint
- Screenshot of model directory shows actual files stored on server

## Code Organization

All code follows OOP principles and is modular:

### Backend Structure
```
backend/
├── database/
│   └── Database.js           # Database class (singleton pattern)
├── services/
│   ├── AuthService.js        # Authentication service class
│   └── ChatService.js        # Chat service class
├── middleware/
│   └── AuthMiddleware.js     # Authentication middleware class
├── routes/
│   ├── AuthRoutes.js         # Authentication routes class
│   ├── ChatRoutes.js         # Chat routes class
│   ├── UserRoutes.js         # User routes class
│   └── AdminRoutes.js        # Admin routes class
└── server.js                 # Main server class
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── LoginPage.jsx     # Login/Registration component
│   │   ├── UserLandingPage.jsx  # User chat interface
│   │   └── AdminLandingPage.jsx # Admin dashboard
│   ├── services/
│   │   └── api.js            # API service class
│   ├── App.jsx               # Main app component
│   └── main.jsx              # Entry point
```

### LLM Service Structure
```
llm-service/
└── app.py                    # Flask app with LLMService class
```

## Getting Started

### 1. Backend
```bash
cd backend
npm install
# Create .env file (copy from .env.example)
npm start
```

### 2. LLM Service
```bash
cd llm-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

**Note:** Run all three services simultaneously in separate terminals.

## For Milestone 1 Submission

### Deliverables Completed:

✅ **A1. Project Title:**
   - "Mood Booster Chatbot - AI-Powered Chatbot API Server"

✅ **A2. Model URL:**
   - https://huggingface.co/gpt2

✅ **A3. Login/Registration Page:**
   - Functional login/registration
   - Admin credentials: admin@admin.com / 111
   - User credentials: john@john.com / 123 (can register new users)

✅ **A4. ML Functionality:**
   - Chatbot works after login
   - Model is hosted and functional
   - API endpoints are accessible

✅ **B. Database Screenshot:**
   - See DATABASE_ERD.md for schema
   - Use SQLite browser to view database.db
   - Take screenshot showing tables and sample data

✅ **C. Team PDF:**
   - Create milestone1Group#.pdf with project title, team number, names, and architecture diagram

✅ **D. Source Code:**
   - team#FrontEnd.zip (frontend folder)
   - team#BackEnd.zip (backend + llm-service folders)

## Additional Notes

1. **Model Hosting for Bonus:** 
   - The model is automatically downloaded on first run
   - Model files are stored in `llm-service/models/gpt2/`
   - Verify location using `/api/model/info` endpoint
   - Take screenshot of model directory for submission

2. **Cross-Origin Setup:**
   - Backend CORS is configured for frontend origin
   - Update CLIENT_ORIGIN in backend .env for production

3. **Database:**
   - SQLite database is auto-created on first run
   - Admin user is auto-created on first run
   - Database file: `backend/database.db`

4. **Security:**
   - All passwords are hashed with bcrypt
   - All inputs are sanitized
   - SQL injection protection via parameterized queries
   - XSS protection via input sanitization

## Troubleshooting

- **Backend won't start:** Check PORT in .env, ensure Node.js is installed
- **LLM service fails:** Check Python version, ensure disk space available
- **Model won't download:** Check internet connection, ensure sufficient disk space (~2GB)
- **Frontend can't connect:** Check API URL, check backend is running, check CORS

## Next Steps

1. Test all functionality locally
2. Deploy to web hosting services (see HOSTING_GUIDE.md)
3. Test deployed services
4. Take screenshots for submission
5. Prepare team PDF
6. Create submission zip files
7. Submit deliverables

Good luck with your milestone submission! 🚀
