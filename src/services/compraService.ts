import { apiClient } from "../lib/apiClient";
import type { CompraDetalleApi, ComprasResponse } from "../types/api";

export interface RegistrarCompraPayload {
  nombreProveedor: string;
  productos: { idProducto: number; cantidad: number; costoUnitario: number }[];
}

export const compraService = {
  /** GET /api/Compra?fechaInicio&fechaFin&proveedor */
  async listar(params?: { fechaInicio?: string; fechaFin?: string; proveedor?: string }): Promise<ComprasResponse> {
    const { data } = await apiClient.get<ComprasResponse>("/Compra", { params });
    return data;
  },

  /** GET /api/Compra/{id} */
  async obtener(id: number): Promise<CompraDetalleApi> {
    const { data } = await apiClient.get<CompraDetalleApi>(`/Compra/${id}`);
    return data;
  },

  /** POST /api/Compra */
  async registrar(payload: RegistrarCompraPayload): Promise<unknown> {
    const { data } = await apiClient.post("/Compra", payload);
    return data;
  },
};
