import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useApp } from "../context/AppContext";
import { Icon } from "../lib/icons";
import { bs } from "../lib/format";
import { extraerMensajeError } from "../lib/apiClient";
import { compraService } from "../services/compraService";
import { productoService } from "../services/productoService";
import type { ProductoApi, ProveedorApi } from "../types/api";

interface ItemCompraTemp {
  idProducto: number;
  nombre: string;
  cantidad: number;
  costo: number;
}

interface CompraFormProps {
  productos: ProductoApi[];
  proveedores: ProveedorApi[];
  categoriasConocidas?: string[];
  idProductoPreseleccionado?: number;
  onGuardado: () => void;
}

/** Valor que se envía como NombreProveedor cuando se repone stock de un
 * producto ya existente. El backend (CompraDTO) exige NombreProveedor no
 * vacío en cada compra, pero para "Producto existente" ya no se le pide
 * el dato al usuario (ver CompraExistenteForm), así que se manda este
 * texto fijo para cumplir con esa validación sin mostrar el campo. */
const PROVEEDOR_REPOSICION_STOCK = "Reposición de stock";

/**
 * Registrar compra a proveedor — usa POST /api/Compra.
 * El backend (CompraDTO) guarda el proveedor como texto libre por compra
 * (NombreProveedor), no como relación por producto — Producto no tiene
 * campo de proveedor en el backend. Por eso el proveedor se elige/escribe
 * una sola vez para toda la compra, no por producto, y solo se pide en el
 * flujo de "Producto nuevo" (ver PROVEEDOR_REPOSICION_STOCK arriba).
 */
export function CompraForm(props: CompraFormProps) {
  const [modo, setModo] = useState<"existente" | "nuevo">("existente");
  return (
    <>
      <h3>Registrar compra</h3>
      <div className="tabs-reportes" style={{ marginBottom: 18 }}>
        <button
          type="button"
          className={"tab-reporte" + (modo === "existente" ? " activo" : "")}
          onClick={() => setModo("existente")}
        >
          <Icon name="caja" size={16} /> Producto existente
        </button>
        <button
          type="button"
          className={"tab-reporte" + (modo === "nuevo" ? " activo" : "")}
          onClick={() => setModo("nuevo")}
        >
          <Icon name="agregar" size={16} /> Producto nuevo
        </button>
      </div>
      {modo === "existente" ? <CompraExistenteForm {...props} /> : <CompraNuevaForm {...props} />}
    </>
  );
}

function CompraExistenteForm({ productos, idProductoPreseleccionado, onGuardado }: CompraFormProps) {
  const { cerrarModal, mostrarToast, mostrarSello } = useApp();

  const [idProducto, setIdProducto] = useState<number>(idProductoPreseleccionado ?? productos[0]?.idProducto ?? 0);
  const [cantidad, setCantidad] = useState(1);
  const [items, setItems] = useState<ItemCompraTemp[]>([]);
  const [enviando, setEnviando] = useState(false);

  function seleccionarProducto(id: number) {
    setIdProducto(id);
  }

  function agregarItem() {
    const producto = productos.find((p) => p.idProducto === idProducto);
    // El costo unitario ya no se pide al usuario: se toma directo del
    // precioCompra que el producto ya tiene registrado en el inventario.
    const costo = producto?.precioCompra ?? 0;
    if (!producto || cantidad < 1 || costo <= 0) {
      mostrarToast("Revisa la cantidad del producto", "error");
      return;
    }
    setItems((prev) => [...prev, { idProducto, nombre: producto.nombre, cantidad, costo }]);
  }

  function quitarItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  const totalCompra = items.reduce((s, i) => s + i.costo * i.cantidad, 0);

  async function guardarCompra(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) {
      mostrarToast("Agrega al menos un producto a la compra", "error");
      return;
    }
    setEnviando(true);
    try {
      // POST /api/Compra — el backend exige NombreProveedor, pero acá no
      // se le pide al usuario (ver PROVEEDOR_REPOSICION_STOCK).
      await compraService.registrar({
        nombreProveedor: PROVEEDOR_REPOSICION_STOCK,
        productos: items.map((i) => ({ idProducto: i.idProducto, cantidad: i.cantidad, costoUnitario: i.costo })),
      });
      cerrarModal();
      mostrarSello("Compra registrada");
      mostrarToast("Compra registrada. Tu inventario ya está actualizado.", "exito");
      onGuardado();
    } catch (err) {
      mostrarToast(extraerMensajeError(err), "error");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <form id="formCompra" className="form-vertical" onSubmit={guardarCompra}>
        <div className="form-fila">
          <label className="campo">
            <span>Producto</span>
            <select id="cProducto" value={idProducto} onChange={(e) => seleccionarProducto(parseInt(e.target.value))}>
              {productos.map((p) => (
                <option value={p.idProducto} key={p.idProducto}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="campo">
            <span>Cantidad</span>
            <input
              type="number"
              id="cCantidad"
              min={1}
              value={cantidad}
              onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
            />
          </label>
        </div>
        <div className="form-fila">
          <button type="button" id="btnAgregarItemCompra" className="btn btn-secundario btn-ancho" onClick={agregarItem}>
            <Icon name="agregar" size={16} /> Agregar producto
          </button>
        </div>

        <div id="listaItemsCompra" className="carrito">
          {items.length === 0 ? (
            <p className="carrito-vacio">Agrega productos a la compra.</p>
          ) : (
            items.map((i, idx) => (
              <div className="carrito-item" key={idx}>
                <span>{i.nombre} ×{i.cantidad}</span>
                <span className="num">
                  {bs(i.costo * i.cantidad)}{" "}
                  <button
                    type="button"
                    onClick={() => quitarItem(idx)}
                    style={{ color: "var(--vino)", background: "none", border: "none", marginLeft: 8 }}
                  >
                    <Icon name="cerrar" size={13} />
                  </button>
                </span>
              </div>
            ))
          )}
        </div>
        <div className="carrito-total">
          <span>Total de la compra</span>
          <strong id="totalCompra">{bs(totalCompra)}</strong>
        </div>
        <button type="submit" className="btn btn-primario btn-ancho" disabled={enviando}>
          {enviando ? "Guardando…" : "Guardar compra"}
        </button>
      </form>
    </>
  );
}

const compraNuevaSchema = z
  .object({
    nombreProveedor: z.string().min(1, "El proveedor es obligatorio"),
    nombre: z.string().min(1, "El nombre es obligatorio"),
    categoria: z.string().min(1, "La categoría es obligatoria"),
    codigoBarras: z.string(),
    precioCompra: z.coerce.number().gt(0, "Debe ser mayor a 0"),
    precioVenta: z.coerce.number().gt(0, "Debe ser mayor a 0"),
    cantidad: z.coerce.number().min(1, "La cantidad debe ser al menos 1"),
    stockMinimo: z.coerce.number().min(0),
  })
  .refine((d) => d.precioVenta >= d.precioCompra, {
    message: "El precio de venta no puede ser menor al de compra",
    path: ["precioVenta"],
  });
type CompraNuevaValues = z.infer<typeof compraNuevaSchema>;

/**
 * Producto nuevo + compra en un solo paso: el backend no tiene un
 * endpoint combinado, así que se compone POST /Producto (crea el
 * producto con StockActual: 0) seguido de POST /Compra (que suma el
 * stock comprado). Si el segundo paso falla, el producto ya quedó creado
 * (con stock 0) — se informa al usuario para que registre la compra
 * manualmente desde la pestaña "Producto existente".
 */
function CompraNuevaForm({ proveedores, categoriasConocidas = [], onGuardado }: CompraFormProps) {
  const { cerrarModal, mostrarToast, mostrarSello } = useApp();
  const [enviando, setEnviando] = useState(false);
  // El <select> nativo de proveedor (ver JSX abajo) es lo que soluciona el
  // desplegable que antes no se abría (era un <input list> = datalist).
  // "proveedorNuevo" alterna a un campo de texto libre para dar de alta un
  // proveedor que todavía no está en la lista.
  const [proveedorNuevo, setProveedorNuevo] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CompraNuevaValues>({
    resolver: zodResolver(compraNuevaSchema),
    defaultValues: { cantidad: 1, stockMinimo: 5, nombreProveedor: proveedores[0]?.nombre || "" },
  });

  const nombreProveedorActual = watch("nombreProveedor");

  const onSubmit = async (datos: CompraNuevaValues) => {
    setEnviando(true);
    try {
      // 1) POST /api/Producto — crea el producto con stock inicial 0.
      const nuevo = await productoService.crear({
        nombre: datos.nombre.trim(),
        categoria: datos.categoria.trim(),
        codigoBarras: datos.codigoBarras.trim() || null,
        precioCompra: datos.precioCompra,
        precioVenta: datos.precioVenta,
        stockActual: 0,
        stockMinimo: datos.stockMinimo,
      });
      try {
        // 2) POST /api/Compra — registra la compra y suma el stock.
        await compraService.registrar({
          nombreProveedor: datos.nombreProveedor.trim(),
          productos: [{ idProducto: nuevo.idProducto, cantidad: datos.cantidad, costoUnitario: datos.precioCompra }],
        });
      } catch (errCompra) {
        mostrarToast(
          `El producto se creó, pero la compra falló: ${extraerMensajeError(errCompra)}. Regístrala desde "Producto existente".`,
          "error"
        );
        cerrarModal();
        onGuardado();
        return;
      }
      cerrarModal();
      mostrarSello("Producto creado");
      mostrarToast(`"${datos.nombre.trim()}" se agregó a tu inventario con ${datos.cantidad} unidades`, "exito");
      onGuardado();
    } catch (err) {
      mostrarToast(extraerMensajeError(err), "error");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form id="formCompraNueva" className="form-vertical" onSubmit={handleSubmit(onSubmit)}>
      <label className="campo">
        <span>Proveedor</span>
        {proveedorNuevo ? (
          <div className="form-fila" style={{ gridTemplateColumns: "1fr auto" }}>
            <input
              type="text"
              id="ncProveedor"
              placeholder="Nombre del nuevo proveedor"
              autoFocus
              value={nombreProveedorActual}
              onChange={(e) => setValue("nombreProveedor", e.target.value, { shouldValidate: true })}
            />
            <button
              type="button"
              className="btn btn-secundario"
              onClick={() => {
                setProveedorNuevo(false);
                setValue("nombreProveedor", proveedores[0]?.nombre || "", { shouldValidate: true });
              }}
            >
              Cancelar
            </button>
          </div>
        ) : (
          <select
            id="ncProveedorSelect"
            value={nombreProveedorActual}
            onChange={(e) => {
              if (e.target.value === "__nuevo__") {
                setProveedorNuevo(true);
                setValue("nombreProveedor", "", { shouldValidate: true });
              } else {
                setValue("nombreProveedor", e.target.value, { shouldValidate: true });
              }
            }}
          >
            {proveedores.length === 0 && <option value="">No hay proveedores registrados</option>}
            {proveedores.map((p) => (
              <option value={p.nombre} key={p.idProveedor}>
                {p.nombre}
              </option>
            ))}
            <option value="__nuevo__">+ Agregar proveedor nuevo…</option>
          </select>
        )}
      </label>
      <label className="campo">
        <span>Nombre del producto</span>
        <input type="text" id="ncNombre" {...register("nombre")} />
      </label>
      <div className="form-fila">
        <label className="campo">
          <span>Categoría</span>
          <input type="text" id="ncCategoria" list="listaCategoriasCompra" {...register("categoria")} />
        </label>
        <label className="campo">
          <span>Código de barras</span>
          <input type="text" id="ncCodigo" {...register("codigoBarras")} />
        </label>
      </div>
      <datalist id="listaCategoriasCompra">
        {categoriasConocidas.map((c) => (
          <option value={c} key={c} />
        ))}
      </datalist>
      <div className="form-fila">
        <label className="campo">
          <span>Costo de compra (Bs, por unidad)</span>
          <input type="number" step={0.5} min={0} id="ncPrecioCompra" {...register("precioCompra")} />
        </label>
        <label className="campo">
          <span>Precio de venta (Bs)</span>
          <input type="number" step={0.5} min={0} id="ncPrecioVenta" {...register("precioVenta")} />
        </label>
      </div>
      <div className="form-fila">
        <label className="campo">
          <span>Cantidad comprada</span>
          <input type="number" min={1} id="ncCantidad" {...register("cantidad")} />
        </label>
        <label className="campo">
          <span>Stock mínimo</span>
          <input type="number" min={0} id="ncStockMinimo" {...register("stockMinimo")} />
        </label>
      </div>
      {Object.values(errors)[0]?.message && (
        <p className="login-error visible">{Object.values(errors)[0]?.message as string}</p>
      )}
      <button type="submit" className="btn btn-primario btn-ancho" disabled={enviando}>
        {enviando ? "Guardando…" : "Crear producto y registrar compra"}
      </button>
    </form>
  );
}
