import { apiClient } from "../lib/apiClient";
import type {
  DevolucionRegistradaApi,
  ProductoBusquedaVentaApi,
  VentaDetalleApi,
  VentaListaItemApi,
  VentaRegistradaApi,
} from "../types/api";

export interface RegistrarVentaPayload {
  productos: { idProducto: number; cantidad: number }[];
}

export interface DevolucionPayloadItem {
  idProducto: number;
  cantidadDevuelta: number;
}

export const ventaService = {
  /** POST /api/Venta */
  async registrar(payload: RegistrarVentaPayload): Promise<VentaRegistradaApi> {
    const { data } = await apiClient.post<VentaRegistradaApi>("/Venta", payload);
    return data;
  },

  /** GET /api/Venta?fechaInicio&fechaFin */
  async listar(params?: { fechaInicio?: string; fechaFin?: string }): Promise<VentaListaItemApi[]> {
    const { data } = await apiClient.get<VentaListaItemApi[]>("/Venta", { params });
    return data;
  },

  /** GET /api/Venta/{id} */
  async obtener(id: number): Promise<VentaDetalleApi> {
    const { data } = await apiClient.get<VentaDetalleApi>(`/Venta/${id}`);
    return data;
  },

  /** GET /api/Venta/BuscarProducto?codigoBarras&nombre */
  async buscarProducto(params: { codigoBarras?: string; nombre?: string }): Promise<ProductoBusquedaVentaApi[]> {
    const { data } = await apiClient.get<ProductoBusquedaVentaApi[]>("/Venta/BuscarProducto", { params });
    return data;
  },

  /** POST /api/Venta/{id}/Devolucion */
  async registrarDevolucion(idVenta: number, items: DevolucionPayloadItem[]): Promise<DevolucionRegistradaApi> {
    const { data } = await apiClient.post<DevolucionRegistradaApi>(`/Venta/${idVenta}/Devolucion`, items);
    return data;
  },
};
