import axios from "axios";
import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  Plane,
  RefreshCw,
  Ticket,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import SeatMap from "../components/SeatMap";
import { useAuth } from "../context/AuthContext";
import {
  getSeats,
  holdSeat,
  releaseSeat,
} from "../api/seat.api";

import type { FlightSeat } from "../types/seat";

const HOLD_SECONDS = 10 * 60;

function formatMoney(value: number) {
  return value.toLocaleString("vi-VN") + "đ";
}

function formatCountdown(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remaining
  ).padStart(2, "0")}`;
}

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ??
      "Không thể thực hiện thao tác. Vui lòng thử lại."
    );
  }

  return "Đã xảy ra lỗi không xác định.";
}

export default function FlightDetailPage() {
  const { flightId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const flightIdNumber = Number(flightId);

  const [seats, setSeats] = useState<FlightSeat[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [now, setNow] = useState(Date.now());

  const loadSeats = useCallback(async () => {
    if (!Number.isInteger(flightIdNumber) || flightIdNumber <= 0) {
      setError("Mã chuyến bay không hợp lệ.");
      setLoading(false);
      return;
    }

    try {
      const data = await getSeats(flightIdNumber);
      setSeats(data);

      const myHeldSeats = data.filter(
        (seat) =>
          seat.status === "HELD" &&
          seat.is_mine === true &&
          seat.held_until !== null &&
          new Date(seat.held_until).getTime() > Date.now()
      );

      setSelectedSeatIds(myHeldSeats.map((seat) => seat.id));

      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [flightIdNumber]);

  useEffect(() => {
    void loadSeats();
  }, [loadSeats]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const selectedSeats = seats.filter((seat) =>
    selectedSeatIds.includes(seat.id)
  );

  const totalPrice = selectedSeats.reduce(
    (total, seat) => total + Number(seat.price),
    0
  );

  const expirationTimes = selectedSeats
    .map((seat) => seat.held_until)
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value).getTime())
    .filter(Number.isFinite);

  const earliestExpiration =
    expirationTimes.length > 0
      ? Math.min(...expirationTimes)
      : null;

  const secondsLeft =
    earliestExpiration === null
      ? HOLD_SECONDS
      : Math.max(
          0,
          Math.ceil((earliestExpiration - now) / 1000)
        );

  const hasExpired =
    selectedSeats.length > 0 &&
    earliestExpiration !== null &&
    secondsLeft === 0;

  const handleSeatSelect = async (seat: FlightSeat) => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: `/flights/${flightIdNumber}`,
        },
      });
      return;
    }

    if (processing) {
      return;
    }

    try {
      setProcessing(true);
      setError("");
      setNotice("");

      const alreadySelected = selectedSeatIds.includes(seat.id);

      if (alreadySelected) {
        await releaseSeat(seat.id);

        setSelectedSeatIds((previous) =>
          previous.filter((id) => id !== seat.id)
        );

        setNotice(`Đã nhả ghế ${seat.seat_number}.`);
      } else {
        await holdSeat(seat.id);

        setSelectedSeatIds((previous) => [
          ...previous,
          seat.id,
        ]);

        setNotice(
          `Đã giữ ghế ${seat.seat_number}. Vui lòng hoàn tất đặt vé trong 10 phút.`
        );
      }

      await loadSeats();
    } catch (err) {
      setError(getErrorMessage(err));
      await loadSeats();
    } finally {
      setProcessing(false);
    }
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      setError("Vui lòng chọn ít nhất một ghế.");
      return;
    }

    if (hasExpired) {
      setError("Thời gian giữ ghế đã hết. Vui lòng chọn lại.");
      return;
    }

    const invalidSeat = selectedSeats.some(
      (seat) =>
        seat.status !== "HELD" ||
        !seat.is_mine ||
        !seat.held_until ||
        new Date(seat.held_until).getTime() <= Date.now()
    );

    if (invalidSeat) {
      setError(
        "Một số ghế không còn được giữ bởi tài khoản của bạn."
      );
      return;
    }

    navigate("/checkout", {
      state: {
        flightId: flightIdNumber,
        seatIds: selectedSeatIds,
      },
    });
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loader" />
        <p>Đang tải sơ đồ ghế...</p>
      </div>
    );
  }

  return (
    <section className="dashboard-page">
      <div className="container">
        <Link to="/flights" className="back-link">
          <ArrowLeft size={17} />
          Quay lại tìm chuyến
        </Link>

        <div className="page-title">
          <span>
            <Plane size={17} />
            CHỌN GHẾ
          </span>

          <h1>Chọn chỗ ngồi của bạn</h1>

          <p>
            Chuyến bay #{flightIdNumber}. Chọn ghế phù hợp
            để tiếp tục đặt vé.
          </p>
        </div>

        {error && (
          <div className="search-error">{error}</div>
        )}

        {notice && (
          <div className="seat-notice">{notice}</div>
        )}

        <div className="seat-page-grid">
          <div className="seat-page-main">
            <div className="seat-section-heading">
              <div>
                <h2>Sơ đồ ghế</h2>
                <p>Chọn ghế còn trống trên chuyến bay.</p>
              </div>

              <button
                type="button"
                className="seat-refresh"
                onClick={() => void loadSeats()}
                disabled={processing}
              >
                <RefreshCw size={16} />
                Làm mới
              </button>
            </div>

            {seats.length === 0 ? (
              <div className="empty-state">
                <h3>Chưa có sơ đồ ghế</h3>
                <p>
                  Chuyến bay này chưa được cấu hình ghế.
                </p>
              </div>
            ) : (
              <SeatMap
                seats={seats}
                selectedSeatIds={selectedSeatIds}
                onSelect={(seat) => void handleSeatSelect(seat)}
                disabled={processing}
              />
            )}
          </div>

          <aside className="seat-summary">
            <div className="seat-summary-header">
              <Ticket size={21} />

              <div>
                <h3>Thông tin đặt vé</h3>
                <p>Chuyến bay #{flightIdNumber}</p>
              </div>
            </div>

            <div className="seat-summary-content">
              <div className="seat-summary-row">
                <span>Số ghế đã chọn</span>
                <strong>{selectedSeats.length}</strong>
              </div>

              {selectedSeats.map((seat) => (
                <div
                  className="seat-summary-item"
                  key={seat.id}
                >
                  <div>
                    <strong>Ghế {seat.seat_number}</strong>
                    <small>
                      {seat.seat_class?.name ?? "Hạng ghế"}
                    </small>
                  </div>

                  <strong>
                    {formatMoney(Number(seat.price))}
                  </strong>
                </div>
              ))}

              {selectedSeats.length === 0 && (
                <div className="seat-summary-empty">
                  Chưa chọn ghế nào.
                </div>
              )}

              {selectedSeats.length > 0 && (
                <div className="seat-hold-timer">
                  <Clock3 size={18} />

                  <div>
                    <span>Thời gian giữ ghế còn lại</span>
                    <strong>
                      {earliestExpiration === null
                        ? "Đang cập nhật..."
                        : formatCountdown(secondsLeft)}
                    </strong>
                  </div>
                </div>
              )}

              <div className="seat-summary-total">
                <span>Tạm tính</span>
                <strong>{formatMoney(totalPrice)}</strong>
              </div>

              <button
                type="button"
                className="btn btn-primary seat-continue"
                disabled={
                  processing ||
                  selectedSeats.length === 0 ||
                  hasExpired
                }
                onClick={handleContinue}
              >
                Tiếp tục đặt vé
                <ArrowRight size={18} />
              </button>

              <p className="seat-summary-note">
                Giá cuối cùng được xác nhận bởi hệ thống
                khi tạo booking.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
