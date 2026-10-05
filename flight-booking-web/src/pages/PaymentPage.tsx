import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getBooking,
  payBooking,
  type Booking,
} from "../api/booking.api";

export default function PaymentPage() {
  const { bookingId } = useParams();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookingId) {
      setError("Không tìm thấy mã booking.");
      setLoading(false);
      return;
    }

    getBooking(Number(bookingId))
      .then(setBooking)
      .catch(() => setError("Không thể tải booking."))
      .finally(() => setLoading(false));
  }, [bookingId]);

  async function handlePay() {
    if (!booking || paying) return;

    try {
      setPaying(true);
      setError("");

      const result = await payBooking(booking.id);
      setBooking(result);
    } catch {
      setError(
        "Thanh toán không thành công. Booking hoặc thời gian giữ ghế có thể đã hết hạn."
      );
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return <div className="page-loading">Đang tải booking...</div>;
  }

  if (!booking) {
    return (
      <section className="dashboard-page">
        <div className="container">
          <p>{error}</p>
          <Link to="/flights">Quay lại tìm chuyến</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-page">
      <div className="container">
        <div className="checkout-card" style={{ maxWidth: 600, margin: "30px auto" }}>
          <h1>
            {booking.status === "CONFIRMED"
              ? "Đặt vé thành công!"
              : "Xác nhận thanh toán"}
          </h1>

          <p>Mã đặt vé: <strong>{booking.booking_code}</strong></p>
          <p>Trạng thái: <strong>{booking.status}</strong></p>
          <p>
            Tổng tiền:{" "}
            <strong>
              {Number(booking.total_amount).toLocaleString("vi-VN")}đ
            </strong>
          </p>

          {error && <div className="search-error">{error}</div>}

          {booking.status === "PENDING" && (
            <>
              <p>
                Đây là thanh toán MOCK phục vụ kiểm thử.
                Không có giao dịch tiền thật.
              </p>

              <button
                className="btn btn-primary"
                type="button"
                disabled={paying}
                onClick={() => void handlePay()}
              >
                {paying
                  ? "Đang xử lý..."
                  : "Xác nhận thanh toán MOCK"}
              </button>
            </>
          )}

          {booking.status === "CONFIRMED" && (
            <p>
              Booking đã được xác nhận. Ghế đã chuyển
              sang trạng thái BOOKED.
            </p>
          )}

          <div style={{ marginTop: 20 }}>
            <Link to="/my-bookings">Xem vé của tôi</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
