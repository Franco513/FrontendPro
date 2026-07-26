import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useApp } from "../context/AppContext";
import { extraerMensajeError } from "../lib/apiClient";
import { usuarioService } from "../services/usuarioService";

const schema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  usuarioLogin: z.string().min(1, "El usuario es obligatorio"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});
type FormValues = z.infer<typeof schema>;

/**
 * Da de alta un usuario adicional — usa POST /api/Usuario
 * (UsuarioController.PostUsuario), que requiere sesión activa. El backend
 * responde con la entidad completa (incluido el hash de password), pero el
 * tipo de la respuesta (CrearUsuarioResponseApi) no declara ese campo, así
 * que nunca se lee, muestra ni guarda en el frontend.
 */
export function AgregarUsuarioForm() {
  const { mostrarToast, mostrarSello } = useApp();
  const [enviando, setEnviando] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (datos: FormValues) => {
    setEnviando(true);
    try {
      // POST /api/Usuario
      await usuarioService.crear(datos);
      reset();
      mostrarSello("Usuario creado");
      mostrarToast(`Usuario "${datos.usuarioLogin}" agregado con éxito`, "exito");
    } catch (err) {
      mostrarToast(extraerMensajeError(err), "error");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form className="form-vertical" onSubmit={handleSubmit(onSubmit)}>
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
        <input type="password" autoComplete="new-password" {...register("password")} />
      </label>
      {Object.values(errors)[0]?.message && (
        <p className="login-error visible">{Object.values(errors)[0]?.message as string}</p>
      )}
      <button type="submit" className="btn btn-primario" disabled={enviando}>
        {enviando ? "Creando…" : "Agregar usuario"}
      </button>
    </form>
  );
}
