import { emailService } from '@/lib/emailService';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json();

    let result = false;

    switch (type) {
      case 'daily':
        result = await emailService.sendDailyReport(data);
        break;
      case 'weekly':
        result = await emailService.sendWeeklyReport(data);
        break;
      case 'quarterly':
        result = await emailService.sendQuarterlyReport(data);
        break;
      case 'yearly':
        result = await emailService.sendYearlyReport(data);
        break;
      case 'trip_completion':
        result = await emailService.sendTripCompletionNotification(data);
        break;
      case 'custom':
        const { subject, message, isHTML } = data;
        result = await emailService.sendCustomEmail(subject, message, isHTML);
        break;
      default:
        return NextResponse.json({ success: false, error: 'Invalid report type' }, { status: 400 });
    }

    return NextResponse.json({
      success: result,
      type,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error sending email report:', error);
    return NextResponse.json({ success: false, error: 'Failed to send email' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Test email configuration
    const isConnected = await emailService.testConnection();

    return NextResponse.json({
      success: true,
      connected: isConnected,
      service: process.env.EMAIL_SERVICE || 'smtp',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error testing email connection:', error);
    return NextResponse.json({ success: false, error: 'Connection test failed' }, { status: 500 });
  }
}
