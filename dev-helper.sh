#!/bin/bash

# Logistics Dashboard Pro - Development Helper Script
# Tác giả: GitHub Copilot
# Mô tả: Script hỗ trợ phát triển và deployment

echo "🚛 Logistics Dashboard Pro - Development Helper"
echo "================================================"

# Kiểm tra môi trường Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js không được cài đặt"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm không được cài đặt"
    exit 1
fi

echo "✅ Node.js $(node --version)"
echo "✅ npm $(npm --version)"

# Hiển thị menu lựa chọn
echo ""
echo "Chọn hành động:"
echo "1. Cài đặt dependencies"
echo "2. Chạy development server"
echo "3. Build production"
echo "4. Kiểm tra TypeScript"
echo "5. Lint code"
echo "6. Test API endpoints"
echo "7. Test Telegram Bot"
echo "8. Tạo .env.local mẫu"
echo "9. Backup code"
echo "10. Thoát"

read -p "Nhập lựa chọn (1-10): " choice

case $choice in
    1)
        echo "📦 Đang cài đặt dependencies..."
        npm install
        ;;
    2)
        echo "🔥 Khởi động development server..."
        echo "🌐 Truy cập: http://localhost:3000"
        npm run dev
        ;;
    3)
        echo "🏗️ Building production..."
        npm run build
        ;;
    4)
        echo "🔍 Kiểm tra TypeScript..."
        npx tsc --noEmit
        ;;
    5)
        echo "🧹 Linting code..."
        npm run lint
        ;;
    6)
        echo "🧪 Testing API endpoints..."
        echo "Testing dashboard..."
        curl -s -o /dev/null -w "Dashboard: %{http_code}\n" http://localhost:3000/ || echo "❌ Server chưa chạy"
        curl -s -o /dev/null -w "Tracking: %{http_code}\n" http://localhost:3000/tracking || echo "❌ Server chưa chạy"
        ;;
    7)
        echo "🤖 Testing Telegram Bot..."
        ./test-telegram.sh
        ;;
    8)
        echo "📝 Tạo .env.local mẫu..."
        cat > .env.local << 'EOF'
# Google Sheets Configuration
GOOGLE_CLIENT_EMAIL="your-service-account@your-project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----"
GOOGLE_SHEET_ID="your-google-sheet-id"

# Google Drive Configuration
GOOGLE_DRIVE_FOLDER_ID="your-google-drive-folder-id"

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
TELEGRAM_CHAT_ID="your-telegram-chat-id"

# Email Configuration (SendGrid)
SENDGRID_API_KEY="your-sendgrid-api-key"
FROM_EMAIL="your-from-email@domain.com"
TO_EMAIL="your-to-email@domain.com"

# Email Configuration (SMTP) - Alternative
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Logistics Dashboard Pro"

# Cron Configuration
CRON_SECRET="your-cron-secret-key"

# Database Configuration (if using external DB)
DATABASE_URL="your-database-url"
EOF
        echo "✅ Đã tạo .env.local mẫu"
        echo "🔧 Vui lòng cập nhật các giá trị trong file .env.local"
        echo "🤖 Bot info: @reactintegrationkhovanbot (Chat ID: 1361977198)"
        ;;
    9)
        echo "💾 Backup code..."
        timestamp=$(date +%Y%m%d_%H%M%S)
        tar -czf "../logistics-dashboard-backup-$timestamp.tar.gz" . --exclude=node_modules --exclude=.next --exclude=.git
        echo "✅ Backup đã được tạo: ../logistics-dashboard-backup-$timestamp.tar.gz"
        ;;
    10)
        echo "👋 Tạm biệt!"
        exit 0
        ;;
    *)
        echo "❌ Lựa chọn không hợp lệ"
        exit 1
        ;;
esac

echo ""
echo "✅ Hoàn thành!"
