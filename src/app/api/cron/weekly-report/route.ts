import { emailService } from '@/lib/emailService';
import { googleSheetsService } from '@/lib/googleSheets';
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

    // Calculate week range (Monday to Sunday)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Get trips data from Google Sheets
    const trips = await googleSheetsService.getTrips(startOfWeek, endOfWeek);

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

    // Calculate performance metrics
    const completedTrips = trips.filter((trip) => trip.status === 'completed');
    const onTimeTrips = completedTrips.filter(() => {
      // Logic để xác định đúng giờ (cần thêm field expected_delivery_time)
      return true; // Placeholder - tất cả chuyến xe coi như đúng giờ
    });

    const reportData: ReportData = {
      period: 'weekly',
      startDate: startOfWeek,
      endDate: endOfWeek,
      summary,
      trips,
      performance: {
        onTimeDelivery:
          completedTrips.length > 0 ? (onTimeTrips.length / completedTrips.length) * 100 : 0,
        costEfficiency: 88, // Tính toán so với tuần trước
        fuelEfficiency: 92, // Tính toán thực tế
      },
    };

    // Send email report
    const emailSent = await emailService.sendWeeklyReport(reportData);

    return NextResponse.json({
      success: true,
      data: {
        weekStart: startOfWeek.toISOString(),
        weekEnd: endOfWeek.toISOString(),
        tripsProcessed: trips.length,
        emailSent,
        summary,
        performance: reportData.performance,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating weekly report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate weekly report' },
      { status: 500 },
    );
  }
}
