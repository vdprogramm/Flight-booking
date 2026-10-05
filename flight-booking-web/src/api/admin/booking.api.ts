import api from "../axios";

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "EXPIRED";

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

type Airport = {
  id: number;
  code: string;
  name: string;
  city: string;
};

export type AdminBooking = {
  id: number;
  booking_code: string;
  user_id: number;
  flight_id: number;
  status: BookingStatus;
  total_amount: string;
  expires_at: string | null;
  created_at: string;
  passengers_count?: number;
  booking_seats_count?: number;

  user: {
    id: number;
    name: string;
    email: string;
  };

  flight: {
    id: number;
    flight_number: string;
    departure_time: string;
    arrival_time: string;
    status: string;
    airline: {
      id: number;
      code: string;
      name: string;
    };
    departure_airport: Airport;
    arrival_airport: Airport;
  };

  payments: {
    id: number;
    payment_method: string;
    amount: string;
    status: PaymentStatus;
    transaction_code: string | null;
    paid_at: string | null;
  }[];
};

export type AdminBookingDetail = AdminBooking & {
  passengers: {
    id: number;
    first_name: string;
    last_name: string;
    date_of_birth?: string | null;
  }[];

  booking_seats: {
    id: number;
    passenger_id: number;
    price: string;
    is_active?: boolean;
    flight_seat: {
      id: number;
      seat_number: string;
      seat_class: {
        id: number;
        code: string;
        name: string;
      };
    } | null;
  }[];
};

export type BookingPage = {
  data: AdminBooking[];
  current_page: number;
  last_page: number;
  total: number;
};

export type BookingFilters = {
  page?: number;
  status?: BookingStatus;
  search?: string;
  flight_id?: number;
  user_id?: number;
};

export async function getAdminBookings(
  filters: BookingFilters
): Promise<BookingPage> {
  const response = await api.get("/admin/bookings", {
    params: filters,
  });

  return response.data.data;
}

export async function getAdminBooking(
  id: number
): Promise<AdminBookingDetail> {
  const response = await api.get(`/admin/bookings/${id}`);
  return response.data.data;
}
