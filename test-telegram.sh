#!/bin/bash

# Telegram Bot Test Script for React Integration Bot
# Bot: @reactintegrationkhovanbot
# Chat ID: 1361977198

echo "🤖 Testing Telegram Bot Integration"
echo "==================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if server is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo -e "${RED}❌ Development server not running${NC}"
    echo "Please run: npm run dev"
    exit 1
fi

echo -e "${GREEN}✅ Development server is running${NC}"
echo ""

# Test 1: Bot Info
echo "📋 Test 1: Getting Bot Information"
echo "=================================="
response=$(curl -s -w "HTTPSTATUS:%{http_code}" http://localhost:3000/api/telegram/bot-info)
http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
body=$(echo $response | sed -e 's/HTTPSTATUS:.*//g')

if [ $http_code -eq 200 ]; then
    echo -e "${GREEN}✅ Bot info retrieved successfully${NC}"
    echo "Response: $body"
else
    echo -e "${RED}❌ Failed to get bot info (HTTP $http_code)${NC}"
    echo "Response: $body"
fi

echo ""

# Test 2: Send Test Notification
echo "📨 Test 2: Sending Test Notification"
echo "===================================="
response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
  -X POST http://localhost:3000/api/telegram/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "message": "🧪 Test notification từ Logistics Dashboard Pro\n\n📊 Hệ thống đang hoạt động bình thường\n⏰ Thời gian: '"$(date)"'",
    "type": "info"
  }')

http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
body=$(echo $response | sed -e 's/HTTPSTATUS:.*//g')

if [ $http_code -eq 200 ]; then
    echo -e "${GREEN}✅ Test notification sent successfully${NC}"
    echo "Check your Telegram chat for the message!"
    echo "Response: $body"
else
    echo -e "${RED}❌ Failed to send notification (HTTP $http_code)${NC}"
    echo "Response: $body"
fi

echo ""

# Test 3: Test Trip Creation with Notification
echo "🚛 Test 3: Creating Test Trip"
echo "=============================="
response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
  -X POST http://localhost:3000/api/trips \
  -H "Content-Type: application/json" \
  -d '{
    "driver": "Nguyễn Văn Test",
    "vehicle": "Truck-TEST-001",
    "route": "TP.HCM → Hà Nội",
    "status": "in_progress",
    "products": [{
      "name": "Test Product",
      "brand": "Brand A",
      "size": "M",
      "quantity": 10,
      "weight": 50.5,
      "packageType": "carton"
    }],
    "estimatedDistance": 1200,
    "estimatedCost": 5000000
  }')

http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
body=$(echo $response | sed -e 's/HTTPSTATUS:.*//g')

if [ $http_code -eq 200 ]; then
    echo -e "${GREEN}✅ Test trip created successfully${NC}"
    echo "Response: $body"
else
    echo -e "${RED}❌ Failed to create trip (HTTP $http_code)${NC}"
    echo "Response: $body"
fi

echo ""

# Test 4: Manual Telegram API Test (if token provided)
echo "🔧 Test 4: Direct Telegram API Test"
echo "==================================="

if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  TELEGRAM_BOT_TOKEN not set in environment${NC}"
    echo "To test direct API calls, export your bot token:"
    echo "export TELEGRAM_BOT_TOKEN='your_actual_bot_token'"
else
    echo "Testing direct Telegram API call..."
    telegram_response=$(curl -s -X POST \
      "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
      -H "Content-Type: application/json" \
      -d '{
        "chat_id": "1361977198",
        "text": "🔧 Direct API test từ Logistics Dashboard\n\n✅ Bot hoạt động bình thường!",
        "parse_mode": "Markdown"
      }')

    if echo "$telegram_response" | grep -q '"ok":true'; then
        echo -e "${GREEN}✅ Direct Telegram API call successful${NC}"
        echo "Message sent to chat ID: 1361977198"
    else
        echo -e "${RED}❌ Direct Telegram API call failed${NC}"
        echo "Response: $telegram_response"
    fi
fi

echo ""
echo "🎯 Test Summary"
echo "==============="
echo "Bot Username: @reactintegrationkhovanbot"
echo "Chat ID: 1361977198"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Update .env.local with actual TELEGRAM_BOT_TOKEN"
echo "2. Test webhook setup after deployment"
echo "3. Configure bot commands via @BotFather"
echo "4. Set up cron jobs for automated reports"
echo ""
echo -e "${GREEN}✨ Logistics Dashboard Pro - Telegram Integration Ready!${NC}"
