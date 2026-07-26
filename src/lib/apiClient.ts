import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

const URL_RENDER = "https://backend-licorer-a-de-barrio.onrender.com/api"; //URL Render
const URL_LOCAL = "http://localhost:5265/api";

export const apiClient = axios.create({
  baseURL: URL_RENDER || URL_LOCAL,
});

/**
 * El token vive en memoria (no en localStorage) para conservar el mismo
 * comportamiento del mock original: la sesión se pierde al recargar la
 * página y hay que volver a iniciar sesión.
 */
let tokenActual: string | null = null;

export function establecerToken(token: string | null): void {
  tokenActual = token;
}

apiClient.interceptors.request.use((config) => {
  if (tokenActual) {
    config.headers.set("Authorization", `Bearer ${tokenActual}`);
  }
  return config;
});

/**
 * El backend firma el JWT con expiración de 8 horas (ver AuthController.Login)
 * y lo valida con [Authorize] en casi todos los controladores. Cuando el
 * token expira o es inválido, cualquier endpoint protegido responde 401. Acá
 * no tenemos acceso directo al AppContext (evitamos import circular), así que
 * avisamos con un evento del navegador; AppContext.tsx se suscribe a este
 * evento y cierra la sesión + muestra un toast.
 */
export const EVENTO_NO_AUTORIZADO = "api:no-autorizado";

apiClient.interceptors.response.use(
  (respuesta) => respuesta,
  async (error) => {
    if (axios.isAxiosError(error)) {
      const config = error.config as (InternalAxiosRequestConfig & {
        __reintentado?: boolean;
      }) | undefined;

      // Si el backend de Render no responde, intenta automáticamente localhost.
      if (
        error.code === "ERR_NETWORK" &&
        URL_RENDER &&
        config &&
        !config.__reintentado
      ) {
        config.__reintentado = true;
        config.baseURL = URL_LOCAL;

        return apiClient.request(config);
      }

      if (error.response?.status === 401) {
        // POST /Auth/login y POST /StartUsuario/StarterUser no requieren
        // sesión: un 401 ahí es "credenciales incorrectas", no una sesión
        // vencida, así que no debe disparar el cierre de sesión automático.
        const url = error.config?.url || "";
        const esIntentoDeLogin =
          url.includes("/Auth/login") ||
          url.includes("/StartUsuario/StarterUser");

        if (!esIntentoDeLogin) {
          window.dispatchEvent(new CustomEvent(EVENTO_NO_AUTORIZADO));
        }
      }
    }

    return Promise.reject(error);
  }
);

/**
 * El backend no responde siempre con la misma forma de error: a veces es
 * un string plano (BadRequest("...")), a veces { mensaje }, a veces
 * { Mensaje } (ApiResponse<T>.Error), y a veces un objeto de validación de
 * ASP.NET ({ errors: { Campo: ["mensaje"] } }). Esta función normaliza
 * cualquiera de esas formas a un solo string legible.
 */
export function extraerMensajeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const datos = axiosError.response?.data;

    if (typeof datos === "string" && datos.trim()) return datos;

    if (datos && typeof datos === "object") {
      const registro = datos as Record<string, unknown>;

      if (typeof registro.mensaje === "string") return registro.mensaje;
      if (typeof registro.Mensaje === "string") return registro.Mensaje;
      if (typeof registro.title === "string") return registro.title;

      if (registro.errors && typeof registro.errors === "object") {
        const primerCampo = Object.values(
          registro.errors as Record<string, unknown>
        )[0];

        if (Array.isArray(primerCampo) && typeof primerCampo[0] === "string") {
          return primerCampo[0];
        }
      }
    }

    if (axiosError.response?.status === 401) {
      return "Tu sesión expiró o no tienes autorización. Vuelve a iniciar sesión.";
    }

    if (axiosError.code === "ERR_NETWORK") {
      return "No se pudo conectar con el servidor. Se intentó usar el backend local, pero tampoco respondió.";
    }

    return (
      axiosError.message ||
      "Ocurrió un error al comunicarse con el servidor."
    );
  }

  if (error instanceof Error) return error.message;

  return "Ocurrió un error inesperado.";
}