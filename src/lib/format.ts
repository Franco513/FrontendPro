/** format.ts — utilidades de formato, migradas 1:1 desde app.js */

export function bs(n: number | undefined | null): string {
  return "Bs " + Number(n || 0).toFixed(2);
}

export function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * El backend a veces manda solo la fecha ("2026-07-25") y a veces un
 * DateTime completo ("2026-07-25T00:00:00"). Nos quedamos solo con la
 * parte de fecha (los primeros 10 caracteres) para evitar construir un
 * string inválido como "2026-07-25T00:00:00T00:00:00".
 */
export function soloFechaISO(fechaApi: string): string {
  return (fechaApi || "").slice(0, 10);
}

export function fechaLegible(fechaApi: string): string {
  const d = new Date(soloFechaISO(fechaApi) + "T00:00:00");
  return d.toLocaleDateString("es-BO", { day: "2-digit", month: "short", year: "numeric" });
}

export function horaLegible(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" });
}

/**
 * El backend serializa el campo Hora (un TimeSpan de C#) como
 * "HH:mm:ss.fffffff" (ej. "13:59:15.3203890"). Solo nos interesa "HH:mm".
 */
export function horaCorta(horaApi: string): string {
  const match = (horaApi || "").match(/^(\d{1,2}):(\d{2})/);
  if (!match) return horaApi;
  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

/**
 * Igual que horaCorta, pero conservando los segundos: "HH:mm:ss". El
 * backend serializa Hora como "13:59:15.3203890" (TimeSpan de C# con
 * fracción de segundo); esta función se queda solo con "13:59:15".
 */
export function horaConSegundos(horaApi: string): string {
  const match = (horaApi || "").match(/^(\d{1,2}):(\d{2}):(\d{2})/);
  if (!match) return horaApi;
  return `${match[1].padStart(2, "0")}:${match[2]}:${match[3]}`;
}

/**
 * Combina fecha + hora del backend (ambas pueden venir con formatos
 * "raros", ver soloFechaISO y horaCorta) en un timestamp ordenable.
 */
export function fechaHoraOrden(fechaApi: string, horaApi: string): number {
  const fecha = soloFechaISO(fechaApi);
  const horaSimple = (horaApi || "").match(/^\d{1,2}:\d{2}:\d{2}/)?.[0] || "00:00:00";
  const t = new Date(`${fecha}T${horaSimple}`).getTime();
  return Number.isNaN(t) ? 0 : t;
}
