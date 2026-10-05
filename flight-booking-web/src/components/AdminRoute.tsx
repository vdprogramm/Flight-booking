import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";

export default function AdminRoute() {
  const [status, setStatus] = useState<
    "loading" | "allowed" | "denied"
  >("loading");

  useEffect(() => {
    let active = true;

    async function checkAdmin() {
      try {
        // Backend phải xác thực token và quyền ADMIN.
        await api.get("/admin/dashboard");

        if (active) setStatus("allowed");
      } catch {
        if (active) setStatus("denied");
      }
    }

    checkAdmin();

    return () => {
      active = false;
    };
  }, []);

  if (status === "loading") {
    return <div className="admin-loading">Đang xác thực quyền quản trị...</div>;
  }

  if (status === "denied") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
