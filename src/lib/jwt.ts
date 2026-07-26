/**
 * jwt.ts — decodifica (sin verificar firma; eso ya lo hizo el backend) el
 * payload de un JWT en el navegador. El login del backend
 * (POST /api/Auth/login) solo devuelve { mensaje, nombre, token } — no
 * incluye el idUsuario — pero el token sí lleva el claim
 * ClaimTypes.NameIdentifier con ese id, así que lo extraemos aquí.
 */

const CLAIM_NAME_IDENTIFIER =
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";

interface JwtPayload {
  [CLAIM_NAME_IDENTIFIER]?: string;
  nameid?: string;
  sub?: string;
  exp?: number;
}

function base64UrlDecode(segmento: string): string {
  const base64 = segmento.replace(/-/g, "+").replace(/_/g, "/");
  const relleno = base64.length % 4 === 0 ? "" : "=".repeat(4 - (base64.length % 4));
  return atob(base64 + relleno);
}

export function decodificarJwt(token: string): JwtPayload | null {
  const partes = token.split(".");
  if (partes.length !== 3) return null;
  try {
    const json = decodeURIComponent(
      base64UrlDecode(partes[1])
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function obtenerIdUsuarioDeToken(token: string): number | null {
  const payload = decodificarJwt(token);
  if (!payload) return null;
  const valor = payload[CLAIM_NAME_IDENTIFIER] ?? payload.nameid ?? payload.sub;
  const id = valor ? parseInt(valor, 10) : NaN;
  return Number.isNaN(id) ? null : id;
}
