# 🚀 NegoKart Free Deployment Guide

## Overview
This guide will help you deploy NegoKart completely free using:
- **Backend**: Render.com (Free tier)
- **Frontend**: Vercel (Free tier)
- **Database**: Render PostgreSQL (Free tier)

## Prerequisites
- GitHub account
- OpenAI API key (free tier available)
- Groq API key (free tier available)
- DeepSeek API key (free tier available)

## Step 1: Prepare Your Repository

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

## Step 2: Deploy Backend to Render

1. **Go to [Render.com](https://render.com)** and sign up with GitHub

2. **Create a new Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

3. **Configure the service**:
   - **Name**: `negokart-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: `backend`

4. **Add Environment Variables**:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `GROQ_API_KEY`: Your Groq API key  
   - `DEEPSEEK_API_KEY`: Your DeepSeek API key
   - `DATABASE_URL`: Will be auto-provided by Render

5. **Deploy**: Click "Create Web Service"

## Step 3: Deploy Frontend to Vercel

1. **Go to [Vercel.com](https://vercel.com)** and sign up with GitHub

2. **Import your project**:
   - Click "New Project"
   - Import your GitHub repository
   - Set **Root Directory** to `frontend`

3. **Configure build settings**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Add Environment Variable**:
   - `VITE_API_BASE`: `https://your-render-app-name.onrender.com`
   (Replace with your actual Render URL)

5. **Deploy**: Click "Deploy"

## Step 4: Get Free AI API Keys

### OpenAI (Free tier: $5 credit)
1. Go to [OpenAI Platform](https://platform.openai.com)
2. Sign up and get API key
3. Add to Render environment variables

### Groq (Free tier: 14,400 requests/day)
1. Go to [Groq Console](https://console.groq.com)
2. Sign up and get API key
3. Add to Render environment variables

### DeepSeek (Free tier: 1M tokens/month)
1. Go to [DeepSeek Platform](https://platform.deepseek.com)
2. Sign up and get API key
3. Add to Render environment variables

## Step 5: Test Your Deployment

1. **Backend**: Visit `https://your-app.onrender.com` - should show "Hello, AI Negotiator Backend!"
2. **Frontend**: Visit your Vercel URL
3. **Test authentication**: Try registering and logging in
4. **Test AI**: Submit a product list and see AI negotiations

## Troubleshooting

### Backend Issues:
- Check Render logs for errors
- Ensure all environment variables are set
- Verify Python version compatibility

### Frontend Issues:
- Check Vercel build logs
- Verify `VITE_API_BASE` environment variable
- Ensure CORS is properly configured

### Database Issues:
- Render PostgreSQL is automatically provisioned
- Check connection string format

## Cost Breakdown
- **Render**: Free tier (750 hours/month)
- **Vercel**: Free tier (unlimited)
- **OpenAI**: $5 free credit
- **Groq**: Free tier
- **DeepSeek**: Free tier
- **Total**: $0/month (after OpenAI credit)

## Production Considerations

### For Higher Traffic:
- Upgrade Render to paid plan ($7/month)
- Add Redis for caching
- Implement rate limiting
- Add monitoring (Sentry, etc.)

### Security:
- Use HTTPS (automatic with Render/Vercel)
- Implement proper CORS
- Add input validation
- Use environment variables for secrets

## Support
If you encounter issues:
1. Check Render/Vercel logs
2. Verify environment variables
3. Test API endpoints individually
4. Check GitHub issues for common problems

---
