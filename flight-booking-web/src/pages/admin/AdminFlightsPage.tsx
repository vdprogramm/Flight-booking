import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowRight,
  Ban,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  createAdminFlight,
  deleteAdminFlight,
  getAdminFlights,
  updateAdminFlight,
  cancelAdminFlight,
  type Flight,
  type FlightPayload,
  type FlightStatus,
} from "../../api/admin/flight.api";

import {
  getAirlines,
  type Airline,
} from "../../api/admin/airline.api";

import {
  getAdminAirports,
  type Airport,
} from "../../api/admin/airport.api";

import "../../styles/admin-flights.css";

const statuses: FlightStatus[] = [
  "SCHEDULED",
  "DELAYED",
  "CANCELLED",
  "COMPLETED",
];

const statusLabels: Record<FlightStatus, string> = {
  SCHEDULED: "Đúng lịch",
  DELAYED: "Hoãn chuyến",
  CANCELLED: "Đã hủy",
  COMPLETED: "Hoàn thành",
};

const initialForm: FlightPayload = {
  airline_id: 0,
  departure_airport_id: 0,
  arrival_airport_id: 0,
  flight_number: "",
  departure_time: "",
  arrival_time: "",
  aircraft_code: "",
  status: "SCHEDULED",
};

function localDateTime(value: string): string {
  if (!value) return "";

  // API trả ISO có timezone: chuyển sang giờ địa phương
  // để hiển thị đúng trong input datetime-local.
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 16).replace(" ", "T");
  }

  const local = new Date(
    date.getTime() - date.getTimezoneOffset() * 60_000
  );

  return local.toISOString().slice(0, 16);
}

function displayDateTime(value: string): string {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("vi-VN", {
        dateStyle: "short",
        timeStyle: "short",
      });
}

export default function AdminFlightsPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [airports, setAirports] = useState<Airport[]>([]);

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [statusFilter, setStatusFilter] = useState("");
  const [airlineFilter, setAirlineFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Flight | null>(null);
  const [form, setForm] = useState<FlightPayload>(initialForm);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string[]>
  >({});

  async function loadFlights() {
    setLoading(true);

    try {
      const result = await getAdminFlights({
        page,
        status: statusFilter || undefined,
        airline_id: airlineFilter
          ? Number(airlineFilter)
          : undefined,
      });

      setFlights(result.data);
      setLastPage(result.last_page);
      setTotal(result.total);
    } catch {
      setError("Không thể tải danh sách chuyến bay.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadFlights();
  }, [page, statusFilter, airlineFilter]);

  useEffect(() => {
    async function loadOptions() {
      try {
        const [airlineData, airportData] = await Promise.all([
          getAirlines(),
          getAdminAirports(),
        ]);

        setAirlines(airlineData);
        setAirports(airportData);
      } catch {
        setError("Không thể tải danh sách hãng hoặc sân bay.");
      }
    }

    void loadOptions();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ ...initialForm });
    setFieldErrors({});
    setError("");
    setModalOpen(true);
  }

  function openEdit(flight: Flight) {
    setEditing(flight);

    setForm({
      airline_id: flight.airline_id,
      departure_airport_id: flight.departure_airport_id,
      arrival_airport_id: flight.arrival_airport_id,
      flight_number: flight.flight_number,
      departure_time: localDateTime(flight.departure_time),
      arrival_time: localDateTime(flight.arrival_time),
      aircraft_code: flight.aircraft_code ?? "",
      status: flight.status,
    });

    setFieldErrors({});
    setError("");
    setModalOpen(true);
  }

  function updateField<K extends keyof FlightPayload>(
    key: K,
    value: FlightPayload[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    setError("");
    setMessage("");
    setFieldErrors({});

    if (
      form.departure_airport_id === form.arrival_airport_id
    ) {
      setFieldErrors({
        arrival_airport_id: [
          "Sân bay đến phải khác sân bay đi.",
        ],
      });
      return;
    }

    if (
      new Date(form.arrival_time).getTime() <=
      new Date(form.departure_time).getTime()
    ) {
      setFieldErrors({
        arrival_time: [
          "Giờ đến phải sau giờ khởi hành.",
        ],
      });
      return;
    }

    setSaving(true);

    try {
      // datetime-local là giờ địa phương.
      // Gửi ISO có múi giờ rõ ràng cho Laravel.
      const payload: FlightPayload = {
        ...form,
        flight_number: form.flight_number.trim().toUpperCase(),
        aircraft_code: form.aircraft_code.trim(),
        departure_time: new Date(
          form.departure_time
        ).toISOString(),
        arrival_time: new Date(
          form.arrival_time
        ).toISOString(),
      };

      if (editing) {
        await updateAdminFlight(editing.id, payload);
        setMessage("Cập nhật chuyến bay thành công.");
      } else {
        await createAdminFlight(payload);
        setMessage("Thêm chuyến bay thành công.");
      }

      setModalOpen(false);
      await loadFlights();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 422) {
          setFieldErrors(err.response.data?.errors ?? {});
          setError("Vui lòng kiểm tra thông tin chuyến bay.");
        } else if (err.response?.status === 409) {
          setError(
            "Chuyến bay đã có booking xác nhận, không thể chỉnh sửa."
          );
        } else {
          setError(
            err.response?.data?.message ??
              "Không thể lưu chuyến bay."
          );
        }
      } else {
        setError("Đã xảy ra lỗi không xác định.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel(flight: Flight) {
    if (cancellingId !== null) return;

    if (
      !window.confirm(
        `Hủy chuyến bay ${flight.flight_number}?\n\n` +
        "Các booking đang hoạt động sẽ bị hủy. " +
        "Thanh toán MOCK đã PAID sẽ chuyển thành REFUNDED."
      )
    ) {
      return;
    }

    setCancellingId(flight.id);
    setError("");
    setMessage("");

    try {
      await cancelAdminFlight(flight.id);

      setMessage(`Đã hủy chuyến bay ${flight.flight_number}.`);
      await loadFlights();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const response = err.response;

        setError(
          response?.status === 422
            ? "Chuyến bay đã hoàn thành hoặc không đủ điều kiện hủy."
            : response?.data?.message ?? "Không thể hủy chuyến bay."
        );
      } else {
        setError("Đã xảy ra lỗi khi hủy chuyến bay.");
      }
    } finally {
      setCancellingId(null);
    }
  }

  async function handleDelete(flight: Flight) {
    if (deletingId !== null) return;

    if (
      !window.confirm(
        `Xóa vĩnh viễn chuyến bay ${flight.flight_number}?\n` +
          "Chỉ thực hiện với chuyến bay chưa có booking."
      )
    ) {
      return;
    }

    setDeletingId(flight.id);
    setError("");
    setMessage("");

    try {
      await deleteAdminFlight(flight.id);
      setMessage(`Đã xóa chuyến bay ${flight.flight_number}.`);

      // Nếu xóa bản ghi cuối của trang, quay về trang trước.
      if (flights.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadFlights();
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setError("Không thể xóa chuyến bay đã có booking.");
      } else {
        setError("Không thể xóa chuyến bay.");
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flights-admin">
      <div className="flights-admin-heading">
        <div>
          <span>QUẢN LÝ HỆ THỐNG</span>
          <h1>Chuyến bay</h1>
          <p>Quản lý lịch bay, tuyến bay và trạng thái khai thác.</p>
        </div>

        <button
          className="flights-admin-primary"
          onClick={openCreate}
        >
          <Plus size={18} />
          Thêm chuyến bay
        </button>
      </div>

      {message && (
        <div className="flights-admin-success">{message}</div>
      )}

      {error && (
        <div className="flights-admin-error">{error}</div>
      )}

      <section className="flights-admin-panel">
        <div className="flights-admin-toolbar">
          <div>
            <h2>Danh sách chuyến bay</h2>
            <p>{total} chuyến bay trong hệ thống</p>
          </div>

          <div className="flights-admin-filters">
            <select
              value={airlineFilter}
              onChange={(event) => {
                setPage(1);
                setAirlineFilter(event.target.value);
              }}
            >
              <option value="">Tất cả hãng</option>
              {airlines.map((airline) => (
                <option key={airline.id} value={airline.id}>
                  {airline.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => {
                setPage(1);
                setStatusFilter(event.target.value);
              }}
            >
              <option value="">Tất cả trạng thái</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flights-admin-table-wrap">
          <table className="flights-admin-table">
            <thead>
              <tr>
                <th>Chuyến bay</th>
                <th>Tuyến bay</th>
                <th>Khởi hành</th>
                <th>Hạ cánh</th>
                <th>Ghế</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="flights-admin-empty">
                    Đang tải chuyến bay...
                  </td>
                </tr>
              ) : flights.length === 0 ? (
                <tr>
                  <td colSpan={7} className="flights-admin-empty">
                    Chưa có chuyến bay phù hợp.
                  </td>
                </tr>
              ) : (
                flights.map((flight) => (
                  <tr key={flight.id}>
                    <td>
                      <strong>{flight.flight_number}</strong>
                      <small>{flight.airline?.name ?? "—"}</small>
                      <small>{flight.aircraft_code || "—"}</small>
                    </td>

                    <td>
                      <div className="flights-admin-route">
                        <strong>
                          {flight.departure_airport?.code ?? "—"}
                        </strong>
                        <ArrowRight size={17} />
                        <strong>
                          {flight.arrival_airport?.code ?? "—"}
                        </strong>
                      </div>
                      <small>
                        {flight.departure_airport?.city ?? "—"}
                        {" → "}
                        {flight.arrival_airport?.city ?? "—"}
                      </small>
                    </td>

                    <td>
                      {displayDateTime(flight.departure_time)}
                    </td>

                    <td>
                      {displayDateTime(flight.arrival_time)}
                    </td>

                    <td>{flight.seats_count ?? 0}</td>

                    <td>
                      <span
                        className={`flights-admin-status ${flight.status.toLowerCase()}`}
                      >
                        {statusLabels[flight.status] ?? flight.status}
                      </span>
                    </td>

                    <td>
                      <div className="flights-admin-actions">
                        <button
                          title="Chỉnh sửa"
                          onClick={() => openEdit(flight)}
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          title="Xóa chuyến bay"
                          className="danger"
                          disabled={deletingId !== null}
                          onClick={() => void handleDelete(flight)}
                        >
                          <Trash2 size={17} />
                        </button>

                        {flight.status !== "CANCELLED" &&
                          flight.status !== "COMPLETED" && (
                            <button
                              type="button"
                              title="Hủy chuyến bay"
                              className="danger"
                              disabled={cancellingId !== null}
                              onClick={() => void handleCancel(flight)}
                            >
                              <Ban size={17} />
                            </button>
                          )}

                        <Link
                          to={`/admin/flights/${flight.id}/seats`}
                          title="Xem ghế"
                        >
                          Ghế
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flights-admin-pagination">
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

      {modalOpen && (
        <div className="flights-admin-overlay">
          <div
            className="flights-admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="flight-modal-title"
          >
            <div className="flights-admin-modal-header">
              <div>
                <h2 id="flight-modal-title">
                  {editing ? "Chỉnh sửa chuyến bay" : "Thêm chuyến bay"}
                </h2>
                <p>Thông tin lịch trình và máy bay.</p>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={() => setModalOpen(false)}
                aria-label="Đóng"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="flights-admin-form">
                <label>
                  Hãng hàng không *
                  <select
                    required
                    value={form.airline_id || ""}
                    onChange={(event) =>
                      updateField(
                        "airline_id",
                        Number(event.target.value)
                      )
                    }
                  >
                    <option value="">Chọn hãng</option>
                    {airlines.map((airline) => (
                      <option key={airline.id} value={airline.id}>
                        {airline.name} ({airline.code})
                      </option>
                    ))}
                  </select>
                  {fieldErrors.airline_id && (
                    <small>{fieldErrors.airline_id[0]}</small>
                  )}
                </label>

                <label>
                  Số hiệu chuyến bay *
                  <input
                    required
                    maxLength={20}
                    value={form.flight_number}
                    onChange={(event) =>
                      updateField(
                        "flight_number",
                        event.target.value.toUpperCase()
                      )
                    }
                    placeholder="VD: VN216"
                  />
                  {fieldErrors.flight_number && (
                    <small>{fieldErrors.flight_number[0]}</small>
                  )}
                </label>

                <label>
                  Sân bay đi *
                  <select
                    required
                    value={form.departure_airport_id || ""}
                    onChange={(event) =>
                      updateField(
                        "departure_airport_id",
                        Number(event.target.value)
                      )
                    }
                  >
                    <option value="">Chọn sân bay đi</option>
                    {airports.map((airport) => (
                      <option key={airport.id} value={airport.id}>
                        {airport.code} — {airport.city}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Sân bay đến *
                  <select
                    required
                    value={form.arrival_airport_id || ""}
                    onChange={(event) =>
                      updateField(
                        "arrival_airport_id",
                        Number(event.target.value)
                      )
                    }
                  >
                    <option value="">Chọn sân bay đến</option>
                    {airports.map((airport) => (
                      <option key={airport.id} value={airport.id}>
                        {airport.code} — {airport.city}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.arrival_airport_id && (
                    <small>{fieldErrors.arrival_airport_id[0]}</small>
                  )}
                </label>

                <label>
                  Giờ khởi hành *
                  <input
                    required
                    type="datetime-local"
                    value={form.departure_time}
                    onChange={(event) =>
                      updateField(
                        "departure_time",
                        event.target.value
                      )
                    }
                  />
                  {fieldErrors.departure_time && (
                    <small>{fieldErrors.departure_time[0]}</small>
                  )}
                </label>

                <label>
                  Giờ hạ cánh *
                  <input
                    required
                    type="datetime-local"
                    value={form.arrival_time}
                    onChange={(event) =>
                      updateField(
                        "arrival_time",
                        event.target.value
                      )
                    }
                  />
                  {fieldErrors.arrival_time && (
                    <small>{fieldErrors.arrival_time[0]}</small>
                  )}
                </label>

                <label>
                  Mã máy bay *
                  <input
                    required
                    maxLength={20}
                    value={form.aircraft_code}
                    onChange={(event) =>
                      updateField(
                        "aircraft_code",
                        event.target.value
                      )
                    }
                    placeholder="VD: A321"
                  />
                  {fieldErrors.aircraft_code && (
                    <small>{fieldErrors.aircraft_code[0]}</small>
                  )}
                </label>

                <label>
                  Trạng thái *
                  <select
                    value={form.status}
                    onChange={(event) =>
                      updateField(
                        "status",
                        event.target.value as FlightStatus
                      )
                    }
                  >
                    {statuses
                      .filter((status) => status !== "CANCELLED")
                      .map((status) => (
                        <option key={status} value={status}>
                          {statusLabels[status]}
                        </option>
                      ))}
                  </select>
                  {fieldErrors.status && (
                    <small>{fieldErrors.status[0]}</small>
                  )}
                </label>
              </div>

              <div className="flights-admin-modal-footer">
                <button
                  type="button"
                  className="flights-admin-secondary"
                  disabled={saving}
                  onClick={() => setModalOpen(false)}
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="flights-admin-primary"
                  disabled={saving}
                >
                  {saving
                    ? "Đang lưu..."
                    : editing
                      ? "Lưu thay đổi"
                      : "Thêm chuyến bay"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
