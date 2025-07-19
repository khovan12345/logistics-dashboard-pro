import { DashboardConfig, GoogleSheetsRow, VehicleTrip } from '@/types';
import { JWT } from 'google-auth-library';
import { google } from 'googleapis';

// Khởi tạo Google Sheets API
const getGoogleAuth = (): JWT | null => {
  const credentials = {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  // Check if credentials are properly configured
  if (
    !credentials.client_email ||
    !credentials.private_key ||
    credentials.client_email.includes('your-') ||
    credentials.private_key.includes('Your-Private-Key-Here')
  ) {
    return null;
  }

  return new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
};

const sheets = google.sheets('v4');

export class GoogleSheetsService {
  private auth: JWT | null;
  private spreadsheetId: string;
  private isConfigured: boolean;

  constructor() {
    this.auth = getGoogleAuth();
    this.isConfigured = !!this.auth;
    this.spreadsheetId = process.env.GOOGLE_SHEETS_ID || '';
  }

  // Ghi dữ liệu chuyến xe vào Google Sheets
  async logTrip(trip: VehicleTrip): Promise<boolean> {
    try {
      if (!this.isConfigured || !this.auth) {
        console.warn('Google Sheets not configured - skipping trip logging');
        return false;
      }

      const row: GoogleSheetsRow = {
        timestamp: new Date().toISOString(),
        tripId: trip.id,
        vehicleId: trip.vehicleId,
        driverName: trip.driverName,
        route: trip.route,
        status: trip.status,
        totalProducts: trip.products.reduce((sum, p) => sum + p.quantity, 0),
        totalCost: trip.cost,
        distance: trip.distance,
        startTime: trip.startTime.toISOString(),
        endTime: trip.endTime?.toISOString(),
        notes: trip.notes,
      };

      const values = [Object.values(row)];

      await sheets.spreadsheets.values.append({
        auth: this.auth,
        spreadsheetId: this.spreadsheetId,
        range: 'Trips!A:L',
        valueInputOption: 'RAW',
        requestBody: {
          values,
        },
      });

      return true;
    } catch (error) {
      console.error('Error logging trip to Google Sheets:', error);
      return false;
    }
  }

  // Đọc cấu hình từ Google Sheets
  async getConfig(): Promise<DashboardConfig | null> {
    try {
      if (!this.isConfigured || !this.auth) {
        console.warn('Google Sheets not configured - skipping config read');
        return null;
      }

      const response = await sheets.spreadsheets.values.get({
        auth: this.auth,
        spreadsheetId: this.spreadsheetId,
        range: 'Config!A:Z',
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        return null;
      }

      // Parse config data từ Google Sheets
      // Format: Key | Value | Description
      const config: Partial<DashboardConfig> = {};

      for (let i = 1; i < rows.length; i++) {
        const [key, value] = rows[i];
        if (key && value) {
          // Parse nested config theo key path
          this.setNestedValue(config, key, this.parseValue(value));
        }
      }

      return config as DashboardConfig;
    } catch (error) {
      console.error('Error reading config from Google Sheets:', error);
      return null;
    }
  }

  // Cập nhật cấu hình trong Google Sheets
  async updateConfig(config: Partial<DashboardConfig>): Promise<boolean> {
    try {
      if (!this.isConfigured || !this.auth) {
        console.warn('Google Sheets not configured - skipping config update');
        return false;
      }

      const flatConfig = this.flattenObject(config);
      const values = [
        ['Key', 'Value', 'Description', 'Last Updated'],
        ...Object.entries(flatConfig).map(([key, value]) => [
          key,
          String(value),
          this.getConfigDescription(key),
          new Date().toISOString(),
        ]),
      ];

      await sheets.spreadsheets.values.update({
        auth: this.auth,
        spreadsheetId: this.spreadsheetId,
        range: 'Config!A:D',
        valueInputOption: 'RAW',
        requestBody: {
          values,
        },
      });

      return true;
    } catch (error) {
      console.error('Error updating config in Google Sheets:', error);
      return false;
    }
  }

  // Lấy dữ liệu trips trong khoảng thời gian
  async getTrips(startDate: Date, endDate: Date): Promise<VehicleTrip[]> {
    try {
      if (!this.isConfigured || !this.auth) {
        console.warn('Google Sheets not configured - returning empty trips');
        return [];
      }

      const response = await sheets.spreadsheets.values.get({
        auth: this.auth,
        spreadsheetId: this.spreadsheetId,
        range: 'Trips!A:L',
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        return [];
      }

      const trips: VehicleTrip[] = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const tripDate = new Date(row[0]);

        if (tripDate >= startDate && tripDate <= endDate) {
          const trip: VehicleTrip = {
            id: row[1],
            vehicleId: row[2],
            driverName: row[3],
            route: row[4],
            status: row[5] as 'started' | 'in_transit' | 'completed' | 'cancelled',
            products: [], // Sẽ được populate từ sheet khác nếu cần
            cost: parseFloat(row[7]) || 0,
            distance: parseFloat(row[8]) || 0,
            fuelConsumption: 0, // Tính toán hoặc lấy từ sheet khác
            startTime: new Date(row[9]),
            endTime: row[10] ? new Date(row[10]) : undefined,
            notes: row[11],
          };
          trips.push(trip);
        }
      }

      return trips;
    } catch (error) {
      console.error('Error fetching trips from Google Sheets:', error);
      return [];
    }
  }

  // Tạo sheet mới cho tháng mới
  async createMonthlySheet(year: number, month: number): Promise<boolean> {
    try {
      if (!this.isConfigured || !this.auth) {
        console.warn('Google Sheets not configured - skipping monthly sheet creation');
        return false;
      }

      const sheetName = `${year}-${month.toString().padStart(2, '0')}`;

      await sheets.spreadsheets.batchUpdate({
        auth: this.auth,
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName,
                  gridProperties: {
                    rowCount: 1000,
                    columnCount: 20,
                  },
                },
              },
            },
          ],
        },
      });

      // Thêm headers
      const headers = [
        'Timestamp',
        'Trip ID',
        'Vehicle ID',
        'Driver',
        'Route',
        'Status',
        'Products',
        'Cost',
        'Distance',
        'Start Time',
        'End Time',
        'Notes',
      ];

      await sheets.spreadsheets.values.update({
        auth: this.auth,
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A1:L1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [headers],
        },
      });

      return true;
    } catch (error) {
      console.error('Error creating monthly sheet:', error);
      return false;
    }
  }

  // Helper methods
  private setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key] as Record<string, unknown>;
    }

    current[keys[keys.length - 1]] = value;
  }

  private parseValue(value: string): string | number | boolean {
    // Try to parse as number
    if (!isNaN(Number(value))) {
      return Number(value);
    }

    // Try to parse as boolean
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;

    // Return as string
    return value;
  }

  private flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
    const flattened: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.assign(flattened, this.flattenObject(value as Record<string, unknown>, newKey));
      } else {
        flattened[newKey] = value;
      }
    }

    return flattened;
  }

  private getConfigDescription(key: string): string {
    const descriptions: Record<string, string> = {
      'sizes.S.dimensions.length': 'Chiều dài Size S (cm)',
      'sizes.S.dimensions.width': 'Chiều rộng Size S (cm)',
      'sizes.S.dimensions.height': 'Chiều cao Size S (cm)',
      'costs.vatRate': 'Thuế VAT (%)',
      'costs.handlingFee': 'Phí bốc xếp (%)',
      'notifications.telegram.enabled': 'Bật thông báo Telegram',
      'notifications.email.enabled': 'Bật thông báo Email',
      // Thêm các descriptions khác
    };

    return descriptions[key] || 'Cấu hình hệ thống';
  }

  // Check service availability
  isAvailable(): boolean {
    return this.isConfigured;
  }
}

// Export singleton instance
export const googleSheetsService = new GoogleSheetsService();
