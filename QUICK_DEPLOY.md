# 🚀 Quick Deploy Guide

## Deploy trong 5 phút

### 1. Chuẩn bị nhanh

```bash
# Clone và setup
git clone <your-repo>
cd logistics-dashboard-pro
npm install
npm run build  # Kiểm tra build
```

### 2. Deploy ngay lập tức

**Option A: Vercel CLI (Nhanh nhất)**
```bash
npx vercel --prod
```

**Option B: Vercel Dashboard**
1. Truy cập [vercel.com](https://vercel.com)
2. "New Project" → Import từ GitHub
3. Deploy!

### 3. Cấu hình Environment Variables

Trong Vercel Dashboard → Settings → Environment Variables:

```
GOOGLE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
GOOGLE_SHEET_ID=your-sheet-id
GOOGLE_DRIVE_FOLDER_ID=your-folder-id
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
SENDGRID_API_KEY=SG.your-api-key
FROM_EMAIL=noreply@yourdomain.com
TO_EMAIL=admin@yourdomain.com
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_APP_NAME="Logistics Dashboard Pro"
CRON_SECRET=random-secret-string
```

### 4. Test sau deploy

```bash
# Test dashboard
curl https://your-app.vercel.app

# Test API
curl -X POST https://your-app.vercel.app/api/trips \
  -H "Content-Type: application/json" \
  -d '{"driver":"Test","vehicle":"Test","route":"Test"}'
```

### 5. Setup Telegram webhook

```bash
curl -X POST https://api.telegram.org/bot<TOKEN>/setWebhook \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-app.vercel.app/api/telegram/webhook"}'
```

## ✅ Hoàn thành!

Dashboard sẽ available tại: `https://your-app.vercel.app`

---

📖 **Chi tiết đầy đủ:** Xem `DEPLOYMENT.md` để biết thêm chi tiết cấu hình.
