import { emailService } from '@/lib/emailService';
import { googleSheetsService } from '@/lib/googleSheets';
import { telegramService } from '@/lib/telegram';
import { VehicleTrip } from '@/types';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const tripData: VehicleTrip = await request.json();

    // Validate required fields
    if (!tripData.id || !tripData.vehicleId || !tripData.driverName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Log trip to Google Sheets
    const logged = await googleSheetsService.logTrip(tripData);

    if (!logged) {
      return NextResponse.json({ success: false, error: 'Failed to log trip' }, { status: 500 });
    }

    // Send notifications if trip is completed
    if (tripData.status === 'completed') {
      await Promise.all([
        telegramService.notifyTripCompleted(tripData),
        emailService.sendTripCompletionNotification(tripData),
      ]);
    }

    return NextResponse.json({
      success: true,
      data: {
        tripId: tripData.id,
        status: tripData.status,
        logged: true,
        notificationsSent: tripData.status === 'completed',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error logging trip:', error);
    return NextResponse.json({ success: false, error: 'Failed to log trip' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Start date and end date are required' },
        { status: 400 },
      );
    }

    const trips = await googleSheetsService.getTrips(new Date(startDate), new Date(endDate));

    // Calculate summary
    const summary = {
      total: trips.length,
      completed: trips.filter((t) => t.status === 'completed').length,
      inTransit: trips.filter((t) => t.status === 'in_transit').length,
      started: trips.filter((t) => t.status === 'started').length,
      cancelled: trips.filter((t) => t.status === 'cancelled').length,
      totalCost: trips.reduce((sum, trip) => sum + trip.cost, 0),
      totalDistance: trips.reduce((sum, trip) => sum + trip.distance, 0),
    };

    return NextResponse.json({
      success: true,
      data: {
        trips,
        summary,
        period: {
          startDate,
          endDate,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching trips:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch trips' }, { status: 500 });
  }
}
