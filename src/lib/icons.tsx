/**
 * icons.tsx — Set de íconos SVG de línea, migrado desde js/iconos.js.
 * Mismos trazos, mismo viewBox 24x24, mismo currentColor. En el sistema
 * original un MutationObserver "hidrataba" cualquier [data-icono]; en
 * React el equivalente es este componente <Icon name="..." /> reutilizable.
 */
import type { JSX } from "react";

export const ICONOS = {
  botella: '<path d="M10 2h4v3.6c0 1.2 1.5 2 1.5 4.2V19a1.5 1.5 0 0 1-1.5 1.5h-4A1.5 1.5 0 0 1 8.5 19V9.8c0-2.2 1.5-3 1.5-4.2V2z"/><line x1="8.7" y1="11" x2="15.3" y2="11"/>',
  inicio: '<path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9"/>',
  recibo: '<path d="M6 3h12v17l-2.5-1.5L13 20l-2.5-1.5L8 20l-2-1.5V3z"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="9" y1="12" x2="15" y2="12"/>',
  caja: '<path d="M3 8l9-4 9 4-9 4-9-4z"/><path d="M3 8v9l9 4 9-4V8"/><line x1="12" y1="12" x2="12" y2="21"/>',
  camion: '<rect x="3" y="7" width="11" height="9" rx="1"/><path d="M14 10h4l3 3v3h-7z"/><circle cx="7.5" cy="18.2" r="1.6"/><circle cx="17.5" cy="18.2" r="1.6"/>',
  contactos: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.3"/><path d="M15.3 14.3c2.5.5 4.4 2.6 4.4 5.4"/>',
  grafico: '<path d="M5 20V11M12 20V4M19 20v-6"/><line x1="3" y1="20" x2="21" y2="20"/>',
  ajustes: '<line x1="4" y1="7" x2="20" y2="7"/><circle cx="9" cy="7" r="2"/><line x1="4" y1="17" x2="20" y2="17"/><circle cx="15" cy="17" r="2"/>',
  salir: '<path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4"/><path d="M16 17l4-5-4-5"/><line x1="20" y1="12" x2="9" y2="12"/>',
  menu: '<line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/>',
  escudo: '<path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z"/><path d="M9 12l2 2 4-4"/>',
  moneda: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.2v9.6M9.3 9.6c0-1.1 1-2 2.7-2s2.7.9 2.7 2c0 2.5-5.4 1.3-5.4 3.8 0 1.1 1.2 2 2.7 2s2.7-.9 2.7-2"/>',
  tendencia: '<path d="M3 17l6-6 4 4 8-9"/><path d="M21 6.5h-5.2V11.7"/>',
  alerta: '<path d="M12 4 21 19H3L12 4z"/><line x1="12" y1="10" x2="12" y2="14"/><circle cx="12" cy="17.1" r="0.9" fill="currentColor" stroke="none"/>',
  carpeta: '<path d="M3 7.5a1 1 0 0 1 1-1h4.8l2 2H20a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7.5z"/>',
  circuloCheck: '<circle cx="12" cy="12" r="9"/><path d="M7.8 12.5l2.6 2.6 5.4-5.8"/>',
  circuloX: '<circle cx="12" cy="12" r="9"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/>',
  agregar: '<circle cx="12" cy="12" r="9"/><line x1="12" y1="7.5" x2="12" y2="16.5"/><line x1="7.5" y1="12" x2="16.5" y2="12"/>',
  editar: '<path d="M4.5 19.5 5.3 15.6 16.3 4.6a1.4 1.4 0 0 1 2 0l1.6 1.6a1.4 1.4 0 0 1 0 2L9 19.2 4.5 19.5z"/><line x1="14.6" y1="6.3" x2="17.7" y2="9.4"/>',
  eliminar: '<line x1="4" y1="7" x2="20" y2="7"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M6 7l1 12.5a1 1 0 0 0 1 .9h8a1 1 0 0 0 1-.9L18 7"/><line x1="10" y1="11" x2="10" y2="16.5"/><line x1="14" y1="11" x2="14" y2="16.5"/>',
  reactivar: '<path d="M4.5 9a8 8 0 0 1 13.8-4.6"/><path d="M19.5 15a8 8 0 0 1-13.8 4.6"/><path d="M18 3.8v5h-5"/><path d="M6 20.2v-5h5"/>',
  cerrar: '<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>',
  buscar: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.2" y2="16.2"/>',
  ojo: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  ojoCerrado: '<line x1="3" y1="3" x2="21" y2="21"/><path d="M10.6 5.2A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a13.4 13.4 0 0 1-3.1 3.9M6.7 6.9C4.2 8.5 2 12 2 12s3.5 7 10 7c1.3 0 2.5-.2 3.6-.6"/><path d="M9.9 10a3 3 0 0 0 4.1 4.1"/>',
  carrito: '<circle cx="9.5" cy="20" r="1.3"/><circle cx="18" cy="20" r="1.3"/><path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.4a2 2 0 0 0 2-1.6L21 8H6.2"/>',
  calculadora: '<rect x="5" y="3" width="14" height="18" rx="2"/><line x1="8" y1="7.2" x2="16" y2="7.2"/><circle cx="8.3" cy="12" r="0.9" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="0.9" fill="currentColor" stroke="none"/><circle cx="15.7" cy="12" r="0.9" fill="currentColor" stroke="none"/><circle cx="8.3" cy="16" r="0.9" fill="currentColor" stroke="none"/><circle cx="12" cy="16" r="0.9" fill="currentColor" stroke="none"/><circle cx="15.7" cy="16" r="0.9" fill="currentColor" stroke="none"/>',
  movimiento: '<path d="M7 7h11l-3-3"/><path d="M17 17H6l3 3"/>',
  entrada: '<path d="M12 15V4.5"/><path d="M7.2 9.2 12 4.5l4.8 4.7"/><path d="M4.5 15v3.7a1.3 1.3 0 0 0 1.3 1.3h12.4a1.3 1.3 0 0 0 1.3-1.3V15"/>',
  salida: '<path d="M12 4.5V15"/><path d="M7.2 10.8 12 15.5l4.8-4.7"/><path d="M4.5 15v3.7a1.3 1.3 0 0 0 1.3 1.3h12.4a1.3 1.3 0 0 0 1.3-1.3V15"/>',
  ajuste: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 6 6v1"/>',
  flecha: '<line x1="4" y1="12" x2="18" y2="12"/><path d="M13 6l6 6-6 6"/>',
  calendario: '<rect x="4" y="5" width="16" height="16" rx="2"/><line x1="4" y1="10" x2="20" y2="10"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/>',
  descargar: '<path d="M12 3v12.5"/><path d="M7.2 10.7 12 15.5l4.8-4.8"/><line x1="4.5" y1="19.5" x2="19.5" y2="19.5"/>',
  subir: '<path d="M12 20.5V8"/><path d="M7.2 12.8 12 8l4.8 4.8"/><line x1="4.5" y1="19.5" x2="19.5" y2="19.5"/>',
} as const;

export type IconName = keyof typeof ICONOS;

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

/** Ícono SVG de línea en currentColor, equivalente a iconoSVG() del original. */
export function Icon({ name, size = 20, className, style }: IconProps): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={["icono-svg", className].filter(Boolean).join(" ")}
      style={style}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: ICONOS[name] }}
    />
  );
}
