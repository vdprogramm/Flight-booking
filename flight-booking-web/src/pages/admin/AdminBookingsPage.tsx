import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  Search,
  Ticket,
} from "lucide-react";

import {
  getAdminBookings,
  type AdminBooking,
  type BookingStatus,
} from "../../api/admin/booking.api";

import "../../styles/admin-bookings.css";

const statusLabels: Record<BookingStatus, string> = {
  PENDING: "Chờ thanh toán",
  CONFIRMED: "Đã xác nhận",
  CANCELLED: "Đã hủy",
  EXPIRED: "Hết hạn",
};

const money = (value: string) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value));

const dateTime = (value: string | null) =>
  value
    ? new Date(value).toLocaleString("vi-VN")
    : "—";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const result = await getAdminBookings({
          page,
          search: search || undefined,
          status: (status || undefined) as
            | BookingStatus
            | undefined,
        });

        if (!active) return;

        setBookings(result.data);
        setTotal(result.total);
        setLastPage(result.last_page);
      } catch {
        if (active) {
          setError("Không thể tải danh sách đặt vé.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [page, search, status]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  return (
    <div className="booking-admin">
      <div className="booking-admin-heading">
        <div>
          <span>QUẢN LÝ HỆ THỐNG</span>
          <h1>Đơn đặt vé</h1>
          <p>Theo dõi booking và thanh toán của khách hàng.</p>
        </div>

        <div className="booking-admin-total">
          <Ticket size={20} />
          <strong>{total}</strong>
          <span>đơn phù hợp</span>
        </div>
      </div>

      {error && (
        <div className="booking-admin-error">{error}</div>
      )}

      <section className="booking-admin-panel">
        <div className="booking-admin-toolbar">
          <form onSubmit={handleSearch}>
            <Search size={18} />

            <input
              value={searchInput}
              onChange={(event) =>
                setSearchInput(event.target.value)
              }
              placeholder="Mã booking, tên hoặc email..."
            />

            <button type="submit">Tìm kiếm</button>
          </form>

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả trạng thái</option>

            {(
              [
                "PENDING",
                "CONFIRMED",
                "CANCELLED",
                "EXPIRED",
              ] as BookingStatus[]
            ).map((value) => (
              <option key={value} value={value}>
                {statusLabels[value]}
              </option>
            ))}
          </select>
        </div>

        <div className="booking-admin-table-wrap">
          <table className="booking-admin-table">
            <thead>
              <tr>
                <th>Mã đặt vé</th>
                <th>Khách hàng</th>
                <th>Chuyến bay</th>
                <th>Hành khách</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Ngày đặt</th>
                <th>Chi tiết</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="booking-admin-empty">
                    Đang tải đơn đặt vé...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="booking-admin-empty">
                    Không tìm thấy đơn đặt vé phù hợp.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <strong className="booking-admin-code">
                        {booking.booking_code}
                      </strong>
                    </td>

                    <td>
                      <strong>{booking.user?.name ?? "—"}</strong>
                      <small>{booking.user?.email ?? "—"}</small>
                    </td>

                    <td>
                      <strong>
                        {booking.flight?.flight_number ?? "—"}
                      </strong>

                      <div className="booking-admin-route">
                        {booking.flight?.departure_airport?.code ??
                          "—"}
                        <ArrowRight size={14} />
                        {booking.flight?.arrival_airport?.code ??
                          "—"}
                      </div>
                    </td>

                    <td>{booking.passengers_count ?? 0}</td>

                    <td>
                      <strong>{money(booking.total_amount)}</strong>
                    </td>

                    <td>
                      <span
                        className={`booking-admin-status ${booking.status.toLowerCase()}`}
                      >
                        {statusLabels[booking.status]}
                      </span>
                    </td>

                    <td>{dateTime(booking.created_at)}</td>

                    <td>
                      <Link
                        className="booking-admin-view"
                        to={`/admin/bookings/${booking.id}`}
                        title="Xem chi tiết"
                      >
                        <Eye size={18} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="booking-admin-pagination">
          <span>
            Trang {page}/{lastPage}
          </span>

          <div>
            <button
              disabled={loading || page <= 1}
              onClick={() => setPage((value) => value - 1)}
            >
              Trước
            </button>

            <button
              disabled={loading || page >= lastPage}
              onClick={() => setPage((value) => value + 1)}
            >
              Sau
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
