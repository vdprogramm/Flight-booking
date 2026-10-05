import { useEffect, useMemo, useState, type FormEvent } from "react";
import axios from "axios";
import {
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  createAirport,
  deleteAirport,
  getAdminAirports,
  updateAirport,
  type Airport,
  type AirportPayload,
} from "../../api/admin/airport.api";

import "../../styles/admin-airports.css";

const emptyForm: AirportPayload = {
  code: "",
  name: "",
  city: "",
  country: "",
};

export default function AdminAirportsPage() {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Airport | null>(null);
  const [form, setForm] = useState<AirportPayload>(emptyForm);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string[]>
  >({});

  async function loadAirports() {
    setLoading(true);

    try {
      const data = await getAdminAirports();
      setAirports(data);
    } catch {
      setError("Không thể tải danh sách sân bay.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAirports();
  }, []);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return airports.filter((airport) =>
      [
        airport.code,
        airport.name,
        airport.city,
        airport.country,
      ].some((value) => value.toLowerCase().includes(keyword))
    );
  }, [airports, search]);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm });
    setFieldErrors({});
    setError("");
    setModalOpen(true);
  }

  function openEdit(airport: Airport) {
    setEditing(airport);

    setForm({
      code: airport.code,
      name: airport.name,
      city: airport.city,
      country: airport.country,
    });

    setFieldErrors({});
    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (!saving) setModalOpen(false);
  }

  function updateField(
    field: keyof AirportPayload,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: field === "code" ? value.toUpperCase() : value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError("");
    setMessage("");
    setFieldErrors({});

    const payload: AirportPayload = {
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      city: form.city.trim(),
      country: form.country.trim(),
    };

    try {
      if (editing) {
        await updateAirport(editing.id, payload);
        setMessage("Cập nhật sân bay thành công.");
      } else {
        await createAirport(payload);
        setMessage("Thêm sân bay thành công.");
      }

      setModalOpen(false);
      await loadAirports();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 422) {
          setFieldErrors(err.response.data?.errors ?? {});
          setError("Vui lòng kiểm tra thông tin nhập.");
        } else {
          setError(
            err.response?.data?.message ??
              "Không thể lưu thông tin sân bay."
          );
        }
      } else {
        setError("Đã xảy ra lỗi không xác định.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(airport: Airport) {
    if (deletingId !== null) return;

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa sân bay ${airport.code} - ${airport.name}?`
    );

    if (!confirmed) return;

    setDeletingId(airport.id);
    setError("");
    setMessage("");

    try {
      await deleteAirport(airport.id);
      setMessage(`Đã xóa sân bay ${airport.code}.`);
      await loadAirports();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setError(
          "Không thể xóa sân bay đang được sử dụng bởi chuyến bay."
        );
      } else {
        setError("Không thể xóa sân bay.");
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="airports-page">
      <div className="airports-heading">
        <div>
          <span>QUẢN LÝ HỆ THỐNG</span>
          <h1>Sân bay</h1>
          <p>Quản lý sân bay phục vụ các chuyến bay SkyBooking.</p>
        </div>

        <button className="airports-primary" onClick={openCreate}>
          <Plus size={18} />
          Thêm sân bay
        </button>
      </div>

      {message && (
        <div className="airports-success">{message}</div>
      )}

      {error && (
        <div className="airports-error">{error}</div>
      )}

      <section className="airports-panel">
        <div className="airports-toolbar">
          <div>
            <h2>Danh sách sân bay</h2>
            <p>Tổng cộng {airports.length} sân bay</p>
          </div>

          <label className="airports-search">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm mã, tên, thành phố..."
            />
          </label>
        </div>

        <div className="airports-table-wrap">
          <table className="airports-table">
            <thead>
              <tr>
                <th>Sân bay</th>
                <th>Mã</th>
                <th>Thành phố</th>
                <th>Quốc gia</th>
                <th>Múi giờ</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="airports-empty">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="airports-empty">
                    Không tìm thấy sân bay.
                  </td>
                </tr>
              ) : (
                filtered.map((airport) => (
                  <tr key={airport.id}>
                    <td>
                      <div className="airports-identity">
                        <div className="airports-icon">
                          <MapPin size={20} />
                        </div>

                        <div>
                          <strong>{airport.name}</strong>
                          <small>#{airport.id}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="airports-code">
                        {airport.code}
                      </span>
                    </td>

                    <td>{airport.city}</td>
                    <td>{airport.country}</td>
                    <td>{airport.timezone || "—"}</td>

                    <td>
                      <div className="airports-actions">
                        <button
                          title="Chỉnh sửa"
                          onClick={() => openEdit(airport)}
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          title="Xóa sân bay"
                          className="danger"
                          disabled={deletingId !== null}
                          onClick={() => void handleDelete(airport)}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen && (
        <div className="airports-modal-backdrop">
          <div
            className="airports-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="airport-modal-title"
          >
            <div className="airports-modal-header">
              <div>
                <h2 id="airport-modal-title">
                  {editing ? "Chỉnh sửa sân bay" : "Thêm sân bay"}
                </h2>
                <p>Nhập thông tin sân bay.</p>
              </div>

              <button
                type="button"
                aria-label="Đóng"
                disabled={saving}
                onClick={closeModal}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="airports-form">
                {(
                  [
                    ["code", "Mã sân bay", "VD: HAN", 10],
                    ["name", "Tên sân bay", "VD: Nội Bài", 255],
                    ["city", "Thành phố", "VD: Hà Nội", 100],
                    ["country", "Quốc gia", "VD: Việt Nam", 100],
                  ] as const
                ).map(([field, label, placeholder, maxLength]) => (
                  <label key={field}>
                    {label} <span>*</span>

                    <input
                      required
                      maxLength={maxLength}
                      value={form[field]}
                      onChange={(event) =>
                        updateField(field, event.target.value)
                      }
                      placeholder={placeholder}
                    />

                    {fieldErrors[field] && (
                      <small className="airports-field-error">
                        {fieldErrors[field][0]}
                      </small>
                    )}
                  </label>
                ))}
              </div>

              <div className="airports-modal-footer">
                <button
                  type="button"
                  className="airports-secondary"
                  disabled={saving}
                  onClick={closeModal}
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="airports-primary"
                  disabled={saving}
                >
                  {saving
                    ? "Đang lưu..."
                    : editing
                      ? "Lưu thay đổi"
                      : "Thêm sân bay"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
