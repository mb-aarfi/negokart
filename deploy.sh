#!/bin/bash
# Deployment script for NegoKart

echo "🚀 Starting NegoKart deployment..."

# Check if we're in the right directory
if [ ! -f "backend/main.py" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo "✅ Project structure looks good"
echo ""
echo "📋 Next steps:"
echo "1. Go to https://render.com and sign up"
echo "2. Connect your GitHub repository"
echo "3. Create a new Web Service"
echo "4. Use these settings:"
echo "   - Build Command: pip install -r requirements.txt"
echo "   - Start Command: uvicorn main:app --host 0.0.0.0 --port \$PORT"
echo "   - Environment: Python 3"
echo ""
echo "5. Add these environment variables in Render:"
echo "   - DATABASE_URL: (Render will provide this automatically)"
echo "   - OPENAI_API_KEY: your_openai_api_key"
echo "   - GROQ_API_KEY: your_groq_api_key"
echo "   - DEEPSEEK_API_KEY: your_deepseek_api_key"
echo ""
echo "6. Deploy frontend to Vercel:"
echo "   - Go to https://vercel.com"
echo "   - Import your GitHub repository"
echo "   - Set root directory to 'frontend'"
echo "   - Add environment variable: VITE_API_BASE=https://your-render-app.onrender.com"
echo ""
echo "🎉 Your app will be live at your Vercel URL!"
