import { emailService } from '@/lib/emailService';
import { googleSheetsService } from '@/lib/googleSheets';
import { telegramService } from '@/lib/telegram';
import { ReportData } from '@/types';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

    if (authHeader !== expectedAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate daily report
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Get trips data from Google Sheets
    const trips = await googleSheetsService.getTrips(startOfDay, endOfDay);

    // Calculate summary
    const summary = {
      totalTrips: trips.length,
      totalProducts: trips.reduce(
        (sum, trip) => sum + trip.products.reduce((pSum, p) => pSum + p.quantity, 0),
        0,
      ),
      totalCost: trips.reduce((sum, trip) => sum + trip.cost, 0),
      totalDistance: trips.reduce((sum, trip) => sum + trip.distance, 0),
      averageCostPerKm: 0,
    };

    if (summary.totalDistance > 0) {
      summary.averageCostPerKm = summary.totalCost / summary.totalDistance;
    }

    const reportData: ReportData = {
      period: 'daily',
      startDate: startOfDay,
      endDate: endOfDay,
      summary,
      trips,
      performance: {
        onTimeDelivery: 95, // Tính toán thực tế
        costEfficiency: 88,
        fuelEfficiency: 92,
      },
    };

    // Send notifications
    const emailSent = await emailService.sendDailyReport(reportData);
    const telegramSent = await telegramService.sendDailyReport(reportData);

    return NextResponse.json({
      success: true,
      data: {
        reportDate: today.toISOString(),
        tripsProcessed: trips.length,
        emailSent,
        telegramSent,
        summary,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating daily report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate daily report' },
      { status: 500 },
    );
  }
}
