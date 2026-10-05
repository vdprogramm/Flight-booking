import api from "../axios";

export type SeatStatus = "AVAILABLE" | "HELD" | "BOOKED";

export type SeatClass = {
  id: number;
  code: string;
  name: string;
};

export type FlightSeat = {
  id: number;
  flight_id: number;
  seat_class_id: number;
  seat_number: string;
  price: string;
  status: SeatStatus;
  held_by: number | null;
  held_until: string | null;
  seat_class: SeatClass;
};

export type SeatClassConfig = {
  seat_class_id: number;
  start_row: number;
  end_row: number;
  letters: string[];
  price: number;
};

export async function getFlightSeats(flightId: number): Promise<FlightSeat[]> {
  const response = await api.get(`/admin/flights/${flightId}/seats`);
  return response.data.data;
}

export async function getSeatClasses(): Promise<SeatClass[]> {
  const response = await api.get("/admin/seat-classes");
  return response.data.data;
}

export async function generateFlightSeats(
  flightId: number,
  classes: SeatClassConfig[]
) {
  return api.post(`/admin/flights/${flightId}/seats/generate`, {
    classes,
  });
}
