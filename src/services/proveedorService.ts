import { apiClient } from "../lib/apiClient";
import type { ProveedorApi } from "../types/api";

export interface ProveedorPayload {
  nombre: string;
  telefono: string;
  direccion: string;
  observaciones: string;
}

export const proveedorService = {
  /** GET /api/Proveedor */
  async listar(): Promise<ProveedorApi[]> {
    const { data } = await apiClient.get<ProveedorApi[]>("/Proveedor");
    return data;
  },

  /** GET /api/Proveedor/{id} */
  async obtener(id: number): Promise<ProveedorApi> {
    const { data } = await apiClient.get<ProveedorApi>(`/Proveedor/${id}`);
    return data;
  },

  /** GET /api/Proveedor/Buscar?nombre&telefono */
  async buscar(params: { nombre?: string; telefono?: string }): Promise<ProveedorApi[]> {
    const { data } = await apiClient.get<ProveedorApi[]>("/Proveedor/Buscar", { params });
    return data;
  },

  /** POST /api/Proveedor */
  async crear(payload: ProveedorPayload): Promise<ProveedorApi> {
    const { data } = await apiClient.post<ProveedorApi>("/Proveedor", payload);
    return data;
  },

  /** PUT /api/Proveedor/{id} */
  async actualizar(id: number, payload: ProveedorPayload): Promise<ProveedorApi> {
    const { data } = await apiClient.put<ProveedorApi>(`/Proveedor/${id}`, payload);
    return data;
  },

  /** DELETE /api/Proveedor/{id} — desactiva (soft delete). */
  async eliminar(id: number): Promise<{ mensaje: string }> {
    const { data } = await apiClient.delete<{ mensaje: string }>(`/Proveedor/${id}`);
    return data;
  },
};
