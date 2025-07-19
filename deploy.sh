#!/bin/bash

# 🚀 Deploy Script cho Logistics Dashboard Pro
# Script này sẽ hướng dẫn bạn deploy lên Vercel

echo "🚀 === LOGISTICS DASHBOARD PRO - DEPLOY SCRIPT ==="
echo ""

# Kiểm tra Node.js version
echo "📋 Checking Node.js version..."
node --version
npm --version
echo ""

# Kiểm tra dependencies
echo "📦 Installing dependencies..."
npm install
echo ""

# Build project
echo "🔨 Building project..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors before deploying."
    exit 1
fi
echo "✅ Build successful!"
echo ""

# Kiểm tra Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📥 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "🎯 === DEPLOYMENT CHECKLIST ==="
echo "Trước khi deploy, hãy đảm bảo bạn đã:"
echo "✅ 1. Tạo Google Cloud Project và Service Account"
echo "✅ 2. Tạo Telegram Bot qua @BotFather"
echo "✅ 3. Chuẩn bị SendGrid API Key"
echo "✅ 4. Tạo Google Sheets với các sheet: trips, config, carriers"
echo "✅ 5. Push code lên GitHub repository"
echo ""

echo "🔧 === ENVIRONMENT VARIABLES ==="
echo "Bạn sẽ cần cấu hình các biến môi trường sau trong Vercel:"
echo ""
cat .env.example
echo ""

echo "🚀 === READY TO DEPLOY ==="
echo "Chạy lệnh sau để deploy:"
echo ""
echo "vercel --prod"
echo ""
echo "Hoặc deploy qua Vercel Dashboard:"
echo "1. Truy cập https://vercel.com"
echo "2. Import GitHub repository"
echo "3. Cấu hình Environment Variables"
echo "4. Deploy!"
echo ""

echo "📱 === POST-DEPLOY TASKS ==="
echo "Sau khi deploy thành công:"
echo "1. Set Telegram webhook: curl -X POST https://api.telegram.org/bot<TOKEN>/setWebhook -d 'url=https://your-app.vercel.app/api/telegram/webhook'"
echo "2. Test các API endpoints"
echo "3. Kiểm tra cron jobs trong Vercel Functions"
echo ""

echo "✨ Happy Deploying! ✨"
