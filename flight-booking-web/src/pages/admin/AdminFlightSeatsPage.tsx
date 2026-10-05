import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Armchair,
  Plus,
  RefreshCw,
} from "lucide-react";

import {
  generateFlightSeats,
  getFlightSeats,
  getSeatClasses,
  type FlightSeat,
  type SeatClass,
  type SeatClassConfig,
  type SeatStatus,
} from "../../api/admin/flight-seat.api";

import "../../styles/admin-flight-seats.css";

const statusLabels: Record<SeatStatus, string> = {
  AVAILABLE: "Còn trống",
  HELD: "Đang giữ",
  BOOKED: "Đã đặt",
};

const initialConfig = (): SeatClassConfig => ({
  seat_class_id: 0,
  start_row: 1,
  end_row: 1,
  letters: ["A", "B", "C", "D", "E", "F"],
  price: 0,
});

const formatPrice = (value: string | number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value));

export default function AdminFlightSeatsPage() {
  const { flightId } = useParams();
  const id = Number(flightId);
  const validId = Number.isInteger(id) && id > 0;

  const [seats, setSeats] = useState<FlightSeat[]>([]);
  const [seatClasses, setSeatClasses] = useState<SeatClass[]>([]);
  const [configs, setConfigs] = useState<SeatClassConfig[]>([
    initialConfig(),
  ]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedSeat, setSelectedSeat] = useState<FlightSeat | null>(
    null
  );

  async function loadSeats() {
    if (!validId) {
      setError("Mã chuyến bay không hợp lệ.");
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const data = await getFlightSeats(id);
      setSeats(data);
      setError("");
    } catch {
      setError("Không thể tải danh sách ghế.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSeats();
  }, [id]);

  useEffect(() => {
    getSeatClasses()
      .then(setSeatClasses)
      .catch(() => {
        setError("Không thể tải danh sách hạng ghế.");
      });
  }, []);

  const stats = useMemo(
    () => ({
      total: seats.length,
      available: seats.filter((s) => s.status === "AVAILABLE").length,
      held: seats.filter((s) => s.status === "HELD").length,
      booked: seats.filter((s) => s.status === "BOOKED").length,
    }),
    [seats]
  );

  const rows = useMemo(() => {
    const grouped = new Map<number, FlightSeat[]>();

    for (const seat of seats) {
      const match = seat.seat_number.match(/^(\d+)([A-Z]+)$/i);

      if (!match) continue;

      const row = Number(match[1]);
      const existing = grouped.get(row) ?? [];

      existing.push(seat);
      grouped.set(row, existing);
    }

    return [...grouped.entries()]
      .sort(([a], [b]) => a - b)
      .map(([number, rowSeats]) => ({
        number,
        seats: rowSeats.sort((a, b) =>
          a.seat_number.localeCompare(b.seat_number, undefined, {
            numeric: true,
          })
        ),
      }));
  }, [seats]);

  const unmatchedSeats = useMemo(
    () => seats.filter((seat) => !/^\d+[A-Z]+$/i.test(seat.seat_number)),
    [seats]
  );

  function updateConfig(
    index: number,
    changes: Partial<SeatClassConfig>
  ) {
    setConfigs((current) =>
      current.map((config, i) =>
        i === index ? { ...config, ...changes } : config
      )
    );
  }

  function addConfig() {
    setConfigs((current) => [...current, initialConfig()]);
  }

  function removeConfig(index: number) {
    setConfigs((current) => current.filter((_, i) => i !== index));
  }

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving || !validId || seats.length > 0) return;

    setError("");
    setMessage("");

    for (const config of configs) {
      if (config.end_row < config.start_row) {
        setError("Hàng kết thúc phải lớn hơn hoặc bằng hàng bắt đầu.");
        return;
      }

      if (!config.seat_class_id || config.letters.length === 0) {
        setError("Vui lòng chọn hạng ghế và ít nhất một ký tự ghế.");
        return;
      }
    }

    const preview = configs.flatMap((config) => {
      const numbers: string[] = [];

      for (let row = config.start_row; row <= config.end_row; row++) {
        for (const letter of config.letters) {
          numbers.push(`${row}${letter.toUpperCase()}`);
        }
      }

      return numbers;
    });

    if (new Set(preview).size !== preview.length) {
      setError("Cấu hình có số ghế bị trùng giữa các hạng.");
      return;
    }

    if (
      !window.confirm(
        `Tạo ${preview.length} ghế cho chuyến bay này?\n` +
          "API hiện tại không hỗ trợ tạo lại hoặc sửa hàng loạt sau khi tạo."
      )
    ) {
      return;
    }

    setSaving(true);

    try {
      await generateFlightSeats(id, configs);
      setShowForm(false);
      await loadSeats();
      setMessage(`Đã tạo ${preview.length} ghế thành công.`);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const response = err.response;

        if (response?.status === 409) {
          setError("Chuyến bay đã có ghế. Không thể tạo thêm.");
        } else if (response?.status === 422) {
          const errors = response.data?.errors as
            | Record<string, string[]>
            | undefined;

          setError(
            errors
              ? Object.values(errors).flat().join(" ")
              : "Cấu hình ghế không hợp lệ."
          );
        } else {
          setError(
            response?.data?.message ?? "Không thể tạo sơ đồ ghế."
          );
        }
      } else {
        setError("Đã xảy ra lỗi không xác định.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="seat-admin">
      <Link to="/admin/flights" className="seat-admin-back">
        <ArrowLeft size={17} />
        Quay lại chuyến bay
      </Link>

      <div className="seat-admin-heading">
        <div>
          <span>QUẢN LÝ CHUYẾN BAY</span>
          <h1>Quản lý ghế</h1>
          <p>Chuyến bay #{id}</p>
        </div>

        <button
          type="button"
          className="seat-admin-refresh"
          onClick={() => void loadSeats()}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Làm mới
        </button>
      </div>

      {message && <div className="seat-admin-success">{message}</div>}
      {error && <div className="seat-admin-error">{error}</div>}

      <div className="seat-admin-stats">
        {[
          ["Tổng số ghế", stats.total],
          ["Còn trống", stats.available],
          ["Đang giữ", stats.held],
          ["Đã đặt", stats.booked],
        ].map(([label, value]) => (
          <div className="seat-admin-stat" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="seat-admin-panel seat-admin-empty">
          Đang tải sơ đồ ghế...
        </div>
      ) : seats.length === 0 ? (
        <section className="seat-admin-panel seat-admin-empty">
          <Armchair size={42} />
          <h2>Chuyến bay chưa có ghế</h2>
          <p>
            Tạo sơ đồ ghế theo hạng, dãy hàng, ký tự ghế và giá vé.
          </p>

          <button
            type="button"
            className="seat-admin-primary"
            onClick={() => setShowForm((value) => !value)}
          >
            <Plus size={18} />
            {showForm ? "Ẩn cấu hình" : "Tạo sơ đồ ghế"}
          </button>
        </section>
      ) : (
        <section className="seat-admin-panel">
          <div className="seat-admin-panel-heading">
            <div>
              <h2>Sơ đồ ghế</h2>
              <p>Chọn một ghế để xem thông tin chi tiết.</p>
            </div>

            <div className="seat-admin-legend">
              {(
                ["AVAILABLE", "HELD", "BOOKED"] as SeatStatus[]
              ).map((status) => (
                <span key={status}>
                  <i className={status.toLowerCase()} />
                  {statusLabels[status]}
                </span>
              ))}
            </div>
          </div>

          <div className="seat-admin-map-scroll">
            <div className="seat-admin-cabin">
              <div className="seat-admin-cockpit">
                PHÍA TRƯỚC MÁY BAY
              </div>

              {rows.map((row) => (
                <div className="seat-admin-row" key={row.number}>
                  <span className="seat-admin-row-number">
                    {row.number}
                  </span>

                  <div className="seat-admin-row-seats">
                    {row.seats.map((seat) => (
                      <button
                        key={seat.id}
                        type="button"
                        title={`${seat.seat_number} • ${
                          seat.seat_class?.name ?? "Hạng ghế"
                        } • ${statusLabels[seat.status]}`}
                        className={[
                          "seat-admin-seat",
                          seat.status.toLowerCase(),
                          selectedSeat?.id === seat.id ? "selected" : "",
                        ].join(" ")}
                        onClick={() => setSelectedSeat(seat)}
                      >
                        <Armchair size={19} />
                        <span>{seat.seat_number}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {unmatchedSeats.length > 0 && (
                <div className="seat-admin-other">
                  <h3>Ghế có định dạng khác</h3>
                  <div className="seat-admin-row-seats">
                    {unmatchedSeats.map((seat) => (
                      <button
                        key={seat.id}
                        type="button"
                        className={`seat-admin-seat ${seat.status.toLowerCase()}`}
                        onClick={() => setSelectedSeat(seat)}
                      >
                        {seat.seat_number}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {selectedSeat && (
            <div className="seat-admin-detail">
              <h3>Chi tiết ghế {selectedSeat.seat_number}</h3>

              <div>
                <span>Hạng ghế</span>
                <strong>
                  {selectedSeat.seat_class?.name ?? "—"}
                </strong>
              </div>

              <div>
                <span>Giá vé</span>
                <strong>{formatPrice(selectedSeat.price)}</strong>
              </div>

              <div>
                <span>Trạng thái</span>
                <strong>{statusLabels[selectedSeat.status]}</strong>
              </div>

              {selectedSeat.status === "HELD" && (
                <div>
                  <span>Giữ đến</span>
                  <strong>
                    {selectedSeat.held_until
                      ? new Date(
                          selectedSeat.held_until
                        ).toLocaleString("vi-VN")
                      : "—"}
                  </strong>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {!loading && seats.length === 0 && showForm && (
        <section className="seat-admin-panel seat-admin-generator">
          <h2>Cấu hình sơ đồ ghế</h2>
          <p>
            Ví dụ: hàng 1–2, ký tự A,B,C,D tạo ra 8 ghế.
          </p>

          <form onSubmit={handleGenerate}>
            {configs.map((config, index) => (
              <div className="seat-admin-config" key={index}>
                <div className="seat-admin-config-title">
                  <h3>Hạng ghế {index + 1}</h3>

                  {configs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeConfig(index)}
                    >
                      Xóa cấu hình
                    </button>
                  )}
                </div>

                <div className="seat-admin-fields">
                  <label>
                    Hạng ghế
                    <select
                      required
                      value={config.seat_class_id || ""}
                      onChange={(event) =>
                        updateConfig(index, {
                          seat_class_id: Number(event.target.value),
                        })
                      }
                    >
                      <option value="">Chọn hạng ghế</option>
                      {seatClasses.map((seatClass) => (
                        <option
                          key={seatClass.id}
                          value={seatClass.id}
                        >
                          {seatClass.name} ({seatClass.code})
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Hàng bắt đầu
                    <input
                      type="number"
                      min={1}
                      required
                      value={config.start_row}
                      onChange={(event) =>
                        updateConfig(index, {
                          start_row: Number(event.target.value),
                        })
                      }
                    />
                  </label>

                  <label>
                    Hàng kết thúc
                    <input
                      type="number"
                      min={1}
                      required
                      value={config.end_row}
                      onChange={(event) =>
                        updateConfig(index, {
                          end_row: Number(event.target.value),
                        })
                      }
                    />
                  </label>

                  <label>
                    Ký tự ghế
                    <input
                      required
                      value={config.letters.join(",")}
                      placeholder="A,B,C,D,E,F"
                      onChange={(event) =>
                        updateConfig(index, {
                          letters: event.target.value
                            .split(",")
                            .map((letter) =>
                              letter.trim().toUpperCase()
                            )
                            .filter(Boolean),
                        })
                      }
                    />
                  </label>

                  <label>
                    Giá mỗi ghế (VND)
                    <input
                      type="number"
                      min={0}
                      required
                      value={config.price}
                      onChange={(event) =>
                        updateConfig(index, {
                          price: Number(event.target.value),
                        })
                      }
                    />
                  </label>
                </div>
              </div>
            ))}

            <div className="seat-admin-generator-actions">
              <button
                type="button"
                className="seat-admin-secondary"
                onClick={addConfig}
                disabled={saving}
              >
                <Plus size={17} />
                Thêm hạng ghế
              </button>

              <button
                type="submit"
                className="seat-admin-primary"
                disabled={saving || seatClasses.length === 0}
              >
                {saving ? "Đang tạo..." : "Xác nhận tạo ghế"}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
