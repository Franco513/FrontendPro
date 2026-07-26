import { describe, expect, it } from "vitest";
import { obtenerIdUsuarioDeToken } from "../lib/jwt";

function crearTokenDePrueba(idUsuario: number): string {
  const encabezado = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": String(idUsuario),
      exp: Math.floor(Date.now() / 1000) + 3600,
    })
  );
  return `${encabezado}.${payload}.firma-simulada`;
}

describe("obtenerIdUsuarioDeToken", () => {
  it("extrae el idUsuario del claim NameIdentifier", () => {
    const token = crearTokenDePrueba(7);
    expect(obtenerIdUsuarioDeToken(token)).toBe(7);
  });

  it("devuelve null para un token malformado", () => {
    expect(obtenerIdUsuarioDeToken("no-es-un-token")).toBeNull();
  });
});
