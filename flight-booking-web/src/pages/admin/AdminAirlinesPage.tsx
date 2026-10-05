import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import axios from "axios";

import {
  createAirline,
  deleteAirline,
  getAirlines,
  updateAirline,
  type Airline,
  type AirlinePayload,
} from "../../api/admin/airline.api";

import "../../styles/admin-airlines.css";

const emptyForm: AirlinePayload = {
  code: "",
  name: "",
  logo_url: null,
};

export default function AdminAirlinesPage() {
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [editing, setEditing] = useState<Airline | null>(null);
  const [form, setForm] = useState<AirlinePayload>(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string[]>
  >({});

  async function loadAirlines() {
    setLoading(true);

    try {
      const data = await getAirlines();
      setAirlines(data);
      setError("");
    } catch {
      setError("Không thể tải danh sách hãng hàng không.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAirlines();
  }, []);

  const filteredAirlines = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return airlines.filter(
      (airline) =>
        airline.name.toLowerCase().includes(keyword) ||
        airline.code.toLowerCase().includes(keyword)
    );
  }, [airlines, search]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFieldErrors({});
    setError("");
    setModalOpen(true);
  }

  function openEdit(airline: Airline) {
    setEditing(airline);

    setForm({
      code: airline.code,
      name: airline.name,
      logo_url: airline.logo_url,
    });

    setFieldErrors({});
    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError("");
    setMessage("");
    setFieldErrors({});

    const payload: AirlinePayload = {
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      logo_url: form.logo_url?.trim() || null,
    };

    try {
      if (editing) {
        await updateAirline(editing.id, payload);
        setMessage("Cập nhật hãng hàng không thành công.");
      } else {
        await createAirline(payload);
        setMessage("Thêm hãng hàng không thành công.");
      }

      setModalOpen(false);
      await loadAirlines();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 422) {
          setFieldErrors(err.response.data?.errors ?? {});
          setError("Vui lòng kiểm tra lại thông tin nhập.");
        } else {
          setError(
            err.response?.data?.message ??
              "Không thể lưu hãng hàng không."
          );
        }
      } else {
        setError("Đã xảy ra lỗi không xác định.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(airline: Airline) {
    if (deletingId !== null) return;

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa hãng "${airline.name}"?`
    );

    if (!confirmed) return;

    setDeletingId(airline.id);
    setError("");
    setMessage("");

    try {
      await deleteAirline(airline.id);
      setMessage(`Đã xóa hãng ${airline.name}.`);
      await loadAirlines();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setError(
          "Không thể xóa hãng hàng không đã có chuyến bay."
        );
      } else {
        setError("Không thể xóa hãng hàng không.");
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="airlines-page">
      <div className="airlines-heading">
        <div>
          <span>QUẢN LÝ HỆ THỐNG</span>
          <h1>Hãng hàng không</h1>
          <p>Quản lý thông tin các hãng khai thác chuyến bay.</p>
        </div>

        <button className="airlines-primary" onClick={openCreate}>
          <Plus size={18} />
          Thêm hãng hàng không
        </button>
      </div>

      {message && <div className="airlines-success">{message}</div>}
      {error && <div className="airlines-error">{error}</div>}

      <div className="airlines-panel">
        <div className="airlines-toolbar">
          <div>
            <h2>Danh sách hãng hàng không</h2>
            <p>Tổng cộng {airlines.length} hãng</p>
          </div>

          <label className="airlines-search">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm tên hoặc mã hãng..."
            />
          </label>
        </div>

        <div className="airlines-table-wrap">
          <table className="airlines-table">
            <thead>
              <tr>
                <th>Hãng hàng không</th>
                <th>Mã hãng</th>
                <th>Chuyến bay</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="airlines-empty">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredAirlines.length === 0 ? (
                <tr>
                  <td colSpan={4} className="airlines-empty">
                    Không tìm thấy hãng hàng không.
                  </td>
                </tr>
              ) : (
                filteredAirlines.map((airline) => (
                  <tr key={airline.id}>
                    <td>
                      <div className="airlines-identity">
                        <div className="airlines-logo">
                          {airline.logo_url ? (
                            <img
                              src={airline.logo_url}
                              alt=""
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <Building2 size={21} />
                          )}
                        </div>

                        <div>
                          <strong>{airline.name}</strong>
                          <small>#{airline.id}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="airlines-code">
                        {airline.code}
                      </span>
                    </td>

                    <td>{airline.flights_count ?? 0}</td>

                    <td>
                      <div className="airlines-actions">
                        <button
                          title="Chỉnh sửa"
                          onClick={() => openEdit(airline)}
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          title="Xóa hãng"
                          className="danger"
                          disabled={deletingId !== null}
                          onClick={() => void handleDelete(airline)}
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
      </div>

      {modalOpen && (
        <div className="airlines-modal-backdrop">
          <div
            className="airlines-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="airline-modal-title"
          >
            <div className="airlines-modal-header">
              <div>
                <h2 id="airline-modal-title">
                  {editing ? "Chỉnh sửa hãng" : "Thêm hãng hàng không"}
                </h2>
                <p>Điền thông tin hãng hàng không.</p>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={closeModal}
                aria-label="Đóng"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="airlines-form">
                <label>
                  Mã hãng <span>*</span>
                  <input
                    required
                    maxLength={10}
                    value={form.code}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        code: event.target.value.toUpperCase(),
                      })
                    }
                    placeholder="VD: VN"
                  />
                  {fieldErrors.code && (
                    <small className="field-error">
                      {fieldErrors.code[0]}
                    </small>
                  )}
                </label>

                <label>
                  Tên hãng <span>*</span>
                  <input
                    required
                    maxLength={100}
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    placeholder="VD: Vietnam Airlines"
                  />
                  {fieldErrors.name && (
                    <small className="field-error">
                      {fieldErrors.name[0]}
                    </small>
                  )}
                </label>

                <label>
                  URL logo
                  <input
                    type="url"
                    maxLength={255}
                    value={form.logo_url ?? ""}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        logo_url: event.target.value,
                      })
                    }
                    placeholder="https://..."
                  />
                  {fieldErrors.logo_url && (
                    <small className="field-error">
                      {fieldErrors.logo_url[0]}
                    </small>
                  )}
                </label>
              </div>

              <div className="airlines-modal-footer">
                <button
                  type="button"
                  className="airlines-secondary"
                  disabled={saving}
                  onClick={closeModal}
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="airlines-primary"
                  disabled={saving}
                >
                  {saving
                    ? "Đang lưu..."
                    : editing
                      ? "Lưu thay đổi"
                      : "Thêm hãng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
