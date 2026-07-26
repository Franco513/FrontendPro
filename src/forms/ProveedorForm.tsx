import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useApp } from "../context/AppContext";
import { extraerMensajeError } from "../lib/apiClient";
import { proveedorService } from "../services/proveedorService";
import type { ProveedorApi } from "../types/api";

const proveedorSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  telefono: z.string().min(1, "El teléfono es obligatorio"),
  direccion: z.string(),
  observaciones: z.string(),
});
type ProveedorFormValues = z.infer<typeof proveedorSchema>;

interface ProveedorFormProps {
  proveedor: ProveedorApi | null;
  onGuardado: () => void;
}

export function ProveedorForm({ proveedor: p, onGuardado }: ProveedorFormProps) {
  const { cerrarModal, mostrarToast, mostrarSello } = useApp();
  const [enviando, setEnviando] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProveedorFormValues>({
    resolver: zodResolver(proveedorSchema),
    defaultValues: {
      nombre: p?.nombre || "",
      telefono: p?.telefono || "",
      direccion: p?.direccion || "",
      observaciones: p?.observaciones || "",
    },
  });

  const onSubmit = async (datos: ProveedorFormValues) => {
    setEnviando(true);
    const payload = {
      nombre: datos.nombre.trim(),
      telefono: datos.telefono.trim(),
      direccion: datos.direccion.trim(),
      observaciones: datos.observaciones.trim(),
    };
    try {
      if (p) {
        // PUT /api/Proveedor/{id}
        await proveedorService.actualizar(p.idProveedor, payload);
        mostrarToast("Proveedor actualizado", "exito");
      } else {
        // POST /api/Proveedor
        await proveedorService.crear(payload);
        mostrarToast("Proveedor agregado", "exito");
      }
      cerrarModal();
      mostrarSello("Guardado");
      onGuardado();
    } catch (err) {
      mostrarToast(extraerMensajeError(err), "error");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <h3>{p ? "Editar proveedor" : "Nuevo proveedor"}</h3>
      <form id="formProveedor" className="form-vertical" onSubmit={handleSubmit(onSubmit)}>
        <label className="campo">
          <span>Nombre</span>
          <input type="text" id="provNombre" {...register("nombre")} />
        </label>
        <label className="campo">
          <span>Teléfono</span>
          <input type="text" id="provTelefono" {...register("telefono")} />
        </label>
        <label className="campo">
          <span>Dirección</span>
          <input type="text" id="provDireccion" {...register("direccion")} />
        </label>
        <label className="campo">
          <span>Observaciones</span>
          <input type="text" id="provObs" {...register("observaciones")} />
        </label>
        {Object.values(errors)[0]?.message && (
          <p className="login-error visible">{Object.values(errors)[0]?.message as string}</p>
        )}
        <button type="submit" className="btn btn-primario btn-ancho" disabled={enviando}>
          {enviando ? "Guardando…" : p ? "Guardar cambios" : "Agregar proveedor"}
        </button>
      </form>
    </>
  );
}
