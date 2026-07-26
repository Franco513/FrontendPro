/**
 * api.ts — Formas de respuesta EXACTAS del backend.
 *
 * IMPORTANTE: ASP.NET Core aplica camelCase por defecto a TODO el JSON
 * (entrada y salida) mientras no se configure una PropertyNamingPolicy
 * distinta — y este backend no la cambia (Program.cs solo ajusta
 * ReferenceHandler). Esto aplica sin excepción: tanto a las entidades EF
 * (Producto, Proveedor, Usuario) como a los objetos anónimos de los
 * controladores, sin importar cómo estén escritas las propiedades en C#
 * (IdProducto en C# siempre sale como "idProducto" en el JSON). Todos los
 * campos de este archivo están en camelCase por esa razón.
 */

/** Envoltorio genérico usado por ApiResponse<T> (p. ej. GET /Producto). */
export interface ApiResponseWrapper<T> {
  exito: boolean;
  mensaje: string;
  data: T;
}

/** Entidad Producto tal cual la serializa el backend. */
export interface ProductoApi {
  idProducto: number;
  nombre: string;
  categoria: string;
  codigoBarras: string | null;
  precioCompra: number;
  precioVenta: number;
  stockActual: number;
  stockMinimo: number;
  activo: boolean;
}

/** GET /Producto/Alertas y GET /Reporte/Inventario. */
export interface ProductoConEstadoApi {
  idProducto: number;
  nombre: string;
  categoria: string;
  codigoBarras: string | null;
  precioCompra: number;
  precioVenta: number;
  stockActual: number;
  stockMinimo: number;
  estado: "Agotado" | "Stock Bajo" | "Disponible";
}

export interface AlertasStockResponse {
  mensaje: string;
  totalEnAlerta: number;
  productos: ProductoConEstadoApi[];
}

/** GET /Venta/BuscarProducto (para el punto de venta). */
export interface ProductoBusquedaVentaApi {
  idProducto: number;
  nombre: string;
  categoria: string;
  codigoBarras: string | null;
  precioVenta: number;
  stockActual: number;
  disponible: boolean;
}

/** Entidad Proveedor tal cual la serializa el backend. */
export interface ProveedorApi {
  idProveedor: number;
  nombre: string;
  telefono: string;
  direccion: string;
  observaciones: string;
  activo: boolean;
}

/** Item dentro de GET /Venta (historial). */
export interface VentaListaItemApi {
  idVenta: number;
  fecha: string;
  hora: string;
  total: number;
  ganancia: number;
  usuario: string;
  detalles: {
    producto: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }[];
}

/** GET /Venta/{id}. */
export interface VentaDetalleApi {
  idVenta: number;
  fecha: string;
  hora: string;
  usuario: string;
  productos: {
    idProducto: number;
    nombreProducto: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }[];
  total: number;
  ganancia: number;
}

/** Respuesta de POST /Venta. */
export interface VentaRegistradaApi {
  mensaje: string;
  idVenta: number;
  total: number;
  ganancia: number;
}

/** Respuesta de POST /Venta/{id}/Devolucion. */
export interface DevolucionRegistradaApi {
  mensaje: string;
  ventaActualizada: {
    idVenta: number;
    total: number;
    ganancia: number;
  };
}

/** Item dentro de GET /Compra (historial). */
export interface CompraListaItemApi {
  idCompra: number;
  fecha: string;
  proveedor: string;
  total: number;
  totalProductos: number;
  detalles: {
    idProducto: number;
    producto: string;
    cantidad: number;
    costoUnitario: number;
    subtotal: number;
  }[];
}

export interface ComprasResponse {
  totalCompras: number;
  totalInvertido: number;
  compras: CompraListaItemApi[];
}

/** GET /Compra/{id}. */
export interface CompraDetalleApi {
  idCompra: number;
  fecha: string;
  proveedor: string;
  total: number;
  detalles: {
    idProducto: number;
    producto: string;
    cantidad: number;
    costoUnitario: number;
    subtotal: number;
  }[];
}

/** GET /MovimientoInventario. El backend NO expone stock antes/después aquí. */
export interface MovimientoApi {
  idMovimiento: number;
  fecha: string;
  tipoMovimiento: "ENTRADA" | "SALIDA" | string;
  cantidad: number;
  observacion: string;
  producto: string;
  usuario: string;
}

/** GET /Reporte/Ventas/{Diario|Semanal|Mensual}. */
export interface ReporteVentasApi {
  periodo: "Diario" | "Semanal" | "Mensual";
  fecha?: string;
  desde?: string;
  hasta?: string;
  totalVentas: number;
  totalIngresos: number;
  totalGanancia: number;
  ventas: {
    idVenta: number;
    fecha?: string;
    hora: string;
    total: number;
    ganancia: number;
  }[];
}

/** GET /Reporte/Ganancias/{Diario|Semanal|Mensual}. */
export interface ReporteGananciasApi {
  periodo: "Diario" | "Semanal" | "Mensual";
  fecha?: string;
  desde?: string;
  hasta?: string;
  totalVentas: number;
  totalIngresos: number;
  totalGanancia: number;
  rentabilidad: number;
  gananciaPorProducto: {
    producto: string;
    cantidadVendida: number;
    ingresos: number;
    ganancia: number;
  }[];
}

/** GET /Auditoria. */
export interface AuditoriaApi {
  idAuditoria: number;
  tabla: string;
  registro: string;
  accion: string;
  fecha: string;
  usuario: string;
}

/** GET /Usuario, GET /Usuario/{id}. Nunca se muestra el campo password. */
export interface UsuarioApi {
  idUsuario: number;
  nombre: string;
  usuarioLogin: string;
  ultimoAcceso: string;
}

/** Respuesta de POST /Auth/login. */
export interface LoginResponse {
  mensaje: string;
  nombre: string;
  token: string;
}

/**
 * Respuesta de POST /api/StartUsuario/StarterUser (crea el primer usuario
 * cuando la tabla Usuarios está vacía). OJO: pese al nombre del archivo
 * (StarterUsuarioController.cs), la clase real es `StartUsuarioController`,
 * así que la ruta base es "api/StartUsuario", no "api/StarterUsuario".
 * El backend arma la respuesta a mano con solo estos 3 campos (nunca el
 * password), a diferencia de POST /Usuario que sí devuelve la entidad
 * completa (ver CrearUsuarioResponseApi).
 */
export interface PrimerUsuarioCreadoApi {
  idUsuario: number;
  nombre: string;
  usuarioLogin: string;
}

/**
 * Respuesta de POST /api/Usuario (UsuarioController.PostUsuario, requiere
 * sesión). El backend devuelve la entidad Usuario completa serializada tal
 * cual — incluye el hash de password (bcrypt) en el campo `password`. Se
 * declara acá solo para que quede documentado; el frontend NUNCA debe leer,
 * mostrar, guardar ni loguear ese campo (por eso no aparece en este tipo:
 * cualquier código que use este tipo no tiene forma de acceder a él).
 */
export interface CrearUsuarioResponseApi {
  idUsuario: number;
  nombre: string;
  usuarioLogin: string;
  ultimoAcceso: string;
}
