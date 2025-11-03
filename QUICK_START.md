# Quick Start Guide - Test Locally

This guide will help you run and test the entire Mood Booster Chatbot application locally before hosting.

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js (v18 or higher) - Check with: `node --version`
- ✅ Python (v3.8 or higher) - Check with: `python --version`
- ✅ npm - Check with: `npm --version`
- ✅ pip - Check with: `pip --version`

If any are missing, install them first.

## Step-by-Step Setup

### Step 1: Reset Database (If Needed)

If you encountered database errors before, reset the database:

```bash
cd backend
node reset-db.js
```

Or manually delete the database file:
```bash
# Windows PowerShell/CMD:
del database.db

# Git Bash/Mac/Linux:
rm database.db
```

### Step 2: Backend Setup

**Open Terminal 1:**

```bash
# Navigate to backend directory
cd backend

# Install dependencies (only needed first time)
npm install

# Create .env file (if it doesn't exist)
# On Windows PowerShell:
copy .env.example .env
# On Mac/Linux:
# cp .env.example .env

# Edit .env file - Ensure these values:
# PORT=3000
# JWT_SECRET=your_secret_key_change_this_in_production
# LLM_SERVICE_URL=http://localhost:5000
# DB_PATH=./database.db
# NODE_ENV=development
# CLIENT_ORIGIN=http://localhost:5173

# Start the backend server
npm start
```

**Expected Output:**
```
Database connected
Executing query 1/4...
Query 1/4 completed successfully
Executing query 2/4...
Query 2/4 completed successfully
Executing query 3/4...
Query 3/4 completed successfully
Executing query 4/4...
Query 4/4 completed successfully
All tables and indexes created successfully
Admin user created
Server initialized successfully
Server running on port 3000
Environment: development
LLM Service URL: http://localhost:5000
```

**✅ Keep this terminal open** - Backend server must stay running.

---

### Step 3: LLM Service Setup

**Open Terminal 2:**

```bash
# Navigate to llm-service directory
cd llm-service

# Create virtual environment (only needed first time)
# Windows:
python -m venv venv
venv\Scripts\activate

# Mac/Linux:
python3 -m venv venv
source venv/bin/activate

# Install dependencies (only needed first time)
# This will take several minutes and download ~2GB of files
pip install -r requirements.txt

# Start the LLM service
python app.py
```

**Expected Output:**
```
Starting LLM Service...
Model to load: gpt2
Model will be cached in: ./models
Device: cpu
Loading model: gpt2
Loading tokenizer...
Loading model...
Model loaded successfully on cpu
Model loaded successfully!
Starting server on port 5000
```

**⚠️ First Run Note:** On first run, the model will download (~500MB). This can take 5-10 minutes depending on your internet speed.

**✅ Keep this terminal open** - LLM service must stay running.

---

### Step 4: Frontend Setup

**Open Terminal 3:**

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (only needed first time)
npm install

# Start the frontend development server
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**✅ Keep this terminal open** - Frontend server must stay running.

---

## Step 5: Testing the Application

### 5.1 Open the Application

1. Open your web browser
2. Navigate to: **http://localhost:5173**
3. You should see the login/registration page

### 5.2 Test Admin Login

1. **Login as Admin:**
   - Email: `admin@admin.com`
   - Password: `111`
   - Click "Login"

2. **Expected:** You should see the Admin Dashboard with:
   - List of all users
   - Options to view chat history
   - Delete user functionality

3. **Test Admin Features:**
   - Click "View Chat" on a user (if any exist)
   - Verify you can see chat history

### 5.3 Test User Registration

1. **Logout** (click Logout button)
2. **Register a New User:**
   - Click "Don't have an account? Register"
   - Enter email: `test@test.com`
   - Enter password: `test123`
   - Click "Register"

3. **Expected:** You should be automatically logged in and see the User Chat interface

### 5.4 Test Chatbot Functionality

1. **Send a Message:**
   - Type: "Hello, how are you?"
   - Click "Send"

2. **Expected:** 
   - Your message appears in the chat
   - Bot response appears after a few seconds
   - API calls counter increments

3. **Send More Messages:**
   - Try: "I'm feeling sad today"
   - Try: "Tell me something funny"
   - Try: "What's the weather like?"

4. **Check API Call Limit:**
   - After sending several messages, check the API calls counter
   - It should show: "X / 20 used"
   - After 20 calls, you should see a warning message

### 5.5 Test Pre-registered User

1. **Logout**
2. **Login with Pre-registered User:**
   - Email: `john@john.com`
   - Password: `123`
   - Click "Login"

3. **Expected:** You should see the chat interface
4. **Send Messages** and verify chatbot works

### 5.6 Test Admin Dashboard Again

1. **Logout**
2. **Login as Admin:** `admin@admin.com` / `111`
3. **View Users:**
   - You should see all registered users (admin, john@john.com, test@test.com, etc.)
4. **View Chat History:**
   - Click "View Chat" on any user
   - You should see their chat messages
5. **Test Delete User** (optional):
   - Click "Delete" on a non-admin user
   - Confirm deletion
   - User should be removed from the list

---

## Troubleshooting

### Backend Won't Start

**Issue:** Port 3000 already in use
**Solution:**
```bash
# Change PORT in backend/.env file to 3001 or another port
# Update frontend to point to new port
```

**Issue:** Database errors
**Solution:**
```bash
cd backend
node reset-db.js
npm start
```

### LLM Service Won't Start

**Issue:** Python not found
**Solution:** Use `python3` instead of `python`, or ensure Python is in PATH

**Issue:** Module not found errors
**Solution:**
```bash
# Ensure virtual environment is activated
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

**Issue:** Model download fails
**Solution:**
- Check internet connection
- Ensure you have ~2GB free disk space
- Wait longer (first download takes 5-10 minutes)

**Issue:** Out of memory errors
**Solution:**
- Close other applications
- The model requires ~2GB RAM minimum
- Consider using a smaller model in app.py (e.g., distilgpt2)

### Frontend Won't Start

**Issue:** Port 5173 already in use
**Solution:** Vite will automatically use the next available port, or stop the other process

**Issue:** Cannot connect to backend
**Solution:**
- Check backend is running on port 3000
- Check browser console for errors
- Verify `VITE_API_BASE_URL` in frontend (should be `http://localhost:3000`)

### Chatbot Not Responding

**Issue:** Messages send but no response
**Solution:**
1. Check LLM service is running (Terminal 2)
2. Check backend terminal for errors
3. Check LLM service terminal for errors
4. Verify `LLM_SERVICE_URL` in backend/.env is `http://localhost:5000`

---

## Quick Test Checklist

Before moving to hosting, verify:

- [ ] Backend starts without errors
- [ ] LLM service starts and loads model
- [ ] Frontend loads in browser
- [ ] Can login as admin
- [ ] Can register new user
- [ ] Can login with new user
- [ ] Can send messages to chatbot
- [ ] Chatbot responds with messages
- [ ] API calls counter increments
- [ ] Warning appears after 20 calls
- [ ] Admin can view all users
- [ ] Admin can view chat history
- [ ] Database file (database.db) is created in backend folder
- [ ] Model files are downloaded in llm-service/models/gpt2/

---

## Next Steps After Local Testing

Once everything works locally:

1. **Review Hosting Guide:** See `HOSTING_GUIDE.md` for deployment instructions
2. **Prepare Database Screenshot:** Use SQLite browser to view and screenshot your database
3. **Document Model Location:** Take screenshot of model files for bonus points
4. **Prepare Submission:** Create team#FrontEnd.zip and team#BackEnd.zip files
5. **Create Team PDF:** See Milestone 1 requirements for PDF contents

---

## All Services Running

When everything is working, you should have:

**Terminal 1:** Backend server on http://localhost:3000
**Terminal 2:** LLM service on http://localhost:5000
**Terminal 3:** Frontend on http://localhost:5173

**Browser:** http://localhost:5173 showing the login page

All three services must run simultaneously for the application to work!

---

## Quick Commands Reference

```bash
# Backend
cd backend
npm install          # First time only
npm start           # Start server
node reset-db.js    # Reset database

# LLM Service
cd llm-service
python -m venv venv
venv\Scripts\activate    # Windows
source venv/bin/activate # Mac/Linux
pip install -r requirements.txt  # First time only
python app.py

# Frontend
cd frontend
npm install         # First time only
npm run dev        # Start dev server
```

---

Good luck with your testing! 🚀
