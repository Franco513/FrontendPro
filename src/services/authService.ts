import { apiClient } from "../lib/apiClient";
import type { LoginResponse } from "../types/api";

export const authService = {
  /** POST /api/Auth/login */
  async login(usuario: string, password: string): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>("/Auth/login", {
      usuario,
      password,
    });
    return data;
  },
};
