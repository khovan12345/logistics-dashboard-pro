import { telegramService } from '@/lib/telegram';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Verify the request is from Telegram
    const body = await request.json();

    // Handle the webhook update
    await telegramService.handleWebhook(body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling Telegram webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 },
    );
  }
}

export async function GET() {
  // Health check endpoint
  return NextResponse.json({
    status: 'Telegram webhook endpoint is active',
    timestamp: new Date().toISOString(),
  });
}
