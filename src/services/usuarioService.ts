import { apiClient } from "../lib/apiClient";
import type { CrearUsuarioResponseApi, PrimerUsuarioCreadoApi, UsuarioApi } from "../types/api";

export interface CrearUsuarioPayload {
  nombre: string;
  usuarioLogin: string;
  password: string;
}

export const usuarioService = {
  /** GET /api/Usuario/{id} */
  async obtener(id: number): Promise<UsuarioApi> {
    const { data } = await apiClient.get<UsuarioApi>(`/Usuario/${id}`);
    return data;
  },

  /** PATCH /api/Usuario/{id}/CambiarPassword */
  async cambiarPassword(id: number, passwordActual: string, passwordNueva: string): Promise<{ mensaje: string }> {
    const { data } = await apiClient.patch<{ mensaje: string }>(`/Usuario/${id}/CambiarPassword`, {
      passwordActual,
      passwordNueva,
    });
    return data;
  },

  /**
   * POST /api/Usuario — da de alta un usuario adicional (requiere sesión
   * activa). El backend devuelve la entidad completa (incluido el hash de
   * password); se tipa la respuesta sin ese campo para no exponerlo nunca
   * en el frontend (ver CrearUsuarioResponseApi).
   */
  async crear(payload: CrearUsuarioPayload): Promise<CrearUsuarioResponseApi> {
    const { data } = await apiClient.post<CrearUsuarioResponseApi>("/Usuario", payload);
    return data;
  },

  /**
   * POST /api/StartUsuario/StarterUser — crea el primer usuario del
   * sistema. Solo funciona una vez (mientras la tabla Usuarios esté
   * vacía); no requiere sesión. Ruta real según el código del backend
   * (StartUsuarioController, pese al nombre del archivo).
   */
  async crearPrimerUsuario(payload: CrearUsuarioPayload): Promise<PrimerUsuarioCreadoApi> {
    const { data } = await apiClient.post<PrimerUsuarioCreadoApi>("/StartUsuario/StarterUser", payload);
    return data;
  },
};
