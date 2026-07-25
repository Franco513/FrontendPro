/**
 * models.ts — Tipos de UI que no vienen del backend (carrito de venta en
 * pantalla, toasts). Las formas de datos que sí vienen del backend están
 * en types/api.ts, reflejando exactamente cada respuesta JSON real.
 */

/** Ítem del carrito de venta (estado de UI, se arma antes de POST /Venta). */
export interface ItemCarrito {
  idProducto: number;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
  stockDisponible: number;
}

export type TipoToast = "info" | "exito" | "error";

export interface ToastItem {
  id: number;
  mensaje: string;
  tipo: TipoToast;
  saliendo: boolean;
}
