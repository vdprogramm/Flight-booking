import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserRound, Mail, ShieldCheck, CalendarDays } from "lucide-react";
import api from "../api/axios";

type Account = {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at?: string;
};

export default function AccountPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadAccount() {
      try {
        const response = await api.get("/me");

        if (active) {
          const accountData = response.data.user || response.data.data;
          setAccount(accountData);
        }
      } catch {
        if (active) {
          setError("Không thể tải thông tin tài khoản.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAccount();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <div className="account-message">Đang tải tài khoản...</div>;
  }

  if (error || !account) {
    return <div className="account-message">{error || "Không tìm thấy tài khoản."}</div>;
  }

  const roleLabel =
    account.role?.toUpperCase() === "ADMIN"
      ? "Quản trị viên"
      : account.role?.toUpperCase() === "CUSTOMER"
        ? "Khách hàng"
        : account.role;

  return (
    <main className="account-page">
      <div className="account-container">
        <div className="account-heading">
          <span>SKYBOOKING ACCOUNT</span>
          <h1>Tài khoản của tôi</h1>
          <p>Thông tin cá nhân và quyền truy cập của bạn.</p>
        </div>

        <section className="account-card">
          <div className="account-profile">
            <div className="account-avatar">
              <UserRound size={34} />
            </div>

            <div>
              <h2>{account.name}</h2>
              <p>{account.email}</p>
              <span className="account-role">{roleLabel}</span>
            </div>
          </div>

          <div className="account-info">
            <div className="account-info-item">
              <UserRound size={19} />
              <div>
                <span>Họ và tên</span>
                <strong>{account.name}</strong>
              </div>
            </div>

            <div className="account-info-item">
              <Mail size={19} />
              <div>
                <span>Địa chỉ email</span>
                <strong>{account.email}</strong>
              </div>
            </div>

            <div className="account-info-item">
              <ShieldCheck size={19} />
              <div>
                <span>Vai trò tài khoản</span>
                <strong>{roleLabel}</strong>
              </div>
            </div>

            <div className="account-info-item">
              <CalendarDays size={19} />
              <div>
                <span>Ngày tham gia</span>
                <strong>
                  {account.created_at
                    ? new Date(account.created_at).toLocaleDateString("vi-VN")
                    : "Chưa có thông tin"}
                </strong>
              </div>
            </div>
          </div>

          {account.role?.toUpperCase() === "ADMIN" && (
            <Link to="/admin" className="account-admin-link">
              Đi đến trang quản trị →
            </Link>
          )}
        </section>
      </div>
    </main>
  );
}
