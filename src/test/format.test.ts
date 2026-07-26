import { describe, expect, it } from "vitest";
import { bs, fechaLegible, hoyISO } from "../lib/format";

describe("bs", () => {
  it("formatea números con el prefijo Bs y dos decimales", () => {
    expect(bs(58)).toBe("Bs 58.00");
    expect(bs(42.5)).toBe("Bs 42.50");
  });

  it("trata null/undefined como cero", () => {
    expect(bs(undefined)).toBe("Bs 0.00");
    expect(bs(null)).toBe("Bs 0.00");
  });
});

describe("hoyISO", () => {
  it("devuelve una fecha en formato YYYY-MM-DD", () => {
    expect(hoyISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("fechaLegible", () => {
  it("formatea una fecha ISO en español boliviano", () => {
    const resultado = fechaLegible("2026-01-15");
    expect(resultado).toContain("2026");
    expect(resultado).toContain("15");
  });
});
