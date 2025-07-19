# 🚀 Deployment Guide - Logistics Dashboard Pro

## 📋 Checklist trước khi deploy

### 1. Chuẩn bị Google Cloud

- [ ] Tạo Google Cloud Project
- [ ] Enable Google Sheets API và Google Drive API
- [ ] Tạo Service Account và tải JSON key
- [ ] Tạo Google Sheets cho dữ liệu
- [ ] Tạo Google Drive folder cho báo cáo

### 2. Chuẩn bị Telegram Bot

- [ ] Tạo bot qua @BotFather
- [ ] Lấy Bot Token
- [ ] Lấy Chat ID (từ @userinfobot)
- [ ] Test bot với tin nhắn đơn giản

### 3. Chuẩn bị Email Service

**Option A: SendGrid**

- [ ] Đăng ký SendGrid account
- [ ] Verify domain/email
- [ ] Tạo API key

**Option B: SMTP**

- [ ] Cấu hình SMTP server (Gmail, Outlook, v.v.)
- [ ] Tạo App Password nếu dùng Gmail

### 4. Deploy lên Vercel

- [ ] Push code lên GitHub repository
- [ ] Kết nối Vercel với GitHub repo
- [ ] Cấu hình environment variables
- [ ] Deploy và test

## 🔧 Cấu hình Environment Variables

Truy cập Vercel Dashboard → Project → Settings → Environment Variables:

```bash
# Google Configuration
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
GOOGLE_SHEET_ID=your-google-sheet-id
GOOGLE_DRIVE_FOLDER_ID=your-drive-folder-id

# Telegram Configuration
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-telegram-chat-id

# Email Configuration
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@yourdomain.com
TO_EMAIL=admin@yourdomain.com

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_APP_NAME="Logistics Dashboard Pro"
CRON_SECRET=your-random-secret-string
```

## 📊 Setup Google Sheets

### Tạo Google Sheets với các sheet

1. **trips** - Dữ liệu chuyến xe

   ```
   A1: id, B1: driver, C1: vehicle, D1: route, E1: status, F1: startTime, G1: endTime, H1: products, I1: totalCost, J1: distance
   ```

2. **config** - Cấu hình hệ thống

   ```
   A1: key, B1: value
   A2: defaultFuelPrice, B2: 25000
   A3: defaultDriverFee, B3: 500000
   A4: sizes.S.volume, B4: 0.125
   A5: sizes.M.volume, B5: 0.216
   A6: sizes.L.volume, B6: 0.343
   ```

3. **carriers** - Thông tin nhà vận chuyển

   ```
   A1: id, B1: name, C1: type, D1: ratePerUnit, E1: capacity, F1: phone, G1: email
   ```

## 🤖 Setup Telegram Bot

1. Tạo bot với @BotFather:

   ```
   /start
   /newbot
   Your Bot Name
   your_bot_username
   ```

2. Set commands:

   ```
   /setcommands
   start - Khởi động bot
   status - Trạng thái hệ thống
   today - Báo cáo hôm nay
   help - Trợ giúp
   ```

3. Set webhook (sau khi deploy):

   ```bash
   curl -X POST https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-app.vercel.app/api/telegram/webhook"}'
   ```

## 📧 Setup SendGrid

1. Domain Authentication:
   - Verify your sending domain
   - Add DNS records theo hướng dẫn

2. Sender Identity:
   - Verify từ email address
   - Hoặc verify toàn bộ domain

3. Template (optional):
   - Tạo dynamic templates cho báo cáo
   - Sử dụng handlebars syntax

## 🧪 Testing sau khi deploy

### Test các API endpoints

```bash
# Test trip creation
curl -X POST https://your-app.vercel.app/api/trips \
  -H "Content-Type: application/json" \
  -d '{"driver":"Test Driver","vehicle":"Test Vehicle","route":"Test Route"}'

# Test notification
curl -X POST https://your-app.vercel.app/api/telegram/send-notification \
  -H "Content-Type: application/json" \
  -d '{"message":"Test notification","type":"info"}'

# Test email
curl -X POST https://your-app.vercel.app/api/email/send-report \
  -H "Content-Type: application/json" \
  -d '{"type":"test","to":"your-email@domain.com"}'

# Test cron (with secret)
curl -X GET "https://your-app.vercel.app/api/cron/daily-report?secret=your-cron-secret"
```

### Test Dashboard

- [ ] Truy cập dashboard: `https://your-app.vercel.app/`
- [ ] Test tạo chuyến xe mới
- [ ] Test gửi notification
- [ ] Test báo cáo

## 🔄 Monitoring và Maintenance

### Vercel Analytics

- Enable Web Analytics trong Vercel dashboard
- Monitor performance và errors

### Logs

- Check Function Logs trong Vercel
- Monitor API calls và errors

### Backup

- Set up automated backup cho Google Sheets
- Monitor Google Drive storage quota

## 🚨 Troubleshooting

### Common Issues

1. **Google API Errors**
   - Check service account permissions
   - Verify API keys format
   - Check API quotas

2. **Telegram Webhook Issues**
   - Verify webhook URL
   - Check bot token
   - Test manual API calls

3. **Email Delivery Issues**
   - Check SendGrid sender verification
   - Verify SMTP credentials
   - Check spam folders

4. **Cron Jobs Not Running**
   - Verify Vercel plan supports cron
   - Check cron secret
   - Monitor function timeouts

### Debug Tools

```bash
# Check bot info
curl https://api.telegram.org/bot<TOKEN>/getMe

# Check webhook info
curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo

# Test SendGrid
curl -X POST https://api.sendgrid.v3/mail/send \
  -H "Authorization: Bearer <API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"personalizations":[{"to":[{"email":"test@example.com"}]}],"from":{"email":"from@example.com"},"subject":"Test","content":[{"type":"text/plain","value":"Test"}]}'
```

---

**📝 Lưu ý:** Sau khi deploy thành công, hãy test toàn bộ workflow từ tạo chuyến xe → thông báo → báo cáo để đảm bảo hệ thống hoạt động đúng.
