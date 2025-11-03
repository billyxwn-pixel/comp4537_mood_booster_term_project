# Mood Booster Chatbot - Term Project

An AI-powered RESTful API server that provides a mood-boosting chatbot service.

## Project Overview

This project implements a microservice architecture with:
- **Backend API Server** (Node.js/Express) - Handles authentication, API endpoints, and database operations
- **LLM Service** (Python/Flask) - Hosts a pre-trained GPT-2 model from HuggingFace for chatbot responses
- **Frontend Client** (React/Vite) - User interface for interacting with the chatbot

## Features

- User registration and login with JWT authentication
- Mood-boosting chatbot powered by GPT-2 model from HuggingFace
- 20 free API calls per user (with warning after limit)
- Admin dashboard for monitoring users and chat history
- Secure password hashing and SQL injection protection
- XSS protection through input sanitization
- Chat history storage and retrieval

## Technology Stack

### Backend
- Node.js with Express.js
- SQLite database
- JWT for authentication
- bcryptjs for password hashing

### LLM Service
- Python with Flask
- HuggingFace Transformers library
- PyTorch for model inference
- GPT-2 model from HuggingFace

### Frontend
- React with Vite
- Bootstrap for styling
- Axios for API calls

## Project Structure

```
comp4537_mood_booster_term_project/
├── backend/                 # Backend API server
│   ├── database/           # Database classes
│   ├── services/          # Business logic services
│   ├── middleware/        # Authentication middleware
│   ├── routes/            # API route handlers
│   ├── server.js          # Main server file
│   └── package.json       # Node.js dependencies
├── frontend/              # Frontend client
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API service classes
│   │   └── App.jsx        # Main app component
│   └── package.json       # Frontend dependencies
├── llm-service/          # LLM hosting service
│   ├── app.py            # Flask application
│   └── requirements.txt  # Python dependencies
└── SETUP.md              # Detailed setup instructions
```

## Quick Start

See [SETUP.md](./SETUP.md) for detailed setup instructions.

### Prerequisites
- Node.js (v18+)
- Python (v3.8+)
- npm
- pip

### Quick Setup

1. **Backend:**
```bash
cd backend
npm install
npm start
```

2. **LLM Service:**
```bash
cd llm-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

3. **Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Test Credentials

**Admin:**
- Email: `admin@admin.com`
- Password: `111`

**Regular User:**
- Email: `john@john.com`
- Password: `123`

## Model Information

**Model:** GPT-2 (small)
**Source:** [HuggingFace](https://huggingface.co/gpt2)
**Model Location:** `llm-service/models/gpt2/` (after first run)

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### User Endpoints
- `GET /api/user/profile` - Get user profile (requires auth)

### Chat Endpoints
- `POST /api/chat/send` - Send message to chatbot (requires auth)
- `GET /api/chat/history` - Get chat history (requires auth)

### Admin Endpoints
- `GET /api/admin/users` - Get all users (requires admin auth)
- `GET /api/admin/chat-history/:userId` - Get user chat history (requires admin auth)
- `DELETE /api/admin/users/:userId` - Delete user (requires admin auth)

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- SQL injection protection (parameterized queries)
- XSS protection (input sanitization)
- API call limiting (20 free calls per user)

## Architecture

The project follows a microservice architecture:
1. **Frontend Service** - Client-side application (separate origin)
2. **Backend Service** - API server (separate origin)
3. **LLM Service** - AI model hosting service (can be on same or separate server)

All services communicate via RESTful API calls.

## Milestone 1 Deliverables

✅ User registration/login page (working)
✅ Admin and user landing pages (after login)
✅ ML/LLM hosted and working properly
✅ Database setup with ERD/documentation
✅ Authentication without third-party services
✅ Security features (SQL injection, XSS protection)

## Team Information

- **Group Number:** [Your Group Number]
- **Team Members:** [Your Team Members]

## License

This project is for educational purposes as part of COMP4537 term project.

## Support

For setup issues, refer to [SETUP.md](./SETUP.md) or contact your instructor.