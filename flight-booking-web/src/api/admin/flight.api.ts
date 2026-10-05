import api from "../axios";

export type FlightStatus =
  | "SCHEDULED"
  | "DELAYED"
  | "CANCELLED"
  | "COMPLETED";

export type Flight = {
  id: number;
  flight_number: string;
  airline_id: number;
  departure_airport_id: number;
  arrival_airport_id: number;
  departure_time: string;
  arrival_time: string;
  aircraft_code: string;
  status: FlightStatus;
  seats_count: number;
  airline: { id: number; code: string; name: string };
  departure_airport: {
    id: number;
    code: string;
    name: string;
    city: string;
  };
  arrival_airport: {
    id: number;
    code: string;
    name: string;
    city: string;
  };
};

export type FlightPayload = {
  airline_id: number;
  departure_airport_id: number;
  arrival_airport_id: number;
  flight_number: string;
  departure_time: string;
  arrival_time: string;
  aircraft_code: string;
  status: FlightStatus;
};

export type FlightPage = {
  data: Flight[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
};

export async function getAdminFlights(params: {
  page?: number;
  status?: string;
  airline_id?: number;
}): Promise<FlightPage> {
  const response = await api.get("/admin/flights", { params });
  return response.data.data;
}

export async function createAdminFlight(payload: FlightPayload) {
  return api.post("/admin/flights", payload);
}

export async function updateAdminFlight(
  id: number,
  payload: FlightPayload
) {
  return api.put(`/admin/flights/${id}`, payload);
}

export async function deleteAdminFlight(id: number) {
  return api.delete(`/admin/flights/${id}`);
}

export async function cancelAdminFlight(id: number) {
  return api.post(`/admin/flights/${id}/cancel`);
}
