import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";

import AdminLayout from "./layouts/AdminLayout";
import MainLayout from "./layouts/MainLayout";

import BookingDetailPage from "./pages/BookingDetailPage";
import CheckoutPage from "./pages/CheckoutPage";
import FlightDetailPage from "./pages/FlightDetailPage";
import FlightSearchPage from "./pages/FlightSearchPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import PaymentPage from "./pages/PaymentPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminAirlinesPage from "./pages/admin/AdminAirlinesPage";
import AdminAirportsPage from "./pages/admin/AdminAirportsPage";
import AdminFlightsPage from "./pages/admin/AdminFlightsPage";
import AdminFlightSeatsPage from "./pages/admin/AdminFlightSeatsPage";
import AdminBookingsPage from "./pages/admin/AdminBookingsPage";
import AdminBookingDetailPage from "./pages/admin/AdminBookingDetailPage";
import AccountPage from "./pages/AccountPage";
import "./styles/account.css";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />

          <Route
            path="/flights"
            element={<FlightSearchPage />}
          />

          <Route
            path="/flights/:flightId"
            element={<FlightDetailPage />}
          />

          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-bookings/:bookingId"
            element={
              <ProtectedRoute>
                <BookingDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payment/:bookingId"
            element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route
              path="/admin"
              element={<AdminDashboardPage />}
            />
            <Route
              path="/admin/airlines"
              element={<AdminAirlinesPage />}
            />
            <Route
              path="/admin/airports"
              element={<AdminAirportsPage />}
            />
            <Route
              path="/admin/flights"
              element={<AdminFlightsPage />}
            />
            <Route
              path="/admin/flights/:flightId/seats"
              element={<AdminFlightSeatsPage />}
            />
            <Route
              path="/admin/bookings"
              element={<AdminBookingsPage />}
            />
            <Route
              path="/admin/bookings/:bookingId"
              element={<AdminBookingDetailPage />}
            />
          </Route>
        </Route>

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
