# Mood Booster Chatbot - Setup Instructions

This document provides step-by-step instructions for setting up the Mood Booster Chatbot project for Milestone 1.

## Project Structure

```
comp4537_mood_booster_term_project/
├── backend/              # Node.js/Express API server
├── frontend/            # React frontend client
├── llm-service/         # Python Flask service for LLM
└── README.md
```

## Prerequisites

1. **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
2. **Python** (v3.8 or higher) - [Download here](https://www.python.org/)
3. **npm** (comes with Node.js)
4. **pip** (Python package manager)

## Setup Instructions

### 1. Backend Setup (Node.js/Express)

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
# Copy the example file (if it exists) or create manually
# On Windows:
copy .env.example .env
# On Mac/Linux:
cp .env.example .env
```

4. Edit `.env` file with your configuration:
```
PORT=3000
JWT_SECRET=your_secret_key_change_this_in_production
LLM_SERVICE_URL=http://localhost:5000
DB_PATH=./database.db
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
```

5. Start the backend server:
```bash
npm start
# Or for development with auto-reload:
npm run dev
```

The backend server will run on `http://localhost:3000`

### 2. LLM Service Setup (Python/Flask)

1. Navigate to the llm-service directory:
```bash
cd llm-service
```

2. Create a virtual environment:
```bash
# On Windows:
python -m venv venv
venv\Scripts\activate

# On Mac/Linux:
python3 -m venv venv
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

**Note:** This will take several minutes as it downloads:
- PyTorch (large file, ~2GB)
- Transformers library
- Other dependencies

4. Create a `.env` file (optional):
```
PORT=5000
MODEL_PATH=./models
```

5. Start the LLM service:
```bash
python app.py
```

**Important:** On first run, the service will download the GPT-2 model from HuggingFace (~500MB). This may take several minutes depending on your internet connection.

The LLM service will run on `http://localhost:5000`

### 3. Frontend Setup (React/Vite)

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional):
```bash
VITE_API_BASE_URL=http://localhost:3000
```

4. Start the frontend development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Running the Complete Application

You need to run all three services simultaneously:

1. **Terminal 1 - Backend:**
```bash
cd backend
npm start
```

2. **Terminal 2 - LLM Service:**
```bash
cd llm-service
# Activate virtual environment first
python app.py
```

3. **Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

## Testing the Application

### Test Credentials

**Admin User:**
- Email: `admin@admin.com`
- Password: `111`

**Regular User:**
- Email: `john@john.com`
- Password: `123`

### Testing Steps

1. Open your browser and navigate to `http://localhost:5173`
2. Login with the admin credentials
3. Test the admin dashboard (view users, view chat history, delete users)
4. Logout and create a new user account
5. Login with the new account
6. Send messages to the chatbot
7. Check your API call count (should increment with each message)
8. Test the 20 API call limit warning

## Database Setup

The database is automatically created when you first run the backend server. It's an SQLite database stored in `backend/database.db`.

The database schema includes:
- **users** table: Stores user information (email, password hash, admin status, API call count)
- **chat_history** table: Stores chat messages and responses

The admin user is automatically created on first run.

## Hosting on Web Services

### Backend Hosting

1. Upload the `backend` folder to your web hosting service
2. Install Node.js dependencies on the server
3. Set environment variables:
   - `PORT`: Port number (usually provided by hosting service)
   - `JWT_SECRET`: A secure random string
   - `LLM_SERVICE_URL`: URL of your LLM service
   - `DB_PATH`: Path to store the database file
   - `CLIENT_ORIGIN`: URL of your frontend client
4. Start the server using a process manager like PM2:
```bash
pm2 start server.js
```

### LLM Service Hosting

1. Upload the `llm-service` folder to your web hosting service
2. Ensure Python 3.8+ is installed on the server
3. Create a virtual environment on the server
4. Install dependencies:
```bash
pip install -r requirements.txt
```
5. Set environment variables:
   - `PORT`: Port number for the LLM service
   - `MODEL_PATH`: Path where model files will be stored (for bonus points, show this location)
6. Start the service:
```bash
python app.py
```
7. **For bonus points:** Document the model location. The model will be cached in `MODEL_PATH/MODEL_NAME/` (e.g., `./models/gpt2/`)

### Frontend Hosting

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Upload the `dist` folder contents to your frontend web hosting service

3. Configure your frontend hosting to serve the built files

4. Update `VITE_API_BASE_URL` to point to your backend API URL

## Model Information

**Model Used:** GPT-2 (small)
**Source:** HuggingFace - https://huggingface.co/gpt2
**Model Size:** ~500MB (approximately)
**Location on Server:** `MODEL_PATH/gpt2/` (e.g., `./models/gpt2/`)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### User
- `GET /api/user/profile` - Get user profile (requires authentication)

### Chat
- `POST /api/chat/send` - Send a message to the chatbot (requires authentication)
- `GET /api/chat/history` - Get chat history (requires authentication)

### Admin
- `GET /api/admin/users` - Get all users (requires admin authentication)
- `GET /api/admin/chat-history/:userId` - Get chat history for a user (requires admin authentication)
- `DELETE /api/admin/users/:userId` - Delete a user (requires admin authentication)

## Troubleshooting

### Backend Issues

- **Port already in use:** Change the PORT in `.env` file
- **Database errors:** Delete `database.db` and restart the server (will recreate tables)
- **JWT errors:** Ensure JWT_SECRET is set in `.env`

### LLM Service Issues

- **Model download fails:** Check internet connection, ensure sufficient disk space (~2GB free)
- **Memory errors:** The model requires at least 2GB RAM. Consider using a smaller model or increasing server memory
- **Slow responses:** First run downloads the model, subsequent runs are faster. Consider using GPU for faster inference

### Frontend Issues

- **CORS errors:** Ensure backend CORS is configured to allow your frontend origin
- **API connection errors:** Verify `VITE_API_BASE_URL` is correct and backend is running

## Security Features Implemented

1. **Password Hashing:** Uses bcrypt for password hashing
2. **JWT Authentication:** Token-based authentication
3. **SQL Injection Protection:** Uses parameterized queries
4. **XSS Protection:** Input sanitization on all user inputs
5. **API Rate Limiting:** Implemented via express-rate-limit (can be configured)
6. **Input Validation:** Validates all inputs before processing

## Notes for Milestone 1 Submission

1. **Project Title:** Mood Booster Chatbot - AI-Powered Chatbot API Server
2. **Model URL:** https://huggingface.co/gpt2
3. **Login/Registration Page:** Available at your frontend URL
4. **Admin Credentials:** admin@admin.com / 111
5. **Test User Credentials:** john@john.com / 123 (create via registration)
6. **ML Functionality:** Accessible after login - chat interface
7. **Database Screenshot:** Take a screenshot of your database.db file using a SQLite browser tool

## Next Steps

After completing the setup:
1. Test all functionality
2. Take screenshots for submission
3. Document your model location for bonus points
4. Prepare your team PDF (as per Milestone 1 requirements)
5. Create your submission zip files (team#FrontEnd.zip and team#BackEnd.zip)
