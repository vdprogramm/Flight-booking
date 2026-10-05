import api from "./axios";
import type { Airport } from "../types/flight";

export const getAirports = async (): Promise<Airport[]> => {
  const response = await api.get("/airports");

  return response.data.data ?? response.data;
};
