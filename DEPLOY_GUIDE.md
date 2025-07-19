# 🚀 Hướng dẫn Deploy Logistics Dashboard Pro

## Bước 1: Tạo GitHub Repository

1. **Truy cập GitHub.com** và đăng nhập
2. **Tạo repository mới:**
   - Click nút "New" hoặc "+"
   - Repository name: `logistics-dashboard-pro`
   - Description: `Hệ thống quản lý logistics với Next.js, Telegram Bot, Google Sheets`
   - Chọn "Public" hoặc "Private"
   - **KHÔNG** check "Add README file" (vì đã có sẵn)
   - Click "Create repository"

3. **Copy repository URL** (sẽ có dạng: `https://github.com/yourusername/logistics-dashboard-pro.git`)

## Bước 2: Connect và Push code lên GitHub

Chạy lệnh sau (thay YOUR_USERNAME bằng username GitHub của bạn):

```bash
cd /Users/phuccao/Desktop/Dashboard_VanChuyen/logistics-dashboard-pro

# Thêm remote origin
git remote add origin https://github.com/YOUR_USERNAME/logistics-dashboard-pro.git

# Push code lên GitHub
git push -u origin main
```

## Bước 3: Deploy lên Vercel

### 3.1 Cách 1: Deploy qua Vercel Website (Khuyến nghị)

1. **Truy cập [vercel.com](https://vercel.com)** và đăng nhập bằng GitHub
2. **Import project:**
   - Click "New Project"
   - Chọn repository `logistics-dashboard-pro`
   - Click "Import"

3. **Cấu hình deployment:**
   - Framework Preset: **Next.js** (tự động detect)
   - Root Directory: `./` (mặc định)
   - Build Command: `npm run build` (mặc định)
   - Output Directory: `.next` (mặc định)

4. **Thêm Environment Variables:**

   Click "Environment Variables" và thêm:

   ```
   GOOGLE_CLIENT_EMAIL=your-service-account-email@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key\n-----END PRIVATE KEY-----"
   GOOGLE_SHEETS_ID=your-google-sheets-id
   GOOGLE_DRIVE_FOLDER_ID=your-drive-folder-id
   TELEGRAM_BOT_TOKEN=your-telegram-bot-token
   TELEGRAM_CHAT_ID=your-chat-id
   EMAIL_SERVICE=sendgrid
   SENDGRID_API_KEY=SG.your-sendgrid-api-key
   EMAIL_FROM=logistics@yourcompany.com
   EMAIL_TO=manager@yourcompany.com,admin@yourcompany.com
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   CRON_SECRET=your-secret-key
   ```

5. **Deploy:** Click "Deploy"

### 3.2 Cách 2: Deploy qua Vercel CLI

```bash
# Cài đặt Vercel CLI
npm i -g vercel

# Deploy
vercel

# Làm theo hướng dẫn:
# - Link to existing project? N
# - Project name: logistics-dashboard-pro
# - Directory: ./
# - Override settings? N
```

## Bước 4: Cấu hình sau khi deploy

### 4.1 Cập nhật NEXT_PUBLIC_APP_URL

Sau khi deploy thành công, bạn sẽ có URL như: `https://logistics-dashboard-pro-xxx.vercel.app`

Cập nhật env variable `NEXT_PUBLIC_APP_URL` với URL thực tế.

### 4.2 Cấu hình Telegram Webhook

```bash
# Cập nhật webhook URL (thay YOUR_BOT_TOKEN và YOUR_VERCEL_URL)
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://YOUR_VERCEL_URL/api/telegram/webhook"}'
```

### 4.3 Test các endpoints

- **Dashboard:** `https://your-app.vercel.app`
- **Tracking:** `https://your-app.vercel.app/tracking`
- **Bot Info:** `https://your-app.vercel.app/api/telegram/bot-info`

## Bước 5: Thiết lập Cron Jobs (Tự động)

Vercel sẽ tự động chạy cron jobs theo cấu hình trong:

- `/api/cron/daily-report` - Chạy hàng ngày lúc 7:00 AM
- `/api/cron/weekly-report` - Chạy thứ 2 hàng tuần

## 🎯 Checklist sau khi deploy

- [ ] Website hoạt động: `https://your-app.vercel.app`
- [ ] Telegram Bot respond commands: `/start`, `/status`
- [ ] Google Sheets ghi dữ liệu thành công
- [ ] Email reports gửi được
- [ ] Cron jobs hoạt động (kiểm tra trong Vercel dashboard)

## 🔧 Troubleshooting

### Lỗi build

- Kiểm tra logs trong Vercel dashboard
- Đảm bảo tất cả dependencies trong package.json

### Lỗi environment variables

- Kiểm tra format GOOGLE_PRIVATE_KEY (phải có \\n)
- Đảm bảo SENDGRID_API_KEY bắt đầu với "SG."

### Lỗi Telegram

- Kiểm tra BOT_TOKEN và CHAT_ID
- Verify webhook URL: `/api/telegram/bot-info`

## 🚀 Deployment thành công

Dashboard Logistics của bạn đã sẵn sàng hoạt động với:

- ✅ Next.js App Router
- ✅ Telegram Bot Integration
- ✅ Google Sheets sync
- ✅ Email automation
- ✅ Cron jobs tự động
- ✅ Production-ready trên Vercel

**URL Dashboard:** `https://your-app.vercel.app`
**Telegram Bot:** `@reactintegrationkhovanbot`
