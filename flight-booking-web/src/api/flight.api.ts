import api from "./axios";
import type { Flight } from "../types/flight";

export interface FlightSearchParams {
  from: string;
  to: string;
  date: string;
}

export interface FlightSearchResult {
  data: Flight[];
  current_page?: number;
  last_page?: number;
  total?: number;
}

export const getFlights = async (
  params: FlightSearchParams
): Promise<FlightSearchResult> => {
  const response = await api.get("/flights", { params });

  const body = response.data;

  // Hỗ trợ Laravel trả mảng hoặc paginator.
  const payload = body.data ?? body;

  if (Array.isArray(payload)) {
    return {
      data: payload,
    };
  }

  return {
    data: payload.data ?? [],
    current_page: payload.current_page,
    last_page: payload.last_page,
    total: payload.total,
  };
};

export const getFlightSeats = async (flightId: number) => {
  const response = await api.get(`/flights/${flightId}/seats`);
  return response.data.data ?? response.data;
};
