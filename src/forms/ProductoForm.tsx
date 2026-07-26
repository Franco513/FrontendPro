import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useApp } from "../context/AppContext";
import { extraerMensajeError } from "../lib/apiClient";
import { productoService } from "../services/productoService";
import type { ProductoApi } from "../types/api";

// Refleja las validaciones reales de ProductoController.CrearProducto /
// ActualizarProducto: Nombre y Categoria obligatorios, PrecioVenta >=
// PrecioCompra, ambos precios > 0.
const productoSchema = z
  .object({
    nombre: z.string().min(1, "El nombre es obligatorio"),
    categoria: z.string().min(1, "La categoría es obligatoria"),
    codigoBarras: z.string(),
    precioCompra: z.coerce.number().gt(0, "Debe ser mayor a 0"),
    precioVenta: z.coerce.number().gt(0, "Debe ser mayor a 0"),
    stock: z.coerce.number().min(0, "Debe ser 0 o mayor"),
    stockMinimo: z.coerce.number().min(0, "Debe ser 0 o mayor"),
  })
  .refine((d) => d.precioVenta >= d.precioCompra, {
    message: "El precio de venta no puede ser menor al de compra",
    path: ["precioVenta"],
  });
type ProductoFormValues = z.infer<typeof productoSchema>;

interface ProductoFormProps {
  producto: ProductoApi | null;
  categoriasConocidas: string[];
  onGuardado: () => void;
}

export function ProductoForm({ producto: p, categoriasConocidas, onGuardado }: ProductoFormProps) {
  const { cerrarModal, mostrarToast, mostrarSello } = useApp();
  const [enviando, setEnviando] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductoFormValues>({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      nombre: p?.nombre || "",
      categoria: p?.categoria || "",
      codigoBarras: p?.codigoBarras || "",
      precioCompra: p?.precioCompra,
      precioVenta: p?.precioVenta,
      stock: p?.stockActual ?? 0,
      stockMinimo: p?.stockMinimo ?? 5,
    },
  });

  const onSubmit = async (datos: ProductoFormValues) => {
    setEnviando(true);
    const payload = {
      nombre: datos.nombre.trim(),
      categoria: datos.categoria.trim(),
      codigoBarras: datos.codigoBarras.trim() || null,
      precioCompra: datos.precioCompra,
      precioVenta: datos.precioVenta,
      stockActual: datos.stock,
      stockMinimo: datos.stockMinimo,
    };
    try {
      if (p) {
        // PUT /api/Producto/{id}
        await productoService.actualizar(p.idProducto, payload);
        mostrarToast("Producto actualizado", "exito");
      } else {
        // POST /api/Producto
        await productoService.crear(payload);
        mostrarToast("Producto agregado a tu inventario", "exito");
      }
      cerrarModal();
      mostrarSello(p ? "Actualizado" : "Guardado");
      onGuardado();
    } catch (err) {
      mostrarToast(extraerMensajeError(err), "error");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <h3>{p ? "Editar producto" : "Nuevo producto"}</h3>
      <form id="formProducto" className="form-vertical" onSubmit={handleSubmit(onSubmit)}>
        <label className="campo">
          <span>Nombre</span>
          <input type="text" id="pNombre" {...register("nombre")} />
        </label>
        <div className="form-fila">
          <label className="campo">
            <span>Categoría</span>
            <input type="text" id="pCategoria" list="listaCategorias" {...register("categoria")} />
          </label>
          <label className="campo">
            <span>Código de barras</span>
            <input type="text" id="pCodigo" {...register("codigoBarras")} />
          </label>
        </div>
        <datalist id="listaCategorias">
          {categoriasConocidas.map((c) => (
            <option value={c} key={c} />
          ))}
        </datalist>
        <div className="form-fila">
          <label className="campo">
            <span>Precio de compra (Bs)</span>
            <input type="number" step={0.5} min={0} id="pPrecioCompra" {...register("precioCompra")} />
          </label>
          <label className="campo">
            <span>Precio de venta (Bs)</span>
            <input type="number" step={0.5} min={0} id="pPrecioVenta" {...register("precioVenta")} />
          </label>
        </div>
        <div className="form-fila">
          <label className="campo">
            <span>{p ? "Stock actual" : "Stock inicial"}</span>
            <input type="number" min={0} id="pStock" {...register("stock")} />
          </label>
          <label className="campo">
            <span>Stock mínimo</span>
            <input type="number" min={0} id="pStockMinimo" {...register("stockMinimo")} />
          </label>
        </div>
        {Object.values(errors)[0]?.message && (
          <p className="login-error visible">{Object.values(errors)[0]?.message as string}</p>
        )}
        <button type="submit" className="btn btn-primario btn-ancho" disabled={enviando}>
          {enviando ? "Guardando…" : p ? "Guardar cambios" : "Agregar producto"}
        </button>
      </form>
    </>
  );
}
