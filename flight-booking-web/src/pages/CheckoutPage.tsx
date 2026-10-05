import axios from "axios";
import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Plane,
  UserRound,
} from "lucide-react";

import { getSeats } from "../api/seat.api";
import {
  createBooking,
  type PassengerInput,
} from "../api/booking.api";
import { useAuth } from "../context/AuthContext";
import type { FlightSeat } from "../types/seat";

interface CheckoutState {
  flightId: number;
  seatIds: number[];
}

type PassengerForm = {
  flight_seat_id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: "" | "MALE" | "FEMALE" | "OTHER";
  document_number: string;
  nationality: string;
};

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const errors = error.response?.data?.errors as
      | Record<string, string[]>
      | undefined;

    if (errors) {
      const firstMessage = Object.values(errors).flat()[0];
      if (firstMessage) return firstMessage;
    }

    return (
      error.response?.data?.message ??
      "Không thể tạo booking. Vui lòng thử lại."
    );
  }

  return "Đã xảy ra lỗi không xác định.";
}

function money(value: number): string {
  return value.toLocaleString("vi-VN") + "đ";
}

export default function CheckoutPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as CheckoutState | null;

  const flightId = state?.flightId;
  const seatIds = state?.seatIds ?? [];

  const [seats, setSeats] = useState<FlightSeat[]>([]);
  const [passengers, setPassengers] = useState<PassengerForm[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!flightId || seatIds.length === 0) {
      setLoading(false);
      return;
    }

    let active = true;

    async function load() {
      try {
        const allSeats = await getSeats(flightId!);

        if (!active) return;

        const selected = seatIds
          .map((id) => allSeats.find((seat) => seat.id === id))
          .filter((seat): seat is FlightSeat => Boolean(seat));

        if (selected.length !== seatIds.length) {
          throw new Error("Không tìm thấy đầy đủ ghế đã chọn.");
        }

        const invalidSeat = selected.some(
          (seat) =>
            seat.status !== "HELD" ||
            !seat.is_mine ||
            !seat.held_until ||
            new Date(seat.held_until).getTime() <= Date.now()
        );

        if (invalidSeat) {
          throw new Error(
            "Có ghế không còn được giữ bởi tài khoản của bạn. Vui lòng chọn lại."
          );
        }

        setSeats(selected);

        const nameParts = user?.name ? user.name.trim().split(" ") : [];
        const lastName = nameParts.length > 1 ? nameParts[0] : "";
        const firstName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : (nameParts.length === 1 ? nameParts[0] : "");

        setPassengers(
          selected.map((seat, index) => {
            const isFirst = index === 0;

            return {
              flight_seat_id: seat.id,
              first_name: isFirst ? firstName : "",
              last_name: isFirst && nameParts.length > 1 ? lastName : "",
              date_of_birth: "",
              gender: "",
              document_number: "",
              nationality: "Vietnam",
            };
          })
        );
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Không thể tải thông tin ghế."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [flightId, location.key, user?.name]);

  function updatePassenger(
    index: number,
    field: keyof PassengerForm,
    value: string
  ) {
    setPassengers((previous) =>
      previous.map((passenger, i) =>
        i === index
          ? { ...passenger, [field]: value }
          : passenger
      )
    );
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!flightId || submitting) return;

    if (passengers.length !== seatIds.length) {
      setError("Thông tin ghế chưa được tải đầy đủ.");
      return;
    }

    const payload: PassengerInput[] = passengers.map(
      (passenger) => ({
        flight_seat_id: passenger.flight_seat_id,
        first_name: passenger.first_name.trim(),
        last_name: passenger.last_name.trim(),
        date_of_birth: passenger.date_of_birth,
        gender: passenger.gender || null,
        document_number:
          passenger.document_number.trim() || null,
        nationality: passenger.nationality.trim() || null,
      })
    );

    try {
      setSubmitting(true);
      setError("");

      const booking = await createBooking(flightId, payload);

      navigate(`/payment/${booking.id}`, {
        replace: true,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (!flightId || seatIds.length === 0) {
    return (
      <section className="dashboard-page">
        <div className="container empty-state">
          <h2>Chưa có ghế được chọn</h2>
          <p>Vui lòng chọn chuyến bay và ghế trước.</p>
          <Link className="btn btn-primary" to="/flights">
            Tìm chuyến bay
          </Link>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loader" />
        <p>Đang kiểm tra ghế đã giữ...</p>
      </div>
    );
  }

  const total = seats.reduce(
    (sum, seat) => sum + Number(seat.price),
    0
  );

  return (
    <section className="dashboard-page">
      <div className="container">
        <Link
          className="back-link"
          to={`/flights/${flightId}`}
        >
          <ArrowLeft size={17} />
          Quay lại chọn ghế
        </Link>

        <div className="page-title">
          <span>
            <Plane size={17} />
            CHECKOUT
          </span>

          <h1>Thông tin hành khách</h1>
          <p>
            Điền thông tin cho từng ghế trước khi xác nhận
            đặt vé.
          </p>
        </div>

        {error && (
          <div className="search-error">{error}</div>
        )}

        {seats.length > 0 && (
          <form
            onSubmit={(event) => void handleSubmit(event)}
            className="checkout-grid"
          >
            <div className="checkout-passengers">
              {passengers.map((passenger, index) => {
                const seat = seats[index];

                return (
                  <div
                    className="checkout-card"
                    key={passenger.flight_seat_id}
                  >
                    <div className="checkout-card-heading">
                      <div>
                        <UserRound size={20} />
                        <h2>Hành khách {index + 1}</h2>
                      </div>

                      <span className="checkout-seat-badge">
                        Ghế {seat.seat_number}
                      </span>
                    </div>

                    <div className="checkout-fields">
                      <label>
                        Họ *
                        <input
                          required
                          maxLength={100}
                          value={passenger.last_name}
                          onChange={(event) =>
                            updatePassenger(
                              index,
                              "last_name",
                              event.target.value
                            )
                          }
                          placeholder="Nguyễn"
                        />
                      </label>

                      <label>
                        Tên *
                        <input
                          required
                          maxLength={100}
                          value={passenger.first_name}
                          onChange={(event) =>
                            updatePassenger(
                              index,
                              "first_name",
                              event.target.value
                            )
                          }
                          placeholder="Văn An"
                        />
                      </label>

                      <label>
                        Ngày sinh *
                        <input
                          required
                          type="date"
                          max={
                            new Date()
                              .toISOString()
                              .slice(0, 10)
                          }
                          value={passenger.date_of_birth}
                          onChange={(event) =>
                            updatePassenger(
                              index,
                              "date_of_birth",
                              event.target.value
                            )
                          }
                        />
                      </label>

                      <label>
                        Giới tính
                        <select
                          value={passenger.gender}
                          onChange={(event) =>
                            updatePassenger(
                              index,
                              "gender",
                              event.target.value
                            )
                          }
                        >
                          <option value="">Không chọn</option>
                          <option value="MALE">Nam</option>
                          <option value="FEMALE">Nữ</option>
                          <option value="OTHER">Khác</option>
                        </select>
                      </label>

                      <label>
                        Số giấy tờ
                        <input
                          maxLength={50}
                          value={passenger.document_number}
                          onChange={(event) =>
                            updatePassenger(
                              index,
                              "document_number",
                              event.target.value
                            )
                          }
                          placeholder="CCCD / Hộ chiếu"
                        />
                      </label>

                      <label>
                        Quốc tịch
                        <input
                          maxLength={100}
                          value={passenger.nationality}
                          onChange={(event) =>
                            updatePassenger(
                              index,
                              "nationality",
                              event.target.value
                            )
                          }
                          placeholder="Vietnam"
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>

            <aside className="checkout-card checkout-summary">
              <div className="checkout-card-heading">
                <div>
                  <CreditCard size={20} />
                  <h2>Chi tiết đặt vé</h2>
                </div>
              </div>

              <p className="checkout-flight">
                Chuyến bay #{flightId}
              </p>

              {seats.map((seat) => (
                <div
                  className="checkout-price-row"
                  key={seat.id}
                >
                  <span>
                    Ghế {seat.seat_number}
                    <small>
                      {seat.seat_class?.name ?? ""}
                    </small>
                  </span>

                  <strong>
                    {money(Number(seat.price))}
                  </strong>
                </div>
              ))}

              <div className="checkout-total">
                <span>Tổng dự kiến</span>
                <strong>{money(total)}</strong>
              </div>

              <button
                className="btn btn-primary checkout-submit"
                type="submit"
                disabled={
                  submitting ||
                  seats.length !== seatIds.length
                }
              >
                {submitting
                  ? "Đang tạo booking..."
                  : "Xác nhận thông tin"}

                {!submitting && <ArrowRight size={18} />}
              </button>

              <p className="checkout-note">
                Chưa thanh toán ở bước này. Hệ thống sẽ
                kiểm tra lại ghế và giá trước khi tạo
                booking.
              </p>
            </aside>
          </form>
        )}
      </div>
    </section>
  );
}
