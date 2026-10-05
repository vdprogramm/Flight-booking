import api from "./axios";
import type { FlightSeat } from "../types/seat";

export async function getSeats(
  flightId: number
): Promise<FlightSeat[]> {
  const response = await api.get(
    `/flights/${flightId}/seats`
  );

  const body = response.data;
  const payload = body.data ?? body;

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.seats)) {
    return payload.seats;
  }

  throw new Error("Định dạng danh sách ghế không hợp lệ.");
}

export async function holdSeat(seatId: number) {
  const response = await api.post(
    `/seats/${seatId}/hold`
  );

  return response.data;
}

export async function releaseSeat(seatId: number) {
  const response = await api.delete(
    `/seats/${seatId}/hold`
  );

  return response.data;
}
