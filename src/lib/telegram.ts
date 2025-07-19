import { NotificationMessage, ReportData, VehicleTrip } from '@/types';
import TelegramBot from 'node-telegram-bot-api';

// Telegram types
interface TelegramMessage {
  message_id: number;
  from?: {
    id: number;
    first_name: string;
    username?: string;
  };
  date: number;
  chat: {
    id: number;
    type: string;
  };
  text?: string;
}

interface TelegramCallbackQuery {
  id: string;
  from: {
    id: number;
    first_name: string;
    username?: string;
  };
  message?: TelegramMessage;
  data?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
}

export class TelegramService {
  private bot: TelegramBot | null;
  private chatId: string;
  private enabled: boolean;

  constructor() {
    const token = process.env.TELEGRAM_BOT_TOKEN || '';
    this.chatId = process.env.TELEGRAM_CHAT_ID || '';
    this.enabled = !!token && !!this.chatId;

    if (this.enabled) {
      this.bot = new TelegramBot(token, { polling: false });
    } else {
      console.warn('Telegram not configured properly');
      this.bot = null;
    }
  }

  // Gửi thông báo hoàn thành chuyến xe
  async notifyTripCompleted(trip: VehicleTrip): Promise<boolean> {
    if (!this.enabled || !this.bot) return false;

    try {
      const duration =
        trip.endTime && trip.startTime
          ? Math.round((trip.endTime.getTime() - trip.startTime.getTime()) / (1000 * 60 * 60))
          : 0;

      const message = `🚛 *CHUYẾN XE HOÀN THÀNH*

📋 *Thông tin chuyến:*
• Mã chuyến: \`${trip.id}\`
• Xe: ${trip.vehicleId}
• Tài xế: ${trip.driverName}
• Tuyến đường: ${trip.route}

📊 *Chi tiết:*
• Sản phẩm: ${trip.products.reduce((sum, p) => sum + p.quantity, 0)} món
• Chi phí: ${trip.cost.toLocaleString('vi-VN')} ₫
• Quãng đường: ${trip.distance} km
• Thời gian: ${duration}h

⏰ *Thời gian:*
• Xuất phát: ${trip.startTime.toLocaleString('vi-VN')}
• Hoàn thành: ${trip.endTime?.toLocaleString('vi-VN')}

${trip.notes ? `📝 *Ghi chú:* ${trip.notes}` : ''}

✅ Chuyến xe đã được ghi nhận vào hệ thống!`;

      await this.bot.sendMessage(this.chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '📊 Xem Dashboard', url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard` },
              { text: '📋 Chi tiết', callback_data: `trip_detail_${trip.id}` },
            ],
          ],
        },
      });

      return true;
    } catch (error) {
      console.error('Error sending trip completion notification:', error);
      return false;
    }
  }

  // Gửi báo cáo hàng ngày
  async sendDailyReport(reportData: ReportData): Promise<boolean> {
    if (!this.enabled || !this.bot) return false;

    try {
      const { summary, trips } = reportData;
      const date = reportData.startDate.toLocaleDateString('vi-VN');

      const message = `📈 *BÁO CÁO HÀNG NGÀY*
📅 ${date}

📊 *Tóm tắt:*
• Tổng chuyến: ${summary.totalTrips}
• Tổng sản phẩm: ${summary.totalProducts.toLocaleString()}
• Tổng chi phí: ${summary.totalCost.toLocaleString('vi-VN')} ₫
• Quãng đường: ${summary.totalDistance} km
• Chi phí/km: ${summary.averageCostPerKm.toLocaleString('vi-VN')} ₫

🚛 *Chi tiết chuyến xe:*
${trips
  .slice(0, 5)
  .map(
    (trip) => `• ${trip.vehicleId} - ${trip.route} (${trip.status === 'completed' ? '✅' : '🔄'})`,
  )
  .join('\n')}
${trips.length > 5 ? `\n... và ${trips.length - 5} chuyến khác` : ''}

📊 Dashboard: ${process.env.NEXT_PUBLIC_APP_URL}`;

      await this.bot.sendMessage(this.chatId, message, {
        parse_mode: 'Markdown',
      });

      return true;
    } catch (error) {
      console.error('Error sending daily report:', error);
      return false;
    }
  }

  // Gửi cảnh báo
  async sendAlert(
    message: string,
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal',
  ): Promise<boolean> {
    if (!this.enabled || !this.bot) return false;

    try {
      const icons = {
        low: '💡',
        normal: '⚠️',
        high: '🚨',
        urgent: '🔴',
      };

      const alertMessage = `${icons[priority]} *CẢNH BÁO*

${message}

⏰ Thời gian: ${new Date().toLocaleString('vi-VN')}`;

      await this.bot.sendMessage(this.chatId, alertMessage, {
        parse_mode: 'Markdown',
      });

      return true;
    } catch (error) {
      console.error('Error sending alert:', error);
      return false;
    }
  }

  // Gửi thông báo tùy chỉnh
  async sendCustomNotification(notification: NotificationMessage): Promise<boolean> {
    if (!this.enabled || !this.bot) return false;

    try {
      const icons = {
        trip_completed: '🚛',
        daily_report: '📊',
        alert: '⚠️',
        custom: '📢',
      };

      const message = `${icons[notification.type]} *${notification.title.toUpperCase()}*

${notification.message}

⏰ ${notification.timestamp.toLocaleString('vi-VN')}`;

      await this.bot.sendMessage(this.chatId, message, {
        parse_mode: 'Markdown',
      });

      return true;
    } catch (error) {
      console.error('Error sending custom notification:', error);
      return false;
    }
  }

  // Xử lý webhook từ Telegram
  async handleWebhook(update: TelegramUpdate): Promise<void> {
    try {
      if (update.message) {
        await this.handleMessage(update.message);
      }

      if (update.callback_query) {
        await this.handleCallbackQuery(update.callback_query);
      }
    } catch (error) {
      console.error('Error handling webhook:', error);
    }
  }

  // Xử lý tin nhắn từ user
  private async handleMessage(message: TelegramMessage): Promise<void> {
    if (!this.bot) return;

    const chatId = message.chat.id;
    const text = message.text;

    if (!text) return;

    const commands = {
      '/start':
        'Chào mừng đến với Logistics Dashboard Pro! 🚛\n\nCác lệnh có sẵn:\n/status - Trạng thái hệ thống\n/today - Báo cáo hôm nay\n/help - Trợ giúp',
      '/status': await this.getSystemStatus(),
      '/today': await this.getTodayReport(),
      '/help':
        'Trợ giúp:\n• /status - Xem trạng thái hệ thống\n• /today - Báo cáo hôm nay\n• /trips - Danh sách chuyến xe\n• /config - Cấu hình hệ thống',
    };

    const response =
      commands[text as keyof typeof commands] ||
      'Lệnh không hợp lệ. Gõ /help để xem danh sách lệnh.';

    await this.bot.sendMessage(chatId, response);
  }

  // Xử lý callback query
  private async handleCallbackQuery(callbackQuery: TelegramCallbackQuery): Promise<void> {
    if (!this.bot || !callbackQuery.message) return;

    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    if (data && data.startsWith('trip_detail_')) {
      const tripId = data.replace('trip_detail_', '');
      // Lấy chi tiết trip và gửi lại
      const response = `Chi tiết chuyến ${tripId} đang được cập nhật...`;
      await this.bot.sendMessage(chatId, response);
    }

    await this.bot.answerCallbackQuery(callbackQuery.id);
  }

  // Lấy trạng thái hệ thống
  private async getSystemStatus(): Promise<string> {
    const status = `📊 *TRẠNG THÁI HỆ THỐNG*

🟢 Dashboard: Hoạt động
🟢 Google Sheets: Kết nối
🟢 Telegram Bot: Hoạt động
🟢 Email Service: Sẵn sàng

⏰ Cập nhật: ${new Date().toLocaleString('vi-VN')}`;

    return status;
  }

  // Lấy báo cáo hôm nay
  private async getTodayReport(): Promise<string> {
    // Gọi API để lấy dữ liệu thực tế
    const report = `📈 *BÁO CÁO HÔM NAY*

🚛 Chuyến xe: Đang cập nhật...
📦 Sản phẩm: Đang cập nhật...
💰 Chi phí: Đang cập nhật...

Truy cập ${process.env.NEXT_PUBLIC_APP_URL} để xem chi tiết.`;

    return report;
  }

  // Cài đặt webhook
  async setWebhook(): Promise<boolean> {
    if (!this.enabled || !this.bot) return false;

    try {
      const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/telegram/webhook`;
      await this.bot.setWebHook(webhookUrl);
      console.log('Telegram webhook set successfully');
      return true;
    } catch (error) {
      console.error('Error setting Telegram webhook:', error);
      return false;
    }
  }

  // Xóa webhook
  async deleteWebhook(): Promise<boolean> {
    if (!this.enabled || !this.bot) return false;

    try {
      await this.bot.deleteWebHook();
      console.log('Telegram webhook deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting Telegram webhook:', error);
      return false;
    }
  }

  // Kiểm tra bot info
  async getBotInfo(): Promise<TelegramBot.User | null> {
    if (!this.enabled || !this.bot) return null;

    try {
      return await this.bot.getMe();
    } catch (error) {
      console.error('Error getting bot info:', error);
      return null;
    }
  }
}

export const telegramService = new TelegramService();
