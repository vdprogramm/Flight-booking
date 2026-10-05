import api from "../axios";

export type Airport = {
  id: number;
  code: string;
  name: string;
  city: string;
  country: string;
  timezone?: string | null;
};

export type AirportPayload = Pick<
  Airport,
  "code" | "name" | "city" | "country"
>;

export async function getAdminAirports(): Promise<Airport[]> {
  const response = await api.get("/admin/airports");
  return response.data.data;
}

export async function createAirport(payload: AirportPayload) {
  return api.post("/admin/airports", payload);
}

export async function updateAirport(
  id: number,
  payload: AirportPayload
) {
  return api.put(`/admin/airports/${id}`, payload);
}

export async function deleteAirport(id: number) {
  return api.delete(`/admin/airports/${id}`);
}
