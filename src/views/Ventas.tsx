import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Icon } from "../lib/icons";
import { bs, fechaLegible, fechaHoraOrden, horaCorta, hoyISO, soloFechaISO } from "../lib/format";
import { useApiResource } from "../lib/useAsync";
import { extraerMensajeError } from "../lib/apiClient";
import { ventaService } from "../services/ventaService";
import { productoService } from "../services/productoService";
import type { ItemCarrito } from "../types/models";
import type { ProductoBusquedaVentaApi } from "../types/api";

type PeriodoVenta = "todos" | "hoy" | "semana" | "mes";

/** Cuántos productos se muestran de entrada en el listado de venta (antes
 * de que el usuario escriba algo en el buscador o toque "Ver más"). */
const PRODUCTOS_VISIBLES_INICIAL = 10;

export function Ventas() {
  const { carrito, setCarrito, mostrarToast, mostrarSello, abrirModal, cerrarModal } = useApp();
  const [searchParams] = useSearchParams();

  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [resultadosBusqueda, setResultadosBusqueda] = useState<ProductoBusquedaVentaApi[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [filtroFecha, setFiltroFecha] = useState("");
  const [filtroPeriodo, setFiltroPeriodo] = useState<PeriodoVenta>("todos");
  const [confirmando, setConfirmando] = useState(false);
  const inputBusquedaRef = useRef<HTMLInputElement>(null);

  // Catálogo de productos activos para mostrar de entrada (sin necesidad de
  // buscar), con paginación simple vía "Ver más".
  const [catalogoProductos, setCatalogoProductos] = useState<ProductoBusquedaVentaApi[]>([]);
  const [cargandoCatalogo, setCargandoCatalogo] = useState(true);
  const [productosVisibles, setProductosVisibles] = useState(PRODUCTOS_VISIBLES_INICIAL);

  const {
    datos: ventas,
    cargando: cargandoVentas,
    error: errorVentas,
    recargar: recargarVentas,
  } = useApiResource(() => ventaService.listar(), []);

  // Reinicia el carrito al entrar a la vista.
  useEffect(() => {
    setCarrito([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Acceso rápido "Registrar venta" desde el dashboard: enfoca el buscador.
  useEffect(() => {
    if (searchParams.get("accion") === "nueva-venta") {
      const t = setTimeout(() => inputBusquedaRef.current?.focus(), 250);
      return () => clearTimeout(t);
    }
  }, [searchParams]);

  // Carga el catálogo de productos activos, para mostrarlos de entrada en
  // el punto de venta sin necesidad de escribir nada.
  function recargarCatalogo() {
    setCargandoCatalogo(true);
    productoService
      .listar()
      .then((lista) => {
        const disponibles: ProductoBusquedaVentaApi[] = lista
          .filter((p) => p.activo)
          .sort((a, b) => a.nombre.localeCompare(b.nombre))
          .map((p) => ({
            idProducto: p.idProducto,
            nombre: p.nombre,
            categoria: p.categoria,
            codigoBarras: p.codigoBarras,
            precioVenta: p.precioVenta,
            stockActual: p.stockActual,
            disponible: p.stockActual > 0,
          }));
        setCatalogoProductos(disponibles);
      })
      .catch((err) => mostrarToast(extraerMensajeError(err), "error"))
      .finally(() => setCargandoCatalogo(false));
  }

  useEffect(() => {
    recargarCatalogo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Búsqueda de productos vía GET /Venta/BuscarProducto (con debounce).
  // Solo se dispara cuando el usuario escribe algo; con el buscador vacío
  // se muestra el catálogo por defecto (ver catalogoProductos más abajo).
  useEffect(() => {
    const texto = textoBusqueda.trim();
    if (!texto) {
      setResultadosBusqueda([]);
      return;
    }
    setBuscando(true);
    const id = setTimeout(() => {
      ventaService
        .buscarProducto({ nombre: texto })
        .then((res) => setResultadosBusqueda(res.slice(0, 8)))
        .catch((err) => mostrarToast(extraerMensajeError(err), "error"))
        .finally(() => setBuscando(false));
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textoBusqueda]);

  function agregarAlCarrito(p: ProductoBusquedaVentaApi) {
    if (!p.disponible || p.stockActual === 0) return;
    setCarrito((prev) => {
      const existente = prev.find((i) => i.idProducto === p.idProducto);
      if (existente) {
        if (existente.cantidad + 1 > p.stockActual) {
          mostrarToast(`Solo quedan ${p.stockActual} unidades de ${p.nombre}`, "error");
          return prev;
        }
        return prev.map((i) => (i.idProducto === p.idProducto ? { ...i, cantidad: i.cantidad + 1 } : i));
      }
      const nuevo: ItemCarrito = {
        idProducto: p.idProducto,
        nombre: p.nombre,
        precioUnitario: p.precioVenta,
        cantidad: 1,
        stockDisponible: p.stockActual,
      };
      return [...prev, nuevo];
    });
    setTextoBusqueda("");
    inputBusquedaRef.current?.focus();
  }

  function cambiarCantidadCarrito(idProducto: number, delta: number) {
    setCarrito((prev) => {
      const item = prev.find((i) => i.idProducto === idProducto);
      if (!item) return prev;
      const nueva = item.cantidad + delta;
      if (nueva <= 0) return prev.filter((i) => i.idProducto !== idProducto);
      if (nueva > item.stockDisponible) {
        mostrarToast(`Solo quedan ${item.stockDisponible} unidades disponibles`, "error");
        return prev;
      }
      return prev.map((i) => (i.idProducto === idProducto ? { ...i, cantidad: nueva } : i));
    });
  }

  function quitarDelCarrito(idProducto: number) {
    setCarrito((prev) => prev.filter((i) => i.idProducto !== idProducto));
  }

  const totalCarrito = carrito.reduce((s, i) => s + i.precioUnitario * i.cantidad, 0);
  const cantidadEnCarrito = carrito.reduce((s, i) => s + i.cantidad, 0);

  async function confirmarVenta() {
    if (carrito.length === 0) {
      mostrarToast("Agrega al menos un producto para vender", "error");
      return;
    }
    setConfirmando(true);
    try {
      const respuesta = await ventaService.registrar({
        productos: carrito.map((i) => ({ idProducto: i.idProducto, cantidad: i.cantidad })),
      });
      setCarrito([]);
      mostrarSello("Venta registrada");
      mostrarToast(`Venta #${respuesta.idVenta} por ${bs(respuesta.total)} registrada con éxito`, "exito");
      recargarVentas();
      recargarCatalogo();
    } catch (err) {
      mostrarToast(extraerMensajeError(err), "error");
    } finally {
      setConfirmando(false);
    }
  }

  async function abrirDevolucion(idVenta: number) {
    try {
      const detalle = await ventaService.obtener(idVenta);
      abrirModal(
        <FormularioDevolucion
          idVenta={idVenta}
          items={detalle.productos}
          onHecho={() => {
            cerrarModal();
            recargarVentas();
            recargarCatalogo();
          }}
        />
      );
    } catch (err) {
      mostrarToast(extraerMensajeError(err), "error");
    }
  }

  const ventasFiltradas = useMemo(() => {
    if (!ventas) return [];
    const hoy = new Date();
    let lista = [...ventas];
    if (filtroFecha) {
      lista = lista.filter((v) => soloFechaISO(v.fecha) === filtroFecha);
    } else if (filtroPeriodo !== "todos") {
      lista = lista.filter((v) => {
        const f = new Date(soloFechaISO(v.fecha) + "T00:00:00");
        const dias = (hoy.getTime() - f.getTime()) / (1000 * 60 * 60 * 24);
        if (filtroPeriodo === "hoy") return soloFechaISO(v.fecha) === hoyISO();
        if (filtroPeriodo === "semana") return dias <= 7;
        if (filtroPeriodo === "mes") return dias <= 30;
        return true;
      });
    }
    return lista.sort((a, b) => fechaHoraOrden(b.fecha, b.hora) - fechaHoraOrden(a.fecha, a.hora));
  }, [ventas, filtroFecha, filtroPeriodo]);

  return (
    <section className="vista activa" id="vista-ventas">
      <div className="pos-layout">
        <div className="panel pos-buscador">
          <div className="panel-encabezado">
            <h4>Nueva venta</h4>
            <span className="etiqueta-suave" id="cantEnCarrito">
              {cantidadEnCarrito} productos
            </span>
          </div>
          <div className="buscador-caja">
            <input
              type="text"
              id="buscarProductoVenta"
              placeholder="Buscar por nombre o código de barras…"
              ref={inputBusquedaRef}
              value={textoBusqueda}
              onChange={(e) => setTextoBusqueda(e.target.value)}
            />
            <span className="buscador-ico">
              <Icon name="buscar" size={18} />
            </span>
          </div>
          <div id="resultadosBusquedaVenta" className="resultados-busqueda">
            {textoBusqueda.trim() ? (
              <>
                {buscando && <p style={{ color: "var(--madera-suave)", padding: 8 }}>Buscando…</p>}
                {!buscando && resultadosBusqueda.length === 0 && (
                  <p style={{ color: "var(--madera-suave)", padding: 8 }}>
                    Sin resultados para "{textoBusqueda.trim()}".
                  </p>
                )}
                {!buscando &&
                  resultadosBusqueda.map((p) => (
                    <div className={"resultado-item" + (!p.disponible ? " resultado-agotado" : "")} key={p.idProducto}>
                      <div>
                        <strong>{p.nombre}</strong>
                        <br />
                        <span style={{ color: "var(--madera-suave)", fontSize: ".8rem" }}>
                          {bs(p.precioVenta)} · Stock: {p.stockActual}
                        </span>
                      </div>
                      <button disabled={!p.disponible} onClick={() => agregarAlCarrito(p)}>
                        {p.disponible ? "Agregar" : "Agotado"}
                      </button>
                    </div>
                  ))}
              </>
            ) : (
              <>
                {cargandoCatalogo && <p style={{ color: "var(--madera-suave)", padding: 8 }}>Cargando productos…</p>}
                {!cargandoCatalogo && catalogoProductos.length === 0 && (
                  <p style={{ color: "var(--madera-suave)", padding: 8 }}>No hay productos activos registrados.</p>
                )}
                {!cargandoCatalogo &&
                  catalogoProductos.slice(0, productosVisibles).map((p) => (
                    <div className={"resultado-item" + (!p.disponible ? " resultado-agotado" : "")} key={p.idProducto}>
                      <div>
                        <strong>{p.nombre}</strong>
                        <br />
                        <span style={{ color: "var(--madera-suave)", fontSize: ".8rem" }}>
                          {bs(p.precioVenta)} · Stock: {p.stockActual}
                        </span>
                      </div>
                      <button disabled={!p.disponible} onClick={() => agregarAlCarrito(p)}>
                        {p.disponible ? "Agregar" : "Agotado"}
                      </button>
                    </div>
                  ))}
                {!cargandoCatalogo && catalogoProductos.length > productosVisibles && (
                  <button
                    type="button"
                    className="btn btn-secundario btn-ancho"
                    style={{ marginTop: 8 }}
                    onClick={() => setProductosVisibles((v) => v + 10)}
                  >
                    Ver más
                  </button>
                )}
              </>
            )}
          </div>

          <div className="carrito" id="carritoLista">
            {carrito.length === 0 ? (
              <p className="carrito-vacio">Busca un producto arriba para iniciar la venta.</p>
            ) : (
              carrito.map((i) => (
                <div className="carrito-item" key={i.idProducto}>
                  <div>
                    <strong>{i.nombre}</strong>
                    <br />
                    <span style={{ fontSize: ".8rem", color: "var(--madera-suave)" }}>{bs(i.precioUnitario)} c/u</span>
                  </div>
                  <div className="cant-control">
                    <button onClick={() => cambiarCantidadCarrito(i.idProducto, -1)}>−</button>
                    <span className="num">{i.cantidad}</span>
                    <button onClick={() => cambiarCantidadCarrito(i.idProducto, 1)}>+</button>
                    <button
                      onClick={() => quitarDelCarrito(i.idProducto)}
                      title="Quitar"
                      style={{ color: "var(--vino)" }}
                    >
                      <Icon name="cerrar" size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="carrito-total">
            <span>Total a cobrar</span>
            <strong id="carritoTotal">{bs(totalCarrito)}</strong>
          </div>
          <button
            className="btn btn-primario btn-ancho"
            id="btnConfirmarVenta"
            onClick={confirmarVenta}
            disabled={confirmando}
          >
            {confirmando ? "Registrando…" : "Confirmar venta"}
          </button>
        </div>

        <div className="panel pos-historial">
          <div className="panel-encabezado">
            <h4>Historial de ventas</h4>
          </div>
          <div className="filtros-fila">
            <input
              type="date"
              id="filtroFechaVenta"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
            />
            <select
              id="filtroPeriodoVenta"
              value={filtroPeriodo}
              onChange={(e) => setFiltroPeriodo(e.target.value as PeriodoVenta)}
            >
              <option value="todos">Todos</option>
              <option value="hoy">Hoy</option>
              <option value="semana">Esta semana</option>
              <option value="mes">Este mes</option>
            </select>
          </div>
          <div className="tabla-envoltorio">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Total</th>
                  <th>Ganancia</th>
                  <th></th>
                </tr>
              </thead>
              <tbody id="tablaVentas">
                {cargandoVentas ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", color: "var(--madera-suave)", padding: 26 }}>
                      Cargando ventas…
                    </td>
                  </tr>
                ) : errorVentas ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", color: "var(--vino)", padding: 26 }}>
                      {errorVentas}
                    </td>
                  </tr>
                ) : ventasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", color: "var(--madera-suave)", padding: 26 }}>
                      Aún no hay ventas registradas.
                    </td>
                  </tr>
                ) : (
                  ventasFiltradas.map((v) => (
                    <tr key={v.idVenta}>
                      <td>{fechaLegible(v.fecha)}</td>
                      <td className="num">{horaCorta(v.hora)}</td>
                      <td className="num">{bs(v.total)}</td>
                      <td className="num" style={{ color: "var(--verde-botella)" }}>
                        {bs(v.ganancia)}
                      </td>
                      <td>
                        <button
                          className="icono-accion"
                          title="Registrar devolución"
                          onClick={() => abrirDevolucion(v.idVenta)}
                        >
                          <Icon name="reactivar" size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Formulario de devolución — usa POST /Venta/{id}/Devolucion. El backend
 * no tiene un endpoint para eliminar una venta completa, así que esta es
 * la única forma de corregir una venta ya registrada.
 */
function FormularioDevolucion({
  idVenta,
  items,
  onHecho,
}: {
  idVenta: number;
  items: { idProducto: number; nombreProducto: string; cantidad: number }[];
  onHecho: () => void;
}) {
  const { mostrarToast, mostrarSello } = useApp();
  const [cantidades, setCantidades] = useState<number[]>(items.map(() => 0));
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const itemsDevolucion = items
      .map((it, i) => ({ idProducto: it.idProducto, cantidadDevuelta: cantidades[i] }))
      .filter((x) => x.cantidadDevuelta > 0);
    if (itemsDevolucion.length === 0) {
      mostrarToast("Indica al menos una cantidad a devolver", "error");
      return;
    }
    setEnviando(true);
    try {
      await ventaService.registrarDevolucion(idVenta, itemsDevolucion);
      mostrarSello("Devolución registrada");
      mostrarToast("Devolución registrada con éxito", "exito");
      onHecho();
    } catch (err) {
      mostrarToast(extraerMensajeError(err), "error");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <h3>Registrar devolución — Venta #{idVenta}</h3>
      <form className="form-vertical" onSubmit={enviar}>
        {items.map((it, i) => (
          <label className="campo" key={it.idProducto}>
            <span>
              {it.nombreProducto} (vendidos: {it.cantidad})
            </span>
            <input
              type="number"
              min={0}
              max={it.cantidad}
              value={cantidades[i]}
              onChange={(e) => {
                const v = Math.max(0, Math.min(it.cantidad, parseInt(e.target.value) || 0));
                setCantidades((prev) => prev.map((c, idx) => (idx === i ? v : c)));
              }}
            />
          </label>
        ))}
        <button type="submit" className="btn btn-primario btn-ancho" disabled={enviando}>
          {enviando ? "Registrando…" : "Registrar devolución"}
        </button>
      </form>
    </>
  );
}