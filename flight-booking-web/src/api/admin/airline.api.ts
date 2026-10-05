import api from "../axios";

export type Airline = {
  id: number;
  code: string;
  name: string;
  logo_url: string | null;
  flights_count: number;
};

export type AirlinePayload = {
  code: string;
  name: string;
  logo_url: string | null;
};

export async function getAirlines(): Promise<Airline[]> {
  const response = await api.get("/admin/airlines");
  return response.data.data;
}

export async function createAirline(payload: AirlinePayload) {
  return api.post("/admin/airlines", payload);
}

export async function updateAirline(id: number, payload: AirlinePayload) {
  return api.put(`/admin/airlines/${id}`, payload);
}

export async function deleteAirline(id: number) {
  return api.delete(`/admin/airlines/${id}`);
}
