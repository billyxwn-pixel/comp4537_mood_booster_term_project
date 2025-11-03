# Hosting Recommendations for Mood Booster Chatbot

## Overview

Your application has three components that need hosting:
1. **Frontend** (React/Vite) - Static files
2. **Backend** (Node.js/Express) - API server
3. **LLM Service** (Python/Flask) - AI model hosting

## Important: No Code Changes Required

All recommendations below work with your existing codebase without any modifications. You may need to configure environment variables on your hosting platform, but no code changes are needed.

---

## Option 1: Separate Hosting (Recommended for Different Origins)

### Frontend Hosting Options

**1. Vercel (Recommended)**
- **URL:** https://vercel.com
- **Pros:** Free tier, automatic HTTPS, easy deployment, works great with React
- **How:** Connect your GitHub repo or upload built files from `frontend/dist`
- **Free Tier:** Yes (good for personal projects)
- **Setup:** Build with `npm run build`, deploy `dist` folder

**2. Netlify**
- **URL:** https://www.netlify.com
- **Pros:** Free tier, easy deployment, good performance
- **How:** Connect GitHub or drag-and-drop `frontend/dist` folder
- **Free Tier:** Yes

**3. GitHub Pages**
- **URL:** https://pages.github.com
- **Pros:** Free, easy if you use GitHub
- **How:** Build and push `dist` folder to `gh-pages` branch
- **Free Tier:** Yes

**4. Firebase Hosting**
- **URL:** https://firebase.google.com/products/hosting
- **Pros:** Free tier, fast CDN, easy setup
- **Free Tier:** Yes (generous free tier)

### Backend Hosting Options

**1. Railway (Recommended)**
- **URL:** https://railway.app
- **Pros:** Free tier, easy Node.js deployment, auto HTTPS, environment variables
- **How:** Connect GitHub repo, select `backend` folder, set environment variables
- **Free Tier:** Yes ($5 credit/month)
- **Note:** Perfect for Node.js apps, handles SQLite well

**2. Render**
- **URL:** https://render.com
- **Pros:** Free tier, good for Node.js, PostgreSQL available
- **How:** Connect GitHub, select `backend` folder as root
- **Free Tier:** Yes (with limitations)
- **Note:** Free tier spins down after inactivity

**3. Heroku**
- **URL:** https://www.heroku.com
- **Pros:** Reliable, good documentation
- **How:** Connect GitHub, use buildpack for Node.js
- **Free Tier:** No longer available (paid plans start at $7/month)
- **Note:** Reliable but more expensive

**4. DigitalOcean App Platform**
- **URL:** https://www.digitalocean.com/products/app-platform
- **Pros:** Good performance, flexible
- **How:** Connect GitHub or upload, select Node.js
- **Free Tier:** No (starts around $5/month)
- **Note:** More control, better for production

**5. AWS (Free Tier Available)**
- **Services:** AWS Elastic Beanstalk or EC2
- **URL:** https://aws.amazon.com
- **Pros:** Very flexible, scalable
- **How:** More complex setup, but powerful
- **Free Tier:** Yes (for first year, then pay-as-you-go)
- **Note:** Most complex but most powerful

### LLM Service (Python/Flask) Hosting Options

**⚠️ Important:** The LLM service requires:
- Python 3.8+
- ~2-4GB RAM minimum
- ~5GB disk space (for model files)
- Good internet connection (for initial model download)

**1. Railway (Recommended)**
- **URL:** https://railway.app
- **Pros:** Supports Python, good for ML models, environment variables
- **How:** Connect GitHub, select `llm-service` folder, install Python dependencies
- **Free Tier:** Yes ($5 credit/month)
- **Note:** May need to upgrade for sufficient RAM/disk

**2. Render**
- **URL:** https://render.com
- **Pros:** Free tier, supports Python
- **How:** Connect GitHub, select Python, set build/start commands
- **Free Tier:** Yes (may need paid plan for model hosting)
- **Note:** Free tier may not have enough resources for model

**3. DigitalOcean Droplet**
- **URL:** https://www.digitalocean.com/products/droplets
- **Pros:** Full control, can handle large models
- **How:** Create Ubuntu droplet, SSH in, install Python, upload code
- **Free Tier:** No (starts at ~$6/month)
- **Note:** Best for hosting large models, most control

**4. AWS EC2 or Lambda**
- **URL:** https://aws.amazon.com
- **Pros:** Very flexible, can handle large models
- **How:** Create EC2 instance (t3.medium or larger recommended)
- **Free Tier:** Yes (for first year, then pay)
- **Note:** Most control but more complex setup

**5. Google Cloud Run**
- **URL:** https://cloud.google.com/run
- **Pros:** Serverless, scalable, pay-per-use
- **How:** Containerize Flask app, deploy to Cloud Run
- **Free Tier:** Yes (generous free tier)
- **Note:** Good for occasional use, may need to warm up model

---

## Option 2: Combined Hosting (Easier but Same Origin)

If you want to host everything on one platform:

### Full-Stack Hosting Platforms

**1. Railway (Recommended)**
- Can host all three services on one platform
- **How:** Create three separate services (frontend, backend, llm-service)
- **Pros:** Easy management, one platform, good free tier
- **Cons:** Might not be "separate origins" technically, but can configure different domains

**2. DigitalOcean App Platform**
- Can host multiple apps
- **How:** Create separate apps for each service
- **Pros:** Good performance, unified management
- **Cons:** Paid (no free tier)

**3. AWS (All Services)**
- Very flexible
- **How:** 
  - Frontend: S3 + CloudFront
  - Backend: Elastic Beanstalk or EC2
  - LLM: EC2 (larger instance)
- **Pros:** Most control, scalable
- **Cons:** Complex, can be expensive

---

## Recommended Setup (Cost-Effective)

### Free/Low-Cost Setup:

1. **Frontend:** Vercel or Netlify (FREE)
2. **Backend:** Railway (FREE tier - $5 credit/month)
3. **LLM Service:** Railway or DigitalOcean Droplet (~$6/month if needed for RAM)

### Budget-Friendly Setup:

1. **Frontend:** Vercel (FREE)
2. **Backend:** Railway or Render (FREE tier)
3. **LLM Service:** Railway (may need paid plan) or DigitalOcean Droplet ($6/month)

---

## Environment Variables Setup

You'll need to set these on your hosting platform:

### Backend (.env)
```
PORT=3000 (or platform-provided port)
JWT_SECRET=your_secret_key_here
LLM_SERVICE_URL=https://your-llm-service-url.com
DB_PATH=./database.db
NODE_ENV=production
CLIENT_ORIGIN=https://your-frontend-url.com
```

### LLM Service (.env or environment variables)
```
PORT=5000 (or platform-provided port)
MODEL_PATH=./models
```

### Frontend (Build-time variable)
```
VITE_API_BASE_URL=https://your-backend-api-url.com
```

---

## Deployment Steps (General)

### Frontend:
1. Build: `cd frontend && npm run build`
2. Deploy `dist` folder to hosting service
3. Set `VITE_API_BASE_URL` environment variable

### Backend:
1. Upload `backend` folder to hosting service
2. Set environment variables
3. Install dependencies: `npm install`
4. Start: `npm start`

### LLM Service:
1. Upload `llm-service` folder
2. Set environment variables
3. Create virtual environment and install: `pip install -r requirements.txt`
4. Start: `python app.py` or use `gunicorn` for production

---

## Important Notes

1. **Model Download:** On first run, the LLM service will download ~500MB model. Ensure your hosting has good internet and sufficient disk space.

2. **Model Location for Bonus:** After first run, model files are in `llm-service/models/gpt2/`. You can SSH into your server or use file browser to verify and screenshot.

3. **CORS Configuration:** Backend CORS is already configured. Just update `CLIENT_ORIGIN` in backend `.env` to match your frontend URL.

4. **Database Persistence:** SQLite file needs persistent storage. Most platforms support this, but verify with your hosting provider.

5. **Different Origins:** For milestone requirements, ensure frontend and backend URLs are different (e.g., `myfrontend.vercel.app` and `mybackend.railway.app`).

---

## Quick Setup Recommendations by Platform

### Railway (Easiest - All Services)
- Create account at railway.app
- Connect GitHub repo
- Create three services: frontend, backend, llm-service
- Configure environment variables
- Deploy!

### Vercel + Railway (Recommended)
- Frontend: Vercel (free, great for React)
- Backend: Railway (easy Node.js deployment)
- LLM: Railway or separate Railway service
- Connect both to your GitHub repo

### Netlify + Render
- Frontend: Netlify (free)
- Backend: Render (free tier)
- LLM: Render (may need paid plan) or separate service

---

## Getting Help

Most hosting platforms have excellent documentation:
- **Railway:** https://docs.railway.app
- **Vercel:** https://vercel.com/docs
- **Render:** https://render.com/docs
- **DigitalOcean:** https://docs.digitalocean.com

Good luck with your deployment! 🚀

