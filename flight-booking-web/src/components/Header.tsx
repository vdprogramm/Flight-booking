import {
  ChevronDown,
  LogOut,
  Menu,
  Plane,
  Search,
  Ticket,
  UserRound,
  X,
} from "lucide-react";

import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const navigate = useNavigate();

  const {
    user,
    loading,
    isAuthenticated,
    logout,
  } = useAuth();

  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();

    setProfileOpen(false);
    navigate("/");
  };

  return (
    <header className="header">
      <div className="container navbar">
        <Link to="/" className="logo">
          <span className="logo-icon">
            <Plane size={23} />
          </span>

          <span>
            Sky<span>Booking</span>
          </span>
        </Link>

        <nav className={open ? "nav-links nav-open" : "nav-links"}>
          <NavLink to="/">
            Trang chủ
          </NavLink>

          <NavLink to="/flights">
            Tìm chuyến bay
          </NavLink>

          {isAuthenticated && (
            <NavLink to="/my-bookings">
              Vé của tôi
            </NavLink>
          )}

          <a href="/#about">
            Giới thiệu
          </a>
        </nav>

        <div className="header-actions">
          {!loading && !isAuthenticated && (
            <>
              <Link to="/login" className="login-link">
                Đăng nhập
              </Link>

              <Link to="/register" className="btn btn-primary">
                Đăng ký
              </Link>
            </>
          )}

          {!loading && user && (
            <div className="profile-menu">
              <button
                className="profile-button"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <span className="profile-avatar">
                  {user.name?.charAt(0).toUpperCase()}
                </span>

                <span className="profile-info">
                  <strong>{user.name}</strong>
                  <small>{user.role}</small>
                </span>

                <ChevronDown size={16} />
              </button>

              {profileOpen && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-user">
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>

                  <Link
                    to="/flights"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Search size={17} />
                    Tìm chuyến bay
                  </Link>

                  <Link
                    to="/my-bookings"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Ticket size={17} />
                    Vé của tôi
                  </Link>

                  <Link
                    to="/account"
                    onClick={() => setProfileOpen(false)}
                  >
                    <UserRound size={17} />
                    Tài khoản
                  </Link>

                  {user.role === "ADMIN" && (
                    <Link
                      to="/admin"
                      onClick={() => setProfileOpen(false)}
                    >
                      <Plane size={17} />
                      Quản trị
                    </Link>
                  )}

                  <button onClick={handleLogout}>
                    <LogOut size={17} />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            className="menu-button"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
