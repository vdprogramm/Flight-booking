import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";

import {
  getAdminBooking,
  type AdminBookingDetail,
  type BookingStatus,
  type PaymentStatus,
} from "../../api/admin/booking.api";

import "../../styles/admin-bookings.css";

const bookingLabels: Record<BookingStatus, string> = {
  PENDING: "Chờ thanh toán",
  CONFIRMED: "Đã xác nhận",
  CANCELLED: "Đã hủy",
  EXPIRED: "Hết hạn",
};

const paymentLabels: Record<PaymentStatus, string> = {
  PENDING: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  FAILED: "Thất bại",
  REFUNDED: "Đã hoàn tiền MOCK",
};

const money = (value: string) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value));

const dateTime = (value: string | null) =>
  value ? new Date(value).toLocaleString("vi-VN") : "—";

export default function AdminBookingDetailPage() {
  const { bookingId } = useParams();
  const id = Number(bookingId);

  const [booking, setBooking] =
    useState<AdminBookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      if (!Number.isInteger(id) || id <= 0) {
        setError("Mã booking không hợp lệ.");
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const result = await getAdminBooking(id);
        if (active) setBooking(result);
      } catch {
        if (active) {
          setError("Không thể tải chi tiết booking.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="booking-admin-empty">
        Đang tải chi tiết booking...
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="booking-admin-error">
        {error || "Không tìm thấy booking."}
      </div>
    );
  }

  return (
    <div className="booking-admin">
      <Link
        to="/admin/bookings"
        className="booking-admin-back"
      >
        <ArrowLeft size={17} />
        Quay lại danh sách
      </Link>

      <div className="booking-admin-heading">
        <div>
          <span>CHI TIẾT ĐƠN ĐẶT VÉ</span>
          <h1>{booking.booking_code}</h1>
          <p>Đặt lúc {dateTime(booking.created_at)}</p>
        </div>

        <span
          className={`booking-admin-status ${booking.status.toLowerCase()}`}
        >
          {bookingLabels[booking.status]}
        </span>
      </div>

      <div className="booking-admin-detail-grid">
        <section className="booking-admin-card">
          <h2>Thông tin khách hàng</h2>

          <div className="booking-admin-info">
            <span>Họ tên</span>
            <strong>{booking.user?.name ?? "—"}</strong>
          </div>

          <div className="booking-admin-info">
            <span>Email</span>
            <strong>{booking.user?.email ?? "—"}</strong>
          </div>

          <div className="booking-admin-info">
            <span>Mã khách hàng</span>
            <strong>#{booking.user_id}</strong>
          </div>
        </section>

        <section className="booking-admin-card">
          <h2>Thông tin chuyến bay</h2>

          <div className="booking-admin-flight-route">
            <div>
              <strong>
                {booking.flight?.departure_airport?.code ?? "—"}
              </strong>
              <small>
                {booking.flight?.departure_airport?.city ?? "—"}
              </small>
            </div>

            <ArrowRight size={23} />

            <div>
              <strong>
                {booking.flight?.arrival_airport?.code ?? "—"}
              </strong>
              <small>
                {booking.flight?.arrival_airport?.city ?? "—"}
              </small>
            </div>
          </div>

          <div className="booking-admin-info">
            <span>Số hiệu</span>
            <strong>
              {booking.flight?.flight_number ?? "—"}
            </strong>
          </div>

          <div className="booking-admin-info">
            <span>Khởi hành</span>
            <strong>
              {dateTime(booking.flight?.departure_time ?? null)}
            </strong>
          </div>

          <div className="booking-admin-info">
            <span>Hạ cánh</span>
            <strong>
              {dateTime(booking.flight?.arrival_time ?? null)}
            </strong>
          </div>
        </section>

        <section className="booking-admin-card booking-admin-wide">
          <h2>Hành khách và ghế</h2>

          {booking.passengers?.length ? (
            <div className="booking-admin-table-wrap">
              <table className="booking-admin-table">
                <thead>
                  <tr>
                    <th>Hành khách</th>
                    <th>Ghế</th>
                    <th>Hạng ghế</th>
                    <th>Giá tại thời điểm đặt</th>
                  </tr>
                </thead>

                <tbody>
                  {booking.passengers.map((passenger) => {
                    const assignment = booking.booking_seats?.find(
                      (seat) =>
                        seat.passenger_id === passenger.id
                    );

                    return (
                      <tr key={passenger.id}>
                        <td>
                          <strong>
                            {passenger.last_name}{" "}
                            {passenger.first_name}
                          </strong>
                        </td>

                        <td>
                          {assignment?.flight_seat?.seat_number ??
                            "Không có dữ liệu"}
                        </td>

                        <td>
                          {assignment?.flight_seat?.seat_class
                            ?.name ?? "—"}
                        </td>

                        <td>
                          {assignment
                            ? money(assignment.price)
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Không có dữ liệu hành khách.</p>
          )}

          {booking.booking_seats?.length === 0 && (
            <p className="booking-admin-note">
              Booking không có bản ghi ghế. Nếu booking
              đã hết hạn trước khi áp dụng cơ chế lưu lịch sử,
              dữ liệu ghế cũ có thể đã bị xóa.
            </p>
          )}
        </section>

        <section className="booking-admin-card booking-admin-wide">
          <h2>Lịch sử thanh toán</h2>

          {booking.payments?.length ? (
            <div className="booking-admin-table-wrap">
              <table className="booking-admin-table">
                <thead>
                  <tr>
                    <th>Phương thức</th>
                    <th>Số tiền</th>
                    <th>Trạng thái</th>
                    <th>Mã giao dịch</th>
                    <th>Thanh toán lúc</th>
                  </tr>
                </thead>

                <tbody>
                  {booking.payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{payment.payment_method}</td>
                      <td>{money(payment.amount)}</td>

                      <td>
                        <span
                          className={`booking-admin-status ${payment.status.toLowerCase()}`}
                        >
                          {paymentLabels[payment.status] ??
                            payment.status}
                        </span>
                      </td>

                      <td>
                        {payment.transaction_code || "—"}
                      </td>

                      <td>{dateTime(payment.paid_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Chưa có dữ liệu thanh toán.</p>
          )}
        </section>

        <section className="booking-admin-card booking-admin-wide">
          <h2>Tổng kết đơn đặt vé</h2>

          <div className="booking-admin-info">
            <span>Tổng tiền</span>
            <strong className="booking-admin-amount">
              {money(booking.total_amount)}
            </strong>
          </div>

          <div className="booking-admin-info">
            <span>Trạng thái booking</span>
            <strong>{bookingLabels[booking.status]}</strong>
          </div>

          {booking.status === "PENDING" && (
            <div className="booking-admin-info">
              <span>Hạn thanh toán</span>
              <strong>{dateTime(booking.expires_at)}</strong>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
