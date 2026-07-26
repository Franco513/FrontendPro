import { apiClient } from "../lib/apiClient";
import type { ProductoConEstadoApi, ReporteGananciasApi, ReporteVentasApi } from "../types/api";

export const reporteService = {
  /** GET /api/Reporte/Inventario */
  async inventario(): Promise<ProductoConEstadoApi[]> {
    const { data } = await apiClient.get<ProductoConEstadoApi[]>("/Reporte/Inventario");
    return data;
  },

  /** GET /api/Reporte/Ventas/Diario?fecha=YYYY-MM-DD */
  async ventasDiario(fecha?: string): Promise<ReporteVentasApi> {
    const { data } = await apiClient.get<ReporteVentasApi>("/Reporte/Ventas/Diario", { params: { fecha } });
    return data;
  },

  /** GET /api/Reporte/Ventas/Semanal?fecha=YYYY-MM-DD */
  async ventasSemanal(fecha?: string): Promise<ReporteVentasApi> {
    const { data } = await apiClient.get<ReporteVentasApi>("/Reporte/Ventas/Semanal", { params: { fecha } });
    return data;
  },

  /** GET /api/Reporte/Ventas/Mensual?anio&mes */
  async ventasMensual(anio?: number, mes?: number): Promise<ReporteVentasApi> {
    const { data } = await apiClient.get<ReporteVentasApi>("/Reporte/Ventas/Mensual", { params: { anio, mes } });
    return data;
  },

  /** GET /api/Reporte/Ganancias/Diario?fecha=YYYY-MM-DD */
  async gananciasDiario(fecha?: string): Promise<ReporteGananciasApi> {
    const { data } = await apiClient.get<ReporteGananciasApi>("/Reporte/Ganancias/Diario", { params: { fecha } });
    return data;
  },

  /** GET /api/Reporte/Ganancias/Semanal?fecha=YYYY-MM-DD */
  async gananciasSemanal(fecha?: string): Promise<ReporteGananciasApi> {
    const { data } = await apiClient.get<ReporteGananciasApi>("/Reporte/Ganancias/Semanal", { params: { fecha } });
    return data;
  },

  /** GET /api/Reporte/Ganancias/Mensual?anio&mes */
  async gananciasMensual(anio?: number, mes?: number): Promise<ReporteGananciasApi> {
    const { data } = await apiClient.get<ReporteGananciasApi>("/Reporte/Ganancias/Mensual", { params: { anio, mes } });
    return data;
  },
};
