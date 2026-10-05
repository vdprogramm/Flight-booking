import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Plane,
  Ticket,
} from "lucide-react";

import {
  getMyBookings,
  type Booking,
} from "../api/booking.api";

const statusLabels: Record<string, string> = {
  PENDING: "Chờ thanh toán",
  CONFIRMED: "Đã xác nhận",
  CANCELLED: "Đã hủy",
  EXPIRED: "Hết hạn",
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadBookings() {
      try {
        const result = await getMyBookings();

        if (active) {
          setBookings(result);
        }
      } catch {
        if (active) {
          setError("Không thể tải danh sách vé. Vui lòng thử lại.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadBookings();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="dashboard-page">
      <div className="container">
        <div className="page-title">
          <span>
            <Ticket size={17} />
            BOOKING
          </span>

          <h1>Vé của tôi</h1>

          <p>Theo dõi và quản lý các chuyến bay bạn đã đặt.</p>
        </div>

        {loading && (
          <div className="empty-state">
            <p>Đang tải danh sách vé...</p>
          </div>
        )}

        {!loading && error && (
          <div className="empty-state">
            <h3>Không thể tải dữ liệu</h3>
            <p>{error}</p>

            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Thử lại
            </button>
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">
              <Plane size={30} />
            </div>

            <h3>Bạn chưa có vé nào</h3>

            <p>Khám phá các chuyến bay và bắt đầu hành trình của bạn.</p>

            <Link className="btn btn-primary" to="/flights">
              Tìm chuyến bay <ArrowRight size={17} />
            </Link>
          </div>
        )}

        {!loading && !error && bookings.length > 0 && (
          <div className="my-bookings-list">
            {bookings.map((booking) => (
              <article className="my-booking-card" key={booking.id}>
                <div className="my-booking-header">
                  <div>
                    <span className="my-booking-label">MÃ ĐẶT VÉ</span>

                    <h3>{booking.booking_code}</h3>
                  </div>

                  <span
                    className={`my-booking-status status-${booking.status.toLowerCase()}`}
                  >
                    {statusLabels[booking.status] ?? booking.status}
                  </span>
                </div>

                <div className="my-booking-body">
                  <div className="my-booking-flight">
                    <div className="my-booking-plane">
                      <Plane size={23} />
                    </div>

                    <div>
                      <span>Chuyến bay</span>

                      <strong>
                        {booking.flight?.flight_number ??
                          `#${booking.flight_id}`}
                      </strong>
                    </div>
                  </div>

                  <div>
                    <span className="my-booking-label">NGÀY ĐẶT</span>

                    <p>
                      <CalendarDays size={15} />

                      {booking.created_at
                        ? new Date(booking.created_at).toLocaleDateString(
                            "vi-VN"
                          )
                        : "—"}
                    </p>
                  </div>

                  <div>
                    <span className="my-booking-label">TỔNG TIỀN</span>

                    <strong className="my-booking-price">
                      {Number(booking.total_amount).toLocaleString("vi-VN")}đ
                    </strong>
                  </div>
                </div>

                <div className="my-booking-footer">
                  <Link
                    className="booking-detail-link"
                    to={`/my-bookings/${booking.id}`}
                  >
                    Xem chi tiết
                    <ArrowRight size={16} />
                  </Link>

                  {booking.status === "PENDING" &&
                  new Date(booking.expires_at).getTime() > Date.now() ? (
                    <Link
                      className="btn btn-primary"
                      to={`/payment/${booking.id}`}
                    >
                      Tiếp tục thanh toán
                      <ArrowRight size={17} />
                    </Link>
                  ) : (
                    <span>
                      {booking.status === "CONFIRMED"
                        ? "Đặt vé thành công"
                        : booking.status === "EXPIRED" || booking.status === "PENDING"
                          ? "Đặt vé đã hết hạn"
                          : "Đặt vé đã hủy"}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
