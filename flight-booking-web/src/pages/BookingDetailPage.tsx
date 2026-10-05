import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  CreditCard,
  Plane,
  Ticket,
  UserRound,
} from "lucide-react";

import {
  getBooking,
  type Booking,
} from "../api/booking.api";

const statusLabels: Record<string, string> = {
  PENDING: "Chờ thanh toán",
  CONFIRMED: "Đã xác nhận",
  CANCELLED: "Đã hủy",
  EXPIRED: "Hết hạn",
};

const paymentLabels: Record<string, string> = {
  PENDING: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  FAILED: "Thanh toán không thành công",
  REFUNDED: "Đã hoàn tiền",
};

function formatMoney(value: string | number) {
  return `${Number(value).toLocaleString("vi-VN")}đ`;
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function BookingDetailPage() {
  const { bookingId } = useParams();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadBooking() {
      try {
        if (!bookingId || !Number.isInteger(Number(bookingId))) {
          throw new Error("Mã booking không hợp lệ.");
        }

        const result = await getBooking(Number(bookingId));

        if (!result || Array.isArray(result)) {
          throw new Error("API trả về dữ liệu booking không hợp lệ.");
        }

        if (active) setBooking(result);
      } catch {
        if (active) {
          setError("Không thể tải chi tiết vé. Vui lòng thử lại.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadBooking();

    return () => {
      active = false;
    };
  }, [bookingId]);

  if (loading) {
    return (
      <section className="dashboard-page">
        <div className="container">
          <div className="empty-state">
            <p>Đang tải chi tiết vé...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || !booking) {
    return (
      <section className="dashboard-page">
        <div className="container">
          <div className="empty-state">
            <h3>Không thể hiển thị vé</h3>
            <p>{error}</p>

            <Link className="btn btn-primary" to="/my-bookings">
              Quay lại vé của tôi
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const flight = booking.flight;
  const payment = booking.payments?.[0];
  const bookingSeats = booking.booking_seats ?? [];

  return (
    <section className="dashboard-page">
      <div className="container">
        <Link className="booking-detail-back" to="/my-bookings">
          <ArrowLeft size={17} />
          Quay lại vé của tôi
        </Link>

        <div className="page-title">
          <span>
            <Ticket size={17} />
            CHI TIẾT ĐẶT VÉ
          </span>

          <h1>Thông tin chuyến bay</h1>

          <p>
            Theo dõi hành trình và trạng thái đặt vé của bạn.
          </p>
        </div>

        <div className="booking-detail-layout">
          <div className="booking-detail-main">
            <article className="booking-detail-card">
              <div className="booking-detail-card-header">
                <div>
                  <span className="my-booking-label">
                    MÃ ĐẶT VÉ
                  </span>

                  <h2>{booking.booking_code}</h2>
                </div>

                <span
                  className={`my-booking-status status-${booking.status.toLowerCase()}`}
                >
                  {statusLabels[booking.status] ?? booking.status}
                </span>
              </div>

              <div className="booking-detail-card-body">
                <div className="booking-detail-airline">
                  <div className="my-booking-plane">
                    <Plane size={23} />
                  </div>

                  <div>
                    <strong>
                      {flight?.airline?.name ?? "Hãng hàng không"}
                    </strong>

                    <p>
                      Chuyến bay{" "}
                      {flight?.flight_number ??
                        `#${booking.flight_id}`}
                    </p>
                  </div>
                </div>

                <div className="booking-detail-route">
                  <div>
                    <span>ĐIỂM KHỞI HÀNH</span>

                    <h2>
                      {flight?.departure_airport?.code ?? "—"}
                    </h2>

                    <strong>
                      {flight?.departure_airport?.city ?? "—"}
                    </strong>

                    <p>
                      {formatDate(flight?.departure_time)}
                    </p>
                  </div>

                  <div className="booking-detail-route-line">
                    <Plane size={24} />

                    <span>Chuyến bay</span>
                  </div>

                  <div className="booking-detail-destination">
                    <span>ĐIỂM ĐẾN</span>

                    <h2>
                      {flight?.arrival_airport?.code ?? "—"}
                    </h2>

                    <strong>
                      {flight?.arrival_airport?.city ?? "—"}
                    </strong>

                    <p>
                      {formatDate(flight?.arrival_time)}
                    </p>
                  </div>
                </div>

                <div className="booking-detail-meta">
                  <div>
                    <CalendarDays size={18} />

                    <span>
                      Ngày đặt
                      <strong>
                        {formatDate(booking.created_at)}
                      </strong>
                    </span>
                  </div>

                  <div>
                    <Clock3 size={18} />

                    <span>
                      Hạn thanh toán
                      <strong>
                        {formatDate(booking.expires_at)}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            </article>

            <article className="booking-detail-card">
              <div className="booking-detail-section-title">
                <UserRound size={20} />

                <h3>Hành khách và ghế ngồi</h3>
              </div>

              {bookingSeats.length > 0 ? (
                <div className="booking-detail-passengers">
                  {bookingSeats.map((item, index) => (
                    <div
                      className="booking-detail-passenger"
                      key={item.id}
                    >
                      <div>
                        <span>
                          Hành khách {index + 1}
                        </span>

                        <strong>
                          {item.passenger
                            ? `${item.passenger.first_name} ${item.passenger.last_name}`
                            : "Chưa có thông tin"}
                        </strong>
                      </div>

                      <div>
                        <span>Ghế</span>

                        <strong>
                          {item.flight_seat?.seat_number ?? "—"}
                        </strong>
                      </div>

                      <div>
                        <span>Giá vé</span>

                        <strong>
                          {formatMoney(item.price)}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="booking-detail-empty">
                  Không còn thông tin ghế trong booking này.
                  {booking.status === "EXPIRED" &&
                    " Ghế đã được giải phóng khi booking hết hạn."}
                </div>
              )}
            </article>
          </div>

          <aside className="booking-detail-sidebar">
            <div className="booking-detail-card">
              <div className="booking-detail-section-title">
                <CreditCard size={20} />

                <h3>Thanh toán</h3>
              </div>

              <div className="booking-detail-summary">
                <div>
                  <span>Phương thức</span>

                  <strong>
                    {payment?.payment_method ?? "—"}
                  </strong>
                </div>

                <div>
                  <span>Trạng thái</span>

                  <strong>
                    {payment
                      ? paymentLabels[payment.status] ??
                        payment.status
                      : "—"}
                  </strong>
                </div>

                <div>
                  <span>Ngày thanh toán</span>

                  <strong>
                    {formatDate(payment?.paid_at)}
                  </strong>
                </div>

                <div className="booking-detail-total">
                  <span>Tổng tiền</span>

                  <strong>
                    {formatMoney(booking.total_amount)}
                  </strong>
                </div>
              </div>

              {booking.status === "PENDING" && (
                <Link
                  className="btn btn-primary booking-detail-pay"
                  to={`/payment/${booking.id}`}
                >
                  Tiếp tục thanh toán
                </Link>
              )}

              {booking.status === "EXPIRED" && (
                <div className="booking-detail-notice">
                  Đặt vé đã hết hạn. Vui lòng tìm chuyến bay
                  và tạo booking mới.
                </div>
              )}

              {booking.status === "CONFIRMED" && (
                <div className="booking-detail-success">
                  Đặt vé đã được xác nhận.
                </div>
              )}

              {booking.status === "CANCELLED" && (
                <div className="booking-detail-notice">
                  Đặt vé đã bị hủy.
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
