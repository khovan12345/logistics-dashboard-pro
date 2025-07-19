# 🤖 Telegram Bot Setup Guide

## Bot Information

- **Bot Name:** React Integration Bot
- **Username:** @reactintegrationkhovanbot
- **Chat ID:** 1361977198

## 🔧 Quick Setup Steps

### 1. Get Bot Token from @BotFather

```
/start
/mybots
@reactintegrationkhovanbot
API Token
```

Copy the token và paste vào `.env.local`:

```bash
TELEGRAM_BOT_TOKEN=your_actual_bot_token_here
```

### 2. Configure Bot Commands

Send to @BotFather:

```
/setcommands
@reactintegrationkhovanbot

start - 🚀 Khởi động bot logistics
status - 📊 Trạng thái hệ thống
today - 📈 Báo cáo hôm nay
trips - 🚛 Danh sách chuyến xe
help - ❓ Trợ giúp và hướng dẫn
config - ⚙️ Cấu hình hệ thống
```

### 3. Test Bot Locally

```bash
# Start development server
npm run dev

# Test bot connection
curl -X GET "http://localhost:3000/api/telegram/bot-info"

# Send test notification
curl -X POST "http://localhost:3000/api/telegram/send-notification" \
  -H "Content-Type: application/json" \
  -d '{"message":"Test từ Logistics Dashboard 🚛","type":"info"}'
```

### 4. Set Webhook (After Deploy)

Replace `YOUR_APP_URL` with your Vercel deployment URL:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "YOUR_APP_URL/api/telegram/webhook"}'
```

### 5. Bot Features Overview

#### 📨 Notifications

- Hoàn thành chuyến xe
- Báo cáo hàng ngày/tuần
- Cảnh báo hệ thống
- Thông báo tùy chỉnh

#### 🔧 Commands

- `/start` - Welcome message với menu
- `/status` - Hệ thống status (trips, costs, etc.)
- `/today` - Báo cáo ngày hôm nay
- `/trips` - Danh sách chuyến xe gần đây
- `/help` - Hướng dẫn sử dụng

#### 📊 Auto Reports

- **Daily:** 7:00 AM - Tổng kết ngày hôm qua
- **Weekly:** Monday 8:00 AM - Tổng kết tuần
- **Monthly:** 1st day 9:00 AM - Tổng kết tháng

## 🧪 Testing Workflow

### Test 1: Bot Info

```bash
curl -X GET "http://localhost:3000/api/telegram/bot-info"
```

Expected response:

```json
{
  "success": true,
  "data": {
    "id": 123456789,
    "username": "reactintegrationkhovanbot",
    "firstName": "React Integration Bot"
  }
}
```

### Test 2: Send Notification

```bash
curl -X POST "http://localhost:3000/api/telegram/send-notification" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "🚛 Test logistics notification",
    "type": "success"
  }'
```

### Test 3: Trip Completion Notification

```bash
curl -X POST "http://localhost:3000/api/trips" \
  -H "Content-Type: application/json" \
  -d '{
    "driver": "Nguyễn Văn A",
    "vehicle": "Truck 001",
    "route": "HCM → Hà Nội",
    "status": "completed"
  }'
```

## 🔐 Security Notes

1. **Protect Bot Token** - Never commit to git
2. **Use Environment Variables** - Store in Vercel settings
3. **Validate Webhooks** - Check incoming requests
4. **Rate Limiting** - Prevent spam

## 📱 Bot Usage Examples

### For Drivers

- Nhận thông báo assignment chuyến xe mới
- Confirm hoàn thành chuyến
- Update status trong trip

### For Managers

- Receive daily/weekly reports
- Get alerts khi có issues
- Monitor fleet performance

### For Admin

- System status updates
- Error notifications
- Configuration changes

## 🚀 Deployment Checklist

- [ ] Bot token configured in Vercel env vars
- [ ] Webhook URL updated to production
- [ ] Commands set via BotFather
- [ ] Test all notification types
- [ ] Verify cron job reports
- [ ] Check error handling

---

**Next Steps:**

1. Get actual bot token from @BotFather
2. Update `.env.local` with real token
3. Test locally before deployment
4. Deploy to Vercel with environment variables
