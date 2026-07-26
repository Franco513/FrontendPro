import { useCallback, useEffect, useState } from "react";
import { extraerMensajeError } from "./apiClient";

interface EstadoAsync<T> {
  datos: T | null;
  cargando: boolean;
  error: string | null;
  recargar: () => void;
}

/**
 * Ejecuta `fetcher` al montar (y cada vez que cambien las `dependencias`),
 * exponiendo datos/cargando/error/recargar. Pensado para llamadas GET a
 * los servicios de la API.
 */
export function useApiResource<T>(fetcher: () => Promise<T>, dependencias: unknown[] = []): EstadoAsync<T> {
  const [datos, setDatos] = useState<T | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const recargar = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let vigente = true;
    setCargando(true);
    setError(null);
    fetcher()
      .then((resultado) => {
        if (vigente) setDatos(resultado);
      })
      .catch((err) => {
        if (vigente) setError(extraerMensajeError(err));
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...dependencias]);

  return { datos, cargando, error, recargar };
}
