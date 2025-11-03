# Web Hosting Guide for Mood Booster Chatbot

This guide provides step-by-step instructions for hosting your Mood Booster Chatbot on web hosting services.

## Prerequisites for Hosting

1. **Backend Hosting Requirements:**
   - Node.js (v18+) support
   - Ability to run Node.js processes
   - SQLite support (or ability to use file-based database)
   - Environment variable configuration

2. **LLM Service Hosting Requirements:**
   - Python (v3.8+) support
   - At least 4GB RAM (recommended 8GB+)
   - At least 5GB disk space (for model storage)
   - Ability to run Python processes

3. **Frontend Hosting Requirements:**
   - Static file hosting (HTML, CSS, JS)
   - OR Node.js hosting (for serving built files)

## Step 1: Hosting the Backend

### Option A: Traditional Web Hosting (cPanel, etc.)

1. **Upload Files:**
   - Upload the entire `backend` folder to your hosting
   - Ensure Node.js is available in your hosting

2. **Install Dependencies:**
   ```bash
   cd backend
   npm install --production
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the backend directory:
   ```
   PORT=3000
   JWT_SECRET=your_secure_random_secret_key_here
   LLM_SERVICE_URL=http://your-llm-service-domain.com:5000
   DB_PATH=/path/to/database.db
   NODE_ENV=production
   CLIENT_ORIGIN=https://your-frontend-domain.com
   ```

4. **Start Server:**
   - Use PM2 or similar process manager:
   ```bash
   pm2 start server.js --name mood-booster-backend
   ```
   - Or configure your hosting's Node.js app to run `server.js`

### Option B: Cloud Services (Heroku, Railway, etc.)

1. **Create new application**
2. **Set environment variables** in the platform's dashboard
3. **Deploy** using Git or upload files
4. **The platform will run** `npm start` automatically

## Step 2: Hosting the LLM Service

### Important: Model Download and Storage

The LLM service needs to download the GPT-2 model (~500MB) from HuggingFace. This happens automatically on first run.

### Hosting Steps:

1. **Upload Files:**
   - Upload the entire `llm-service` folder to your hosting

2. **Create Virtual Environment:**
   ```bash
   cd llm-service
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
   
   **Note:** This will take several minutes and requires:
   - Several GB of disk space
   - Good internet connection (model download)

4. **Configure Environment Variables:**
   Create a `.env` file or set environment variables:
   ```
   PORT=5000
   MODEL_PATH=/path/to/models
   ```

5. **Start Service:**
   ```bash
   python app.py
   ```

   **For Production:**
   ```bash
   gunicorn -w 1 -b 0.0.0.0:5000 app:app
   ```

   Or use PM2:
   ```bash
   pm2 start app.py --name mood-booster-llm --interpreter python3
   ```

### Model Location for Bonus Points

After the first run, the model will be cached in:
- **Path:** `MODEL_PATH/MODEL_NAME/` 
- **Example:** `/home/username/mood-booster/llm-service/models/gpt2/`

To prove the model is hosted:
1. SSH into your server
2. Navigate to the model directory
3. Take a screenshot showing:
   - Model files (pytorch_model.bin, config.json, tokenizer files, etc.)
   - File sizes showing the model is actually stored on your server

Or use the API endpoint:
```bash
curl http://your-llm-service-url/api/model/info
```

This will return the model location path.

## Step 3: Hosting the Frontend

### Option A: Static File Hosting

1. **Build the Frontend:**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Upload Build Files:**
   - Upload the contents of the `dist` folder to your web hosting
   - Configure your web server to serve these files

3. **Configure API URL:**
   - Create a `.env.production` file before building:
   ```
   VITE_API_BASE_URL=https://your-backend-api-url.com
   ```
   - Rebuild:
   ```bash
   npm run build
   ```

### Option B: Serve with Node.js

1. **Install serve:**
   ```bash
   npm install -g serve
   ```

2. **Build and serve:**
   ```bash
   cd frontend
   npm run build
   serve -s dist -l 80
   ```

## Step 4: Cross-Origin Configuration

Since frontend and backend are on different origins:

### Backend CORS Configuration

In `backend/server.js`, ensure CORS is configured:
```javascript
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'https://your-frontend-domain.com',
    credentials: true
}));
```

### Frontend API Configuration

In `frontend/src/services/api.js`, ensure the base URL points to your backend:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://your-backend-api-url.com'
```

## Step 5: Domain Configuration

1. **Backend Domain:** 
   - Example: `api.moodbooster.com`
   - Should serve the API endpoints

2. **Frontend Domain:**
   - Example: `moodbooster.com`
   - Should serve the React app

3. **LLM Service:**
   - Can be on a subdomain: `llm.moodbooster.com` or `api.moodbooster.com:5000`
   - Or on a separate server

## Step 6: SSL/HTTPS Setup

For production, you need HTTPS:

1. **Obtain SSL Certificate** (Let's Encrypt, Cloudflare, etc.)
2. **Configure your web server** (Nginx, Apache) to use HTTPS
3. **Update all URLs** to use `https://` instead of `http://`

## Step 7: Database Location

The SQLite database will be stored at:
- **Path:** `DB_PATH` environment variable
- **Example:** `/home/username/mood-booster/backend/database.db`

**For Production:**
- Consider using a managed database service (PostgreSQL, MySQL)
- Or ensure database file is in a persistent storage location
- Set up regular backups

## Troubleshooting Hosting Issues

### Backend Won't Start

- Check Node.js version (need v18+)
- Check port availability
- Check environment variables are set
- Check database path is writable

### LLM Service Fails to Load Model

- Check disk space (need ~5GB free)
- Check internet connection (for model download)
- Check Python version (need v3.8+)
- Check RAM availability (need 2GB+)

### Frontend Can't Connect to Backend

- Check CORS configuration
- Check API URL is correct
- Check firewall rules
- Check backend is running

### Model Location Not Found

- Model downloads on first run
- Check `MODEL_PATH` environment variable
- Check file permissions
- Model files are in `MODEL_PATH/MODEL_NAME/` directory

## Process Management

### Using PM2 (Recommended)

**Backend:**
```bash
cd backend
pm2 start server.js --name mood-booster-backend
pm2 save
pm2 startup  # Run this command and follow instructions
```

**LLM Service:**
```bash
cd llm-service
source venv/bin/activate
pm2 start app.py --name mood-booster-llm --interpreter python3
pm2 save
```

**View logs:**
```bash
pm2 logs mood-booster-backend
pm2 logs mood-booster-llm
```

**Restart services:**
```bash
pm2 restart mood-booster-backend
pm2 restart mood-booster-llm
```

## Monitoring

### Health Check Endpoints

- Backend: `GET https://your-backend-url/api/health`
- LLM Service: `GET https://your-llm-url/api/health`
- LLM Model Info: `GET https://your-llm-url/api/model/info`

### Logs

- Backend logs: Check PM2 logs or hosting platform logs
- LLM Service logs: Check PM2 logs or console output
- Database logs: SQLite logs errors to console

## Security Checklist for Production

- [ ] Change JWT_SECRET to a secure random string
- [ ] Use HTTPS for all services
- [ ] Configure CORS properly
- [ ] Set up firewall rules
- [ ] Regular database backups
- [ ] Monitor API usage and rate limiting
- [ ] Keep dependencies updated
- [ ] Use environment variables for secrets

## Example URLs for Submission

After hosting, you'll provide:

1. **Project Title:** Mood Booster Chatbot - AI-Powered Chatbot API Server
2. **Model URL:** https://huggingface.co/gpt2
3. **Login/Registration Page:** https://your-frontend-url.com
4. **ML Functionality:** https://your-frontend-url.com (after login)

## Bonus Points: Proving Model Hosting

To receive bonus points for hosting the model:

1. **Screenshot Method:**
   - SSH into your server
   - Navigate to model directory
   - Run: `ls -lh models/gpt2/`
   - Screenshot showing model files and sizes

2. **API Method:**
   - Call: `GET /api/model/info`
   - Screenshot showing the model_location path
   - Show the path exists on your server

3. **File Size Verification:**
   - Model files should total ~500MB
   - Show `pytorch_model.bin` or `model.safetensors` file
   - Show `tokenizer.json` and `config.json` files
