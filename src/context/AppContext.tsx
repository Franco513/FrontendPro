import { createContext, useCallback, useContext, useEffect, useState, useRef, type ReactNode } from "react";
import { authService } from "../services/authService";
import { EVENTO_NO_AUTORIZADO, establecerToken, extraerMensajeError } from "../lib/apiClient";
import { obtenerIdUsuarioDeToken } from "../lib/jwt";
import type { ItemCarrito, TipoToast, ToastItem } from "../types/models";

interface Sesion {
  activo: boolean;
  idUsuario: number | null;
  nombre: string | null;
}

interface AppContextValue {
  sesion: Sesion;
  cargandoLogin: boolean;
  /** POST /api/Auth/login */
  iniciarSesion: (usuario: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  cerrarSesion: () => void;

  carrito: ItemCarrito[];
  setCarrito: (carrito: ItemCarrito[] | ((prev: ItemCarrito[]) => ItemCarrito[])) => void;

  toasts: ToastItem[];
  mostrarToast: (mensaje: string, tipo?: TipoToast) => void;

  selloTexto: string | null;
  selloVisible: boolean;
  mostrarSello: (texto: string) => void;

  modalAbierto: boolean;
  modalContenido: ReactNode;
  abrirModal: (contenido: ReactNode) => void;
  cerrarModal: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion>({ activo: false, idUsuario: null, nombre: null });
  const [cargandoLogin, setCargandoLogin] = useState(false);
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastIdRef = useRef(0);

  const [selloTexto, setSelloTexto] = useState<string | null>(null);
  const [selloVisible, setSelloVisible] = useState(false);
  const selloTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalContenido, setModalContenido] = useState<ReactNode>(null);

  const mostrarToast = useCallback((mensaje: string, tipo: TipoToast = "info") => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, mensaje, tipo, saliendo: false }]);
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, saliendo: true } : t)));
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300);
    }, 3200);
  }, []);

  const iniciarSesion = useCallback(
    async (usuario: string, password: string) => {
      setCargandoLogin(true);
      try {
        const respuesta = await authService.login(usuario, password);
        const idUsuario = obtenerIdUsuarioDeToken(respuesta.token);
        establecerToken(respuesta.token);
        setSesion({ activo: true, idUsuario, nombre: respuesta.nombre });
        return { ok: true as const };
      } catch (error) {
        return { ok: false as const, error: extraerMensajeError(error) };
      } finally {
        setCargandoLogin(false);
      }
    },
    []
  );

  const cerrarSesion = useCallback(() => {
    establecerToken(null);
    setSesion({ activo: false, idUsuario: null, nombre: null });
    setCarrito([]);
  }, []);

  // El JWT del backend expira a las 8 horas (AuthController.Login) y
  // [Authorize] devuelve 401 en cualquier endpoint protegido si el token
  // venció o es inválido. apiClient.ts detecta ese 401 y dispara este
  // evento; acá cerramos la sesión para volver a la pantalla de login en
  // vez de dejar a la persona viendo errores 401 en cada acción.
  useEffect(() => {
    function alNoAutorizado() {
      setSesion((prev) => {
        if (!prev.activo) return prev;
        return { activo: false, idUsuario: null, nombre: null };
      });
      establecerToken(null);
      setCarrito([]);
      mostrarToast("Tu sesión expiró. Vuelve a iniciar sesión.", "error");
    }
    window.addEventListener(EVENTO_NO_AUTORIZADO, alNoAutorizado);
    return () => window.removeEventListener(EVENTO_NO_AUTORIZADO, alNoAutorizado);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mostrarSello = useCallback((texto: string) => {
    setSelloTexto(texto);
    setSelloVisible(false);
    requestAnimationFrame(() => setSelloVisible(true));
    clearTimeout(selloTimerRef.current);
    selloTimerRef.current = setTimeout(() => setSelloVisible(false), 1100);
  }, []);

  const abrirModal = useCallback((contenido: ReactNode) => {
    setModalContenido(contenido);
    setModalAbierto(true);
  }, []);

  const cerrarModal = useCallback(() => {
    setModalAbierto(false);
    setModalContenido(null);
  }, []);

  const value: AppContextValue = {
    sesion,
    cargandoLogin,
    iniciarSesion,
    cerrarSesion,
    carrito,
    setCarrito,
    toasts,
    mostrarToast,
    selloTexto,
    selloVisible,
    mostrarSello,
    modalAbierto,
    modalContenido,
    abrirModal,
    cerrarModal,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp debe usarse dentro de <AppProvider>");
  return ctx;
}
