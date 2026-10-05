import { ArrowLeft, Eye, EyeOff, LockKeyhole, Mail, Plane } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginSuccess } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const result = await login({
        email,
        password,
      });

      const token =
        result.token ??
        result.data?.token;

      if (!token) {
        throw new Error("Token not found");
      }

      await loginSuccess(token);

      navigate("/");
    } catch {
      setError("Email hoặc mật khẩu không chính xác.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-brand-panel">
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
            FLIGHT BOOKING
          </span>

          <h1>
            Chào mừng bạn
            <span> quay trở lại.</span>
          </h1>

          <p>
            Đăng nhập để tiếp tục tìm chuyến bay,
            quản lý booking và chuẩn bị cho hành trình tiếp theo.
          </p>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-box">
          <Link to="/" className="back-link">
            <ArrowLeft size={17} />
            Trang chủ
          </Link>

          <div className="auth-heading">
            <h2>Đăng nhập</h2>
            <p>Nhập thông tin tài khoản SkyBooking.</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <label>Email</label>

            <div className="input-wrapper">
              <Mail size={19} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="label-row">
              <label>Mật khẩu</label>
            </div>

            <div className="input-wrapper">
              <LockKeyhole size={19} />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-submit"
              disabled={loading}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <div className="auth-switch">
            Chưa có tài khoản?
            <Link to="/register">Đăng ký ngay</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
