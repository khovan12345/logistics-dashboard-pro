import { telegramService } from '@/lib/telegram';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const botInfo = await telegramService.getBotInfo();

    if (!botInfo) {
      return NextResponse.json(
        { success: false, error: 'Bot not configured or unreachable' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: botInfo.id,
        username: botInfo.username,
        firstName: botInfo.first_name,
        isBot: botInfo.is_bot,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error getting bot info:', error);
    return NextResponse.json({ success: false, error: 'Failed to get bot info' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    let result = false;

    switch (action) {
      case 'set_webhook':
        result = await telegramService.setWebhook();
        break;
      case 'delete_webhook':
        result = await telegramService.deleteWebhook();
        break;
      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      success: result,
      action,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error managing bot:', error);
    return NextResponse.json({ success: false, error: 'Failed to manage bot' }, { status: 500 });
  }
}
