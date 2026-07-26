import { apiClient } from "../lib/apiClient";
import type { AuditoriaApi } from "../types/api";

export const auditoriaService = {
  /** GET /api/Auditoria */
  async listar(): Promise<AuditoriaApi[]> {
    const { data } = await apiClient.get<AuditoriaApi[]>("/Auditoria");
    return data;
  },
};

export const backupService = {
  /**
   * POST /api/Backup — ejecuta pg_dump EN EL SERVIDOR y devuelve solo un
   * mensaje con el nombre del archivo generado (no el archivo en sí, el
   * backend no expone forma de descargarlo ni de importarlo).
   */
  async crearBackup(): Promise<{ mensaje: string; archivo?: string }> {
    const { data } = await apiClient.post<{ mensaje: string; archivo?: string }>("/Backup");
    return data;
  },
};
