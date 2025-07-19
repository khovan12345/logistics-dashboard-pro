'use client';

import {
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  MapPin,
  Package,
  RefreshCw,
  Send,
  TrendingUp,
  Truck,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface DashboardStats {
  totalTrips: number;
  totalProducts: number;
  totalCost: number;
  totalDistance: number;
  activeTrips: number;
  completedToday: number;
}

interface Trip {
  id: string;
  vehicleId: string;
  driverName: string;
  route: string;
  status: 'started' | 'in_transit' | 'completed' | 'cancelled';
  startTime: string;
  endTime?: string;
  cost: number;
  distance: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTrips: 0,
    totalProducts: 5687,
    totalCost: 80000000,
    totalDistance: 1540,
    activeTrips: 3,
    completedToday: 5,
  });

  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch today's trips
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      const response = await fetch(
        `/api/trips?startDate=${startOfDay.toISOString()}&endDate=${endOfDay.toISOString()}`,
      );
      const data = await response.json();

      if (data.success) {
        setRecentTrips(data.data.trips.slice(0, 10));
        setStats((prevStats) => ({
          ...prevStats,
          totalTrips: data.data.summary.total,
          completedToday: data.data.summary.completed,
          activeTrips: data.data.summary.inTransit + data.data.summary.started,
        }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setNotifications((prev) => [...prev, 'Lỗi khi tải dữ liệu dashboard']);
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = async () => {
    try {
      const response = await fetch('/api/telegram/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Test notification từ Logistics Dashboard Pro! 🚛',
          priority: 'normal',
        }),
      });

      const result = await response.json();
      if (result.success) {
        setNotifications((prev) => [...prev, 'Đã gửi thông báo test thành công!']);
      } else {
        setNotifications((prev) => [...prev, 'Lỗi gửi thông báo: ' + result.error]);
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      setNotifications((prev) => [...prev, 'Lỗi kết nối Telegram']);
    }
  };

  const generateReport = async (type: 'daily' | 'weekly') => {
    try {
      const today = new Date();
      let startDate, endDate;

      if (type === 'daily') {
        startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      } else {
        const dayOfWeek = today.getDay();
        startDate = new Date(today);
        startDate.setDate(today.getDate() - dayOfWeek + 1);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 7);
      }

      // Mock report data - trong thực tế sẽ lấy từ API
      const reportData = {
        period: type,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        summary: {
          totalTrips: stats.totalTrips,
          totalProducts: stats.totalProducts,
          totalCost: stats.totalCost,
          totalDistance: stats.totalDistance,
          averageCostPerKm: stats.totalCost / stats.totalDistance,
        },
        trips: recentTrips,
        performance: {
          onTimeDelivery: 95,
          costEfficiency: 88,
          fuelEfficiency: 92,
        },
      };

      const response = await fetch('/api/email/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          data: reportData,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setNotifications((prev) => [
          ...prev,
          `Đã gửi báo cáo ${type === 'daily' ? 'hàng ngày' : 'tuần'} thành công!`,
        ]);
      } else {
        setNotifications((prev) => [...prev, 'Lỗi gửi báo cáo: ' + result.error]);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setNotifications((prev) => [...prev, 'Lỗi tạo báo cáo']);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_transit':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'started':
        return <Truck className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      started: 'Bắt đầu',
      in_transit: 'Đang vận chuyển',
      completed: 'Hoàn thành',
      cancelled: 'Hủy bỏ',
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Đang tải dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Truck className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Logistics Dashboard Pro</h1>
                <p className="text-sm text-gray-500">HCM → Đông Anh Hà Nội</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => generateReport('daily')}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Download className="w-4 h-4 mr-2" />
                Báo cáo ngày
              </button>
              <button
                onClick={sendTestNotification}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Send className="w-4 h-4 mr-2" />
                Test Telegram
              </button>
              <button
                onClick={fetchDashboardData}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="mb-6">
            {notifications.slice(-3).map((notification, index) => (
              <div key={index} className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-2">
                <div className="flex">
                  <AlertCircle className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0" />
                  <p className="text-sm text-blue-700">{notification}</p>
                  <button
                    onClick={() =>
                      setNotifications((prev) =>
                        prev.filter((_, i) => i !== notifications.length - 3 + index),
                      )
                    }
                    className="ml-auto text-blue-400 hover:text-blue-600"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Chuyến hôm nay</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalTrips}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Tổng sản phẩm</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalProducts.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Chi phí hôm nay</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {(stats.totalCost / 1000000).toFixed(1)}M ₫
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <MapPin className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Quãng đường</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalDistance} km</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Trips */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Chuyến xe gần đây</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Danh sách các chuyến xe trong ngày
            </p>
          </div>
          <ul className="divide-y divide-gray-200">
            {recentTrips.map((trip) => (
              <li key={trip.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getStatusIcon(trip.status)}
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {trip.vehicleId} - {trip.driverName}
                        </p>
                        <p className="text-sm text-gray-500">{trip.route}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {trip.cost.toLocaleString()} ₫
                        </p>
                        <p className="text-sm text-gray-500">{trip.distance} km</p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          trip.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : trip.status === 'in_transit'
                              ? 'bg-yellow-100 text-yellow-800'
                              : trip.status === 'started'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {getStatusText(trip.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => generateReport('weekly')}
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 text-center">Báo cáo tuần</h3>
            <p className="text-sm text-gray-500 text-center mt-2">Gửi báo cáo tổng hợp tuần</p>
          </button>

          <button
            onClick={() => window.open('/calculator', '_blank')}
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 text-center">Calculator Pro</h3>
            <p className="text-sm text-gray-500 text-center mt-2">Tính toán tối ưu vận chuyển</p>
          </button>

          <button
            onClick={() => window.open('/tracking', '_blank')}
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 text-center">Tracking xe</h3>
            <p className="text-sm text-gray-500 text-center mt-2">Ghi nhận chuyến xe mới</p>
          </button>
        </div>
      </div>
    </div>
  );
}
