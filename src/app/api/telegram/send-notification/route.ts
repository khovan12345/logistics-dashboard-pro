import { telegramService } from '@/lib/telegram';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, priority = 'normal' } = await request.json();

    if (!message) {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 });
    }

    const result = await telegramService.sendAlert(message, priority);

    return NextResponse.json({
      success: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send notification' },
      { status: 500 },
    );
  }
}
