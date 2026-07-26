import { apiClient } from "../lib/apiClient";
import type { AlertasStockResponse, ApiResponseWrapper, ProductoApi } from "../types/api";

// El backend deserializa JSON en camelCase (naming policy por defecto de
// ASP.NET Core), aunque el DTO de C# (ProductoDTO) declare sus propiedades
// en PascalCase — por eso el payload enviado va en camelCase.
export interface CrearOEditarProductoPayload {
  nombre: string;
  categoria: string;
  codigoBarras: string | null;
  precioCompra: number;
  precioVenta: number;
  stockActual: number;
  stockMinimo: number;
}

export const productoService = {
  /** GET /api/Producto?pagina&cantidad — se pide una página grande para traer "todos". */
  async listar(cantidad = 500): Promise<ProductoApi[]> {
    const { data } = await apiClient.get<ApiResponseWrapper<ProductoApi[]>>("/Producto", {
      params: { pagina: 1, cantidad },
    });
    return data.data;
  },

  /** GET /api/Producto/Desactivados */
  async listarDesactivados(): Promise<ProductoApi[]> {
    const { data } = await apiClient.get<ProductoApi[]>("/Producto/Desactivados");
    return data;
  },

  /** GET /api/Producto/{id} */
  async obtener(id: number): Promise<ProductoApi> {
    const { data } = await apiClient.get<ProductoApi>(`/Producto/${id}`);
    return data;
  },

  /** GET /api/Producto/Buscar?nombre&categoria&codigoBarras */
  async buscar(params: { nombre?: string; categoria?: string; codigoBarras?: string }): Promise<ProductoApi[]> {
    const { data } = await apiClient.get<ProductoApi[]>("/Producto/Buscar", { params });
    return data;
  },

  /** POST /api/Producto */
  async crear(payload: CrearOEditarProductoPayload): Promise<ProductoApi> {
    const { data } = await apiClient.post<ProductoApi>("/Producto", payload);
    return data;
  },

  /** PUT /api/Producto/{id} */
  async actualizar(id: number, payload: CrearOEditarProductoPayload): Promise<{ mensaje: string; producto: ProductoApi }> {
    const { data } = await apiClient.put<{ mensaje: string; producto: ProductoApi }>(`/Producto/${id}`, payload);
    return data;
  },

  /** PATCH /api/Producto/{id}/Precios */
  async actualizarPrecios(id: number, precioCompra: number, precioVenta: number) {
    const { data } = await apiClient.patch(`/Producto/${id}/Precios`, {
      precioCompra,
      precioVenta,
    });
    return data;
  },

  /** PATCH /api/Producto/{id}/CodigoBarras */
  async actualizarCodigoBarras(id: number, codigoBarras: string) {
    const { data } = await apiClient.patch(`/Producto/${id}/CodigoBarras`, {
      codigoBarras,
    });
    return data;
  },

  /** DELETE /api/Producto/{id} — desactiva (soft delete). */
  async desactivar(id: number): Promise<{ mensaje: string }> {
    const { data } = await apiClient.delete<{ mensaje: string }>(`/Producto/${id}`);
    return data;
  },

  /** PATCH /api/Producto/{id}/Activar — reactiva un producto desactivado. */
  async activar(id: number): Promise<{ mensaje: string }> {
    const { data } = await apiClient.patch<{ mensaje: string }>(`/Producto/${id}/Activar`);
    return data;
  },

  /** GET /api/Producto/Alertas */
  async alertas(): Promise<AlertasStockResponse> {
    const { data } = await apiClient.get<AlertasStockResponse>("/Producto/Alertas");
    return data;
  },
};