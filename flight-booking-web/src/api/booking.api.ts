import api from "./axios";

export interface PassengerInput {
  flight_seat_id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender?: "MALE" | "FEMALE" | "OTHER" | null;
  document_number?: string | null;
  nationality?: string | null;
}

export interface Airport {
  id: number;
  code: string;
  name: string;
  city: string;
}

export interface BookingFlight {
  id: number;
  flight_number: string;
  departure_time: string;
  arrival_time: string;
  aircraft_code?: string;
  airline?: {
    id: number;
    code: string;
    name: string;
    logo_url?: string | null;
  };
  departure_airport?: Airport;
  arrival_airport?: Airport;
}

export interface BookingSeat {
  id: number;
  price: string | number;
  passenger?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  flight_seat?: {
    id: number;
    seat_number: string;
    seat_class?: {
      code: string;
      name: string;
    };
  };
}

export interface BookingPayment {
  id: number;
  payment_method: string;
  amount: string | number;
  status: string;
  paid_at: string | null;
}

export interface Booking {
  id: number;
  booking_code: string;
  flight_id: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED";
  total_amount: string | number;
  expires_at: string;
  created_at?: string;
  flight?: BookingFlight;
  booking_seats?: BookingSeat[];
  payments?: BookingPayment[];
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function createBooking(
  flightId: number,
  passengers: PassengerInput[]
): Promise<Booking> {
  const response = await api.post<ApiResponse<Booking>>(
    "/bookings",
    {
      flight_id: flightId,
      passengers,
    }
  );

  return response.data.data;
}

export async function payBooking(
  bookingId: number
): Promise<Booking> {
  const response = await api.post<ApiResponse<Booking>>(
    `/bookings/${bookingId}/pay`
  );

  return response.data.data;
}

export async function getBooking(
  bookingId: number
): Promise<Booking> {
  const response = await api.get<ApiResponse<Booking>>(
    `/bookings/${bookingId}`
  );

  return response.data.data;
}

export async function getMyBookings(): Promise<Booking[]> {
  const response = await api.get("/my-bookings");

  const payload = response.data.data;

  return Array.isArray(payload)
    ? payload
    : payload.data;
}
