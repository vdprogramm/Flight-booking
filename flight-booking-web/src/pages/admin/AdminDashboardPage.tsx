import { useCallback, useEffect, useState } from "react";
import {
  CalendarCheck,
  Plane,
  RefreshCw,
  Ticket,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import api from "../../api/axios";

type DashboardData = {
  users: number;
  flights: number;
  bookings: number;
  confirmed_bookings: number;
  bookings_chart: {
    date: string;
    count: number;
    revenue: number;
  }[];
};

type DashboardResponse = {
  success: boolean;
  data: DashboardData;
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(value);

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get<DashboardResponse>(
        "/admin/dashboard"
      );

      if (!response.data.success) {
        throw new Error("Dashboard API trả về lỗi.");
      }

      setData(response.data.data);
    } catch {
      setError("Không thể tải dữ liệu Dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const cards = [
    {
      key: "flights",
      label: "Tổng chuyến bay",
      value: data?.flights,
      icon: Plane,
    },
    {
      key: "bookings",
      label: "Tổng đơn đặt vé",
      value: data?.bookings,
      icon: Ticket,
    },
    {
      key: "users",
      label: "Tổng khách hàng",
      value: data?.users,
      icon: Users,
    },
    {
      key: "confirmed_bookings",
      label: "Đơn đã xác nhận",
      value: data?.confirmed_bookings,
      icon: CalendarCheck,
    },
  ];

  return (
    <div>
      <div className="admin-page-heading">
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <div>
            <span>TỔNG QUAN HỆ THỐNG</span>
            <h1>Dashboard</h1>
            <p>
              Theo dõi hoạt động đặt vé máy bay của SkyBooking.
            </p>
          </div>

          <button
            type="button"
            className="dashboard-refresh"
            onClick={() => void loadDashboard()}
            disabled={loading}
          >
            <RefreshCw size={17} />
            {loading ? "Đang tải..." : "Làm mới"}
          </button>
        </div>
      </div>

      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}

      <div className="admin-stats">
        {cards.map(({ key, label, value, icon: Icon }) => (
          <div className="admin-stat-card" key={key}>
            <div className="admin-stat-icon">
              <Icon size={22} />
            </div>

            <span>{label}</span>

            <strong>
              {loading && !data
                ? "Đang tải..."
                : value !== undefined
                  ? formatNumber(value)
                  : "—"}
            </strong>
          </div>
        ))}
      </div>

      <div className="dashboard-summary">
        <div className="dashboard-summary-heading">
          <div>
            <h2>Tình hình đặt vé</h2>
            <p>
              Tỷ lệ booking đã xác nhận trên tổng số booking.
            </p>
          </div>
        </div>

        {data ? (
          <>
            <div className="dashboard-progress-info">
              <span>Booking đã xác nhận</span>

              <strong>
                {data.bookings > 0
                  ? (
                      (data.confirmed_bookings /
                        data.bookings) *
                      100
                    ).toFixed(1)
                  : "0.0"}
                %
              </strong>
            </div>

            <div
              className="dashboard-progress"
              role="progressbar"
              aria-label="Tỷ lệ booking đã xác nhận"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={
                data.bookings > 0
                  ? Math.min(
                      100,
                      (data.confirmed_bookings /
                        data.bookings) *
                        100
                    )
                  : 0
              }
            >
              <div
                style={{
                  width: `${
                    data.bookings > 0
                      ? Math.min(
                          100,
                          (data.confirmed_bookings /
                            data.bookings) *
                            100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>

            <div className="dashboard-progress-footer">
              <span>
                {formatNumber(data.confirmed_bookings)}{" "}
                booking đã xác nhận
              </span>

              <span>
                {formatNumber(data.bookings)} booking tổng cộng
              </span>
            </div>
          </>
        ) : (
          <p className="dashboard-no-data">
            {loading
              ? "Đang tải thống kê..."
              : "Chưa có dữ liệu thống kê."}
          </p>
        )}
      </div>

      {data && data.bookings_chart && data.bookings_chart.length > 0 && (
        <div className="admin-charts-grid">
          <div className="dashboard-summary">
            <div className="dashboard-summary-heading">
              <h2>Số lượng Booking (7 ngày qua)</h2>
            </div>
            <div style={{ width: "100%", height: 300, marginTop: 20 }}>
              <ResponsiveContainer>
                <BarChart data={data.bookings_chart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(val: string) => val.split("-").slice(1).join("/")} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }} 
                    labelFormatter={(val) => `Ngày: ${val}`}
                  />
                  <Bar dataKey="count" name="Số booking" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="dashboard-summary">
            <div className="dashboard-summary-heading">
              <h2>Doanh thu xác nhận (7 ngày qua)</h2>
            </div>
            <div style={{ width: "100%", height: 300, marginTop: 20 }}>
              <ResponsiveContainer>
                <AreaChart data={data.bookings_chart}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(val: string) => val.split("-").slice(1).join("/")} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(val) => `${val / 1000000}M`}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatNumber(value)}
                    labelFormatter={(val) => `Ngày: ${val}`}
                  />
                  <Area type="monotone" dataKey="revenue" name="Doanh thu (VND)" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
