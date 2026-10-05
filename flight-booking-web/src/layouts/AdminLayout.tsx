import { NavLink, Outlet, Link } from "react-router-dom";
import {
  Building2,
  LayoutDashboard,
  MapPin,
  Plane,
  Ticket,
  ArrowLeft,
} from "lucide-react";

const menu = [
  { to: "/admin", label: "Tổng quan", icon: LayoutDashboard, end: true },
  { to: "/admin/flights", label: "Chuyến bay", icon: Plane },
  { to: "/admin/airlines", label: "Hãng hàng không", icon: Building2 },
  { to: "/admin/airports", label: "Sân bay", icon: MapPin },
  { to: "/admin/bookings", label: "Đơn đặt vé", icon: Ticket },
];

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/admin" className="admin-brand">
          <span className="admin-brand-icon">
            <Plane size={23} />
          </span>

          <span>
            <strong>SkyBooking</strong>
            <small>ADMIN PANEL</small>
          </span>
        </Link>

        <div className="admin-menu-label">QUẢN LÝ HỆ THỐNG</div>

        <nav className="admin-nav">
          {menu.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `admin-nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>

        <Link className="admin-back" to="/">
          <ArrowLeft size={18} />
          Về trang khách hàng
        </Link>
      </aside>

      <div className="admin-content">
        <header className="admin-topbar">
          <div>
            <strong>Trang quản trị</strong>
            <span>Quản lý hoạt động SkyBooking</span>
          </div>

          <span className="admin-role-badge">ADMIN</span>
        </header>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
