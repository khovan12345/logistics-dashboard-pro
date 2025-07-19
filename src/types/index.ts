// Types cho Logistics Dashboard
export interface VehicleTrip {
  id: string;
  vehicleId: string;
  driverName: string;
  route: string;
  startTime: Date;
  endTime?: Date;
  status: 'started' | 'in_transit' | 'completed' | 'cancelled';
  products: Product[];
  cost: number;
  distance: number;
  fuelConsumption: number;
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  size: 'S' | 'M' | 'L';
  quantity: number;
  weight: number; // kg
  dimensions: {
    length: number; // cm
    width: number; // cm
    height: number; // cm
  };
  packageType: 'carton' | 'bag_small' | 'bag_large';
}

export interface CarrierInfo {
  id: string;
  name: string;
  type: 'container' | 'truck';
  ratePerUnit: number; // VND
  capacity: {
    volume: number; // m³
    weight: number; // kg
  };
  features: string[];
  contactInfo: {
    phone: string;
    email: string;
  };
}

export interface DashboardConfig {
  sizes: {
    S: SizeConfig;
    M: SizeConfig;
    L: SizeConfig;
  };
  carriers: {
    container: CarrierInfo[];
    truck: CarrierInfo[];
  };
  costs: {
    vatRate: number;
    handlingFee: number;
    insuranceFee: number;
    otherFees: number;
  };
  notifications: {
    telegram: TelegramConfig;
    email: EmailConfig;
  };
}

export interface SizeConfig {
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  defaultQuantity: number;
  averageWeight: number;
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
  notifications: {
    tripCompleted: boolean;
    dailyReport: boolean;
    alerts: boolean;
  };
}

export interface EmailConfig {
  service: 'sendgrid' | 'smtp';
  from: string;
  to: string[];
  enabled: boolean;
  schedules: {
    daily: string;
    weekly: string;
    monthly: string;
    quarterly: string;
    yearly: string;
  };
}

export interface ReportData {
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: Date;
  endDate: Date;
  summary: {
    totalTrips: number;
    totalProducts: number;
    totalCost: number;
    totalDistance: number;
    averageCostPerKm: number;
  };
  trips: VehicleTrip[];
  performance: {
    onTimeDelivery: number;
    costEfficiency: number;
    fuelEfficiency: number;
  };
}

export interface NotificationMessage {
  type: 'trip_completed' | 'daily_report' | 'alert' | 'custom';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: Date;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export interface GoogleSheetsRow {
  timestamp: string;
  tripId: string;
  vehicleId: string;
  driverName: string;
  route: string;
  status: string;
  totalProducts: number;
  totalCost: number;
  distance: number;
  startTime: string;
  endTime?: string;
  notes?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface CronJobData {
  jobType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  scheduledTime: Date;
  executedTime?: Date;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result?: string;
  error?: string;
}
