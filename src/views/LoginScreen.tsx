import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useApp } from "../context/AppContext";
import { Icon } from "../lib/icons";
import { extraerMensajeError } from "../lib/apiClient";
import { usuarioService } from "../services/usuarioService";

const loginSchema = z.object({
  usuario: z.string().min(1, "Ingresa tu usuario"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});
type LoginForm = z.infer<typeof loginSchema>;

export function LoginScreen() {
  const [modo, setModo] = useState<"login" | "primer-usuario">("login");

  if (modo === "primer-usuario") {
    return <PrimerUsuarioScreen onVolver={() => setModo("login")} />;
  }
  return <FormularioLogin onIrAPrimerUsuario={() => setModo("primer-usuario")} />;
}

function FormularioLogin({ onIrAPrimerUsuario }: { onIrAPrimerUsuario: () => void }) {
  const { iniciarSesion, cargandoLogin, mostrarToast } = useApp();
  const [mostrarPasswordLogin, setMostrarPasswordLogin] = useState(false);
  const [errorLogin, setErrorLogin] = useState("");
  const [sacudir, setSacudir] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (datos: LoginForm) => {
    setErrorLogin("");
    const resultado = await iniciarSesion(datos.usuario, datos.password);
    if (!resultado.ok) {
      setErrorLogin(resultado.error || "Usuario o contraseña incorrectos.");
      setSacudir(false);
      requestAnimationFrame(() => setSacudir(true));
      return;
    }
    mostrarToast("Bienvenido de vuelta", "exito");
  };

  return (
    <section className="pantalla-login" id="pantallaLogin">
      <div className="login-atmosfera">
        <div className="botella b1" />
        <div className="botella b2" />
        <div className="botella b3" />
        <div className="brillo brillo1" />
        <div className="brillo brillo2" />
      </div>

      <div className="login-tarjeta">
        <div className="login-marca">
          <div className="login-icono">
            <svg viewBox="0 0 64 64" width={46} height={46}>
              <path
                d="M26 4h12v10c0 4 4 6 4 12v30a4 4 0 0 1-4 4H26a4 4 0 0 1-4-4V26c0-6 4-8 4-12V4z"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                strokeLinejoin="round"
              />
              <line x1={22} y1={34} x2={42} y2={34} stroke="currentColor" strokeWidth={3} />
            </svg>
          </div>
          <h1>La Reserva</h1>
          <p className="login-lema">Tu negocio, siempre en orden y a salvo.</p>
        </div>

        <form id="formLogin" className="login-form" onSubmit={handleSubmit(onSubmit)}>
          <label className="campo">
            <span>Usuario</span>
            <input
              type="text"
              id="loginUsuario"
              placeholder="Tu usuario"
              autoComplete="username"
              disabled={cargandoLogin}
              {...register("usuario")}
            />
          </label>
          <label className="campo">
            <span>Contraseña</span>
            <div className="campo-password">
              <input
                type={mostrarPasswordLogin ? "text" : "password"}
                id="loginPassword"
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={cargandoLogin}
                {...register("password")}
              />
              <button
                type="button"
                className="btn-ojo"
                id="btnOjo"
                aria-label={mostrarPasswordLogin ? "Ocultar contraseña" : "Mostrar contraseña"}
                onClick={() => setMostrarPasswordLogin((v) => !v)}
              >
                <Icon name={mostrarPasswordLogin ? "ojoCerrado" : "ojo"} size={18} />
              </button>
            </div>
          </label>
          <p
            className={"login-error" + (sacudir ? " visible" : "")}
            id="loginError"
            onAnimationEnd={() => setSacudir(false)}
          >
            {errorLogin || errors.usuario?.message || errors.password?.message || ""}
          </p>
          <button type="submit" className="btn btn-primario btn-ancho" disabled={cargandoLogin}>
            {cargandoLogin ? "Ingresando…" : "Entrar a mi negocio"}
          </button>
        </form>
        <button
          type="button"
          className="link-accion"
          style={{ marginTop: 14, background: "none", border: "none", width: "100%", textAlign: "center" }}
          onClick={onIrAPrimerUsuario}
        >
          ¿Primera vez usando el sistema? Crear usuario administrador
        </button>
      </div>
    </section>
  );
}

const primerUsuarioSchema = z
  .object({
    nombre: z.string().min(1, "Ingresa tu nombre"),
    usuarioLogin: z.string().min(1, "Elige un usuario"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirma la contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
type PrimerUsuarioForm = z.infer<typeof primerUsuarioSchema>;

/**
 * Flujo de arranque: POST /api/StartUsuario/StarterUser. Solo funciona una
 * vez — mientras la tabla Usuarios esté vacía (el backend responde
 * BadRequest("Ya existe un usuario.") si ya hay alguno registrado). Sin
 * esta pantalla no había ninguna forma de crear el primer usuario desde la
 * interfaz: el login por sí solo no sirve de nada en una base de datos
 * recién creada.
 */
function PrimerUsuarioScreen({ onVolver }: { onVolver: () => void }) {
  const navigate = useNavigate();
  const { iniciarSesion, mostrarToast, cargandoLogin } = useApp();
  const [enviando, setEnviando] = useState(false);
  const [mostrarPasswordRegistro, setMostrarPasswordRegistro] = useState(false);
  const [mostrarConfirmPasswordRegistro, setMostrarConfirmPasswordRegistro] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: "exito" | "error" } | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PrimerUsuarioForm>({ resolver: zodResolver(primerUsuarioSchema) });

  const onSubmit = async (datos: PrimerUsuarioForm) => {
    setEnviando(true);
    setMensaje(null);
    try {
      await usuarioService.crearPrimerUsuario({
        nombre: datos.nombre,
        usuarioLogin: datos.usuarioLogin,
        password: datos.password,
      });

      const resultado = await iniciarSesion(datos.usuarioLogin, datos.password);
      if (!resultado.ok) {
        setMensaje({ texto: resultado.error || "No se pudo iniciar sesión automáticamente.", tipo: "error" });
        return;
      }

      reset();
      mostrarToast(`¡Bienvenido, ${datos.nombre}! El sistema está listo para operar.`, "exito");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setMensaje({ texto: extraerMensajeError(err), tipo: "error" });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="pantalla-login" id="pantallaPrimerUsuario">
      <div className="login-atmosfera">
        <div className="botella b1" />
        <div className="botella b2" />
        <div className="botella b3" />
        <div className="brillo brillo1" />
        <div className="brillo brillo2" />
      </div>
      <div className="login-tarjeta">
        <div className="login-marca">
          <h1>La Reserva</h1>
          <p className="login-lema">Configuración inicial — crea el primer usuario del sistema.</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
          <label className="campo">
            <span>Nombre</span>
            <input type="text" autoComplete="name" {...register("nombre")} />
          </label>
          <label className="campo">
            <span>Usuario</span>
            <input type="text" autoComplete="username" {...register("usuarioLogin")} />
          </label>
          <label className="campo">
            <span>Contraseña</span>
            <div className="campo-password">
              <input
                type={mostrarPasswordRegistro ? "text" : "password"}
                autoComplete="new-password"
                {...register("password")}
              />
              <button
                type="button"
                className="btn-ojo"
                aria-label={mostrarPasswordRegistro ? "Ocultar contraseña" : "Mostrar contraseña"}
                onClick={() => setMostrarPasswordRegistro((v) => !v)}
              >
                <Icon name={mostrarPasswordRegistro ? "ojoCerrado" : "ojo"} size={18} />
              </button>
            </div>
          </label>
          <label className="campo">
            <span>Confirmar contraseña</span>
            <div className="campo-password">
              <input
                type={mostrarConfirmPasswordRegistro ? "text" : "password"}
                autoComplete="new-password"
                {...register("confirmPassword")}
              />
              <button
                type="button"
                className="btn-ojo"
                aria-label={mostrarConfirmPasswordRegistro ? "Ocultar contraseña" : "Mostrar contraseña"}
                onClick={() => setMostrarConfirmPasswordRegistro((v) => !v)}
              >
                <Icon name={mostrarConfirmPasswordRegistro ? "ojoCerrado" : "ojo"} size={18} />
              </button>
            </div>
          </label>
          <p
            className={"login-error" + (mensaje || errors.nombre || errors.usuarioLogin || errors.password || errors.confirmPassword ? " visible" : "")}
          >
            {mensaje?.texto || errors.nombre?.message || errors.usuarioLogin?.message || errors.password?.message || errors.confirmPassword?.message || ""}
          </p>
          <button type="submit" className="btn btn-primario btn-ancho" disabled={enviando || cargandoLogin}>
            {enviando || cargandoLogin ? "Creando…" : "Crear usuario administrador"}
          </button>
        </form>
        <button
          type="button"
          className="link-accion"
          style={{ marginTop: 14, background: "none", border: "none", width: "100%", textAlign: "center" }}
          onClick={onVolver}
        >
          Volver a iniciar sesión
        </button>
      </div>
    </section>
  );
}
