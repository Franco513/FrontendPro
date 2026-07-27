import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useApp } from "../context/AppContext";
import { extraerMensajeError } from "../lib/apiClient";
import { Icon } from "../lib/icons";
import { usuarioService } from "../services/usuarioService";

const schema = z
  .object({
    actual: z.string().min(1, "Ingresa tu contraseña actual"),
    nueva: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
    confirmar: z.string().min(6, "Confirma la nueva contraseña"),
  })
  .refine((d) => d.nueva === d.confirmar, {
    message: "Las contraseñas nuevas no coinciden",
    path: ["confirmar"],
  });
type FormValues = z.infer<typeof schema>;

export function CambioPasswordForm() {
  const { sesion, mostrarToast, mostrarSello } = useApp();
  const [enviando, setEnviando] = useState(false);
  const [mostrarPasswordActual, setMostrarPasswordActual] = useState(false);
  const [mostrarPasswordNueva, setMostrarPasswordNueva] = useState(false);
  const [mostrarPasswordConfirmar, setMostrarPasswordConfirmar] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (datos: FormValues) => {
    if (!sesion.idUsuario) {
      mostrarToast("No se pudo identificar tu usuario. Vuelve a iniciar sesión.", "error");
      return;
    }
    setEnviando(true);
    try {
      // PATCH /api/Usuario/{id}/CambiarPassword
      await usuarioService.cambiarPassword(sesion.idUsuario, datos.actual, datos.nueva);
      reset();
      mostrarSello("Actualizado");
      mostrarToast("Tu contraseña se cambió con éxito", "exito");
    } catch (err) {
      const mensaje = extraerMensajeError(err);
      setError("actual", { message: mensaje });
      mostrarToast(mensaje, "error");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form id="formCambioPassword" className="form-vertical" onSubmit={handleSubmit(onSubmit)}>
      <label className="campo">
        <span>Contraseña actual</span>
        <div className="campo-password">
          <input type={mostrarPasswordActual ? "text" : "password"} id="passwordActual" {...register("actual")} />
          <button
            type="button"
            className="btn-ojo"
            aria-label={mostrarPasswordActual ? "Ocultar contraseña" : "Mostrar contraseña"}
            onClick={() => setMostrarPasswordActual((v) => !v)}
          >
            <Icon name={mostrarPasswordActual ? "ojoCerrado" : "ojo"} size={18} />
          </button>
        </div>
      </label>
      <label className="campo">
        <span>Nueva contraseña</span>
        <div className="campo-password">
          <input type={mostrarPasswordNueva ? "text" : "password"} id="passwordNueva" minLength={6} {...register("nueva")} />
          <button
            type="button"
            className="btn-ojo"
            aria-label={mostrarPasswordNueva ? "Ocultar contraseña" : "Mostrar contraseña"}
            onClick={() => setMostrarPasswordNueva((v) => !v)}
          >
            <Icon name={mostrarPasswordNueva ? "ojoCerrado" : "ojo"} size={18} />
          </button>
        </div>
      </label>
      <label className="campo">
        <span>Confirmar nueva contraseña</span>
        <div className="campo-password">
          <input type={mostrarPasswordConfirmar ? "text" : "password"} id="passwordConfirmar" minLength={6} {...register("confirmar")} />
          <button
            type="button"
            className="btn-ojo"
            aria-label={mostrarPasswordConfirmar ? "Ocultar contraseña" : "Mostrar contraseña"}
            onClick={() => setMostrarPasswordConfirmar((v) => !v)}
          >
            <Icon name={mostrarPasswordConfirmar ? "ojoCerrado" : "ojo"} size={18} />
          </button>
        </div>
      </label>
      {Object.values(errors)[0]?.message && (
        <p className="login-error visible">{Object.values(errors)[0]?.message as string}</p>
      )}
      <button type="submit" className="btn btn-primario" disabled={enviando}>
        {enviando ? "Guardando…" : "Guardar nueva contraseña"}
      </button>
    </form>
  );
}
