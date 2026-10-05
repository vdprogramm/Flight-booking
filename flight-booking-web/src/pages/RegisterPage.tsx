import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Plane,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { loginSuccess } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (form.password !== form.password_confirmation) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await register(form);

      const token =
        result.token ??
        result.data?.token;

      if (token) {
        await loginSuccess(token);
        navigate("/");
        return;
      }

      navigate("/login");
    } catch (err: any) {
      const errors = err.response?.data?.errors;

      if (errors) {
        const firstError = Object.values(errors)[0];

        if (Array.isArray(firstError)) {
          setError(String(firstError[0]));
          return;
        }
      }

      setError(
        err.response?.data?.message ??
          "Không thể đăng ký tài khoản."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-brand-panel register-brand">
        <Link to="/" className="logo auth-logo">
          <span className="logo-icon">
            <Plane />
          </span>
          <span>
            Sky<span>Booking</span>
          </span>
        </Link>

        <div className="auth-brand-content">
          <span className="eyebrow dark-eyebrow">
            <Plane size={16} />
            BẮT ĐẦU HÀNH TRÌNH
          </span>

          <h1>
            Đi xa hơn cùng
            <span> SkyBooking.</span>
          </h1>

          <p>
            Tạo tài khoản để tìm chuyến bay, giữ ghế
            và quản lý toàn bộ booking của bạn.
          </p>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-box register-box">
          <Link to="/" className="back-link">
            <ArrowLeft size={17} />
            Trang chủ
          </Link>

          <div className="auth-heading">
            <h2>Tạo tài khoản</h2>
            <p>Chỉ mất một phút để bắt đầu.</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <label>Họ và tên</label>

            <div className="input-wrapper">
              <UserRound size={19} />
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                required
              />
            </div>

            <label>Email</label>

            <div className="input-wrapper">
              <Mail size={19} />
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
                required
              />
            </div>

            <label>Mật khẩu</label>

            <div className="input-wrapper">
              <LockKeyhole size={19} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Tối thiểu 8 ký tự"
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
                required
                minLength={8}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>

            <label>Xác nhận mật khẩu</label>

            <div className="input-wrapper">
              <LockKeyhole size={19} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nhập lại mật khẩu"
                value={form.password_confirmation}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password_confirmation: e.target.value,
                  })
                }
                required
              />
            </div>

            <button
              className="btn btn-primary auth-submit"
              disabled={loading}
            >
              {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
            </button>
          </form>

          <div className="auth-switch">
            Đã có tài khoản?
            <Link to="/login">Đăng nhập</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
