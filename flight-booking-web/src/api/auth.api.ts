import api from "./axios";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export const login = async (data: LoginRequest) => {
  const response = await api.post("/login", data);
  return response.data;
};

export const register = async (data: RegisterRequest) => {
  const response = await api.post("/register", data);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get("/me");
  return response.data;
};

export const logout = async () => {
  const response = await api.post("/logout");
  return response.data;
};
