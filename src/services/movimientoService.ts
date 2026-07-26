import { apiClient } from "../lib/apiClient";
import type { MovimientoApi } from "../types/api";

export const movimientoService = {
  /** GET /api/MovimientoInventario?fechaInicio&fechaFin&idProducto&tipoMovimiento */
  async listar(params?: {
    fechaInicio?: string;
    fechaFin?: string;
    idProducto?: number;
    tipoMovimiento?: string;
  }): Promise<MovimientoApi[]> {
    const { data } = await apiClient.get<MovimientoApi[]>("/MovimientoInventario", { params });
    return data;
  },

  /** GET /api/MovimientoInventario/{id} */
  async obtener(id: number): Promise<MovimientoApi> {
    const { data } = await apiClient.get<MovimientoApi>(`/MovimientoInventario/${id}`);
    return data;
  },
};
