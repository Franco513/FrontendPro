import type { IconName } from "../lib/icons";

export type VistaId = "dashboard" | "ventas" | "productos" | "proveedores" | "reportes" | "config";

export const TITULOS: Record<VistaId, [string, string]> = {
  dashboard: ["Inicio", "Un vistazo rápido a tu negocio hoy"],
  ventas: ["Ventas", "Registra ventas y revisa tu historial"],
  productos: ["Productos", "Tu catálogo, tus compras y tu historial, todo en un lugar"],
  proveedores: ["Proveedores", "Tus contactos de confianza"],
  reportes: ["Reportes", "Cómo le está yendo a tu negocio"],
  config: ["Ajustes", "Seguridad y respaldo de tu información"],
};

export const NAV_ITEMS: { vista: VistaId; icono: IconName; etiqueta: string }[] = [
  { vista: "dashboard", icono: "inicio", etiqueta: "Inicio" },
  { vista: "ventas", icono: "recibo", etiqueta: "Ventas" },
  { vista: "productos", icono: "caja", etiqueta: "Productos" },
  { vista: "proveedores", icono: "contactos", etiqueta: "Proveedores" },
  { vista: "reportes", icono: "grafico", etiqueta: "Reportes" },
  { vista: "config", icono: "ajustes", etiqueta: "Ajustes" },
];
