import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Icon } from "../lib/icons";
import { bs, fechaLegible } from "../lib/format";
import { useApiResource } from "../lib/useAsync";
import { extraerMensajeError } from "../lib/apiClient";
import { productoService } from "../services/productoService";
import { proveedorService } from "../services/proveedorService";
import { compraService } from "../services/compraService";
import { movimientoService } from "../services/movimientoService";
import { ProductoForm } from "../forms/ProductoForm";
import { CompraForm } from "../forms/CompraForm";
import type { ProductoApi } from "../types/api";

type SubvistaProductos = "inventario" | "compras" | "movimientos";

const ETIQUETAS_TIPO_MOVIMIENTO: Record<string, [string, "entrada" | "salida" | "ajuste", string]> = {
  ENTRADA: ["badge-entrada", "entrada", "Entrada"],
  SALIDA: ["badge-salida", "salida", "Salida"],
  AJUSTE: ["badge-ajuste", "ajuste", "Ajuste"],
};

async function cargarInventario() {
  const [productos, desactivados, proveedores] = await Promise.all([
    productoService.listar(),
    productoService.listarDesactivados(),
    proveedorService.listar(),
  ]);
  return { productos, desactivados, proveedores };
}

export function Productos() {
  const { mostrarToast, abrirModal } = useApp();
  const [searchParams] = useSearchParams();

  const [subvista, setSubvista] = useState<SubvistaProductos>("inventario");
  const [buscarProducto, setBuscarProducto] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [verDesactivados, setVerDesactivados] = useState(false);
  const [buscarMovimiento, setBuscarMovimiento] = useState("");
  const [filtroTipoMovimiento, setFiltroTipoMovimiento] = useState("todos");

  const { datos, cargando, error, recargar } = useApiResource(cargarInventario);

  const { datos: compras, cargando: cargandoCompras, error: errorCompras } = useApiResource(
    () => compraService.listar(),
    [subvista]
  );
  const { datos: movimientos, cargando: cargandoMovimientos, error: errorMovimientos } = useApiResource(
    () => movimientoService.listar(),
    [subvista]
  );

  function abrirFormularioProducto(p?: ProductoApi) {
    if (!datos) return;
    const categorias = [...new Set(datos.productos.map((x) => x.categoria))].sort();
    abrirModal(
      <ProductoForm producto={p ?? null} categoriasConocidas={categorias} onGuardado={recargar} />
    );
  }

  function abrirModalCompra(idProductoPreseleccionado?: number) {
    if (!datos) return;
    const categorias = [...new Set(datos.productos.map((x) => x.categoria))].sort();
    abrirModal(
      <CompraForm
        // GET /api/Producto no filtra por Activo, así que filtramos acá:
        // un producto "eliminado" (desactivado) no debe poder recibir
        // compras nuevas ni aparecer en el selector.
        productos={datos.productos.filter((p) => p.activo)}
        proveedores={datos.proveedores}
        categoriasConocidas={categorias}
        idProductoPreseleccionado={idProductoPreseleccionado}
        onGuardado={recargar}
      />
    );
  }

  useEffect(() => {
    if (searchParams.get("accion") === "nuevo-producto" && datos) {
      const t = setTimeout(() => abrirFormularioProducto(), 250);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, datos]);

  // Acceso rápido "Registrar compra" desde el dashboard: abre el mismo
  // modal que el botón "Registrar compra" de esta vista.
  useEffect(() => {
    if (searchParams.get("accion") === "registrar-compra" && datos) {
      const t = setTimeout(() => abrirModalCompra(), 250);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, datos]);

  async function desactivarProducto(p: ProductoApi) {
    if (!confirm(`¿Desactivar "${p.nombre}"? Podrás verlo en la lista de inactivos, pero no en ventas ni compras.`)) return;
    try {
      // DELETE /api/Producto/{id}
      await productoService.desactivar(p.idProducto);
      mostrarToast("Producto desactivado", "info");
      recargar();
    } catch (err) {
      mostrarToast(extraerMensajeError(err), "error");
    }
  }

  async function activarProducto(p: ProductoApi) {
    try {
      // PATCH /api/Producto/{id}/Activar
      await productoService.activar(p.idProducto);
      mostrarToast("Producto reactivado", "exito");
      recargar();
    } catch (err) {
      mostrarToast(extraerMensajeError(err), "error");
    }
  }

  const categoriasUnicas = useMemo(
    () => (datos ? [...new Set(datos.productos.map((p) => p.categoria))].sort() : []),
    [datos]
  );

  const productosFiltrados = useMemo(() => {
    // GET /api/Producto no filtra por Activo: filtramos acá para que la
    // vista "activos" nunca mezcle productos desactivados.
    const base = verDesactivados ? datos?.desactivados ?? [] : (datos?.productos ?? []).filter((p) => p.activo);
    const texto = buscarProducto.toLowerCase();
    return base
      .filter((p) => {
        const coincideTexto =
          p.nombre.toLowerCase().includes(texto) ||
          p.categoria.toLowerCase().includes(texto) ||
          (p.codigoBarras || "").includes(texto);
        const coincideCategoria = filtroCategoria === "todas" || p.categoria === filtroCategoria;
        return coincideTexto && coincideCategoria;
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [datos, verDesactivados, buscarProducto, filtroCategoria]);

  const movimientosFiltrados = useMemo(() => {
    if (!movimientos) return [];
    const texto = buscarMovimiento.toLowerCase();
    return [...movimientos]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .filter((m) => {
        const coincideTexto = !texto || m.producto.toLowerCase().includes(texto);
        const coincideTipo = filtroTipoMovimiento === "todos" || m.tipoMovimiento === filtroTipoMovimiento;
        return coincideTexto && coincideTipo;
      })
      .slice(0, 200);
  }, [movimientos, buscarMovimiento, filtroTipoMovimiento]);

  if (cargando) {
    return (
      <section className="vista activa" id="vista-productos">
        <p className="texto-ayuda">Cargando productos…</p>
      </section>
    );
  }
  if (error || !datos) {
    return (
      <section className="vista activa" id="vista-productos">
        <p className="login-error visible">{error || "No se pudo cargar la información."}</p>
        <button className="btn btn-secundario" onClick={recargar}>
          Reintentar
        </button>
      </section>
    );
  }

  return (
    <section className="vista activa" id="vista-productos">
      <div className="tabs-reportes" id="tabsProductos">
        <button
          className={"tab-reporte" + (subvista === "inventario" ? " activo" : "")}
          onClick={() => setSubvista("inventario")}
        >
          <Icon name="caja" size={16} /> Inventario
        </button>
        <button
          className={"tab-reporte" + (subvista === "compras" ? " activo" : "")}
          onClick={() => setSubvista("compras")}
        >
          <Icon name="camion" size={16} /> Historial de compras
        </button>
        <button
          className={"tab-reporte" + (subvista === "movimientos" ? " activo" : "")}
          onClick={() => setSubvista("movimientos")}
        >
          <Icon name="movimiento" size={16} /> Historial de movimientos
        </button>
      </div>

      <div className="panel" id="panelInventarioProductos" hidden={subvista !== "inventario"}>
        <div className="panel-encabezado">
          <h4>Inventario de productos</h4>
          <button className="btn btn-primario" id="btnRegistrarCompra" onClick={() => abrirModalCompra()}>
            <Icon name="camion" size={18} /> Registrar compra
          </button>
        </div>
        <div className="filtros-fila">
          <input
            type="text"
            id="buscarProducto"
            placeholder="Buscar por nombre, categoría o código de barras…"
            value={buscarProducto}
            onChange={(e) => setBuscarProducto(e.target.value)}
          />
          <select id="filtroCategoria" value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
            <option value="todas">Todas las categorías</option>
            {categoriasUnicas.map((c) => (
              <option value={c} key={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={"chip-periodo" + (verDesactivados ? " activo" : "")}
            onClick={() => setVerDesactivados((v) => !v)}
          >
            {verDesactivados ? "Viendo inactivos" : "Ver inactivos"}
          </button>
        </div>
        <div className="tabla-envoltorio">
          <table className="tabla">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio venta</th>
                <th>Stock</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="tablaProductos">
              {productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "var(--madera-suave)", padding: 26 }}>
                    No se encontraron productos.
                  </td>
                </tr>
              ) : (
                productosFiltrados.map((p) => {
                  let badge = <span className="badge badge-ok">Buen stock</span>;
                  if (!p.activo) badge = <span className="badge badge-inactivo">Inactivo</span>;
                  else if (p.stockActual === 0) badge = <span className="badge badge-bajo">Agotado</span>;
                  else if (p.stockActual <= p.stockMinimo) badge = <span className="badge badge-bajo">Stock bajo</span>;
                  return (
                    <tr key={p.idProducto}>
                      <td>
                        <strong>{p.nombre}</strong>
                        <br />
                        <span style={{ color: "var(--madera-suave)", fontSize: ".78rem" }}>
                          {p.codigoBarras || "Sin código"}
                        </span>
                      </td>
                      <td>{p.categoria}</td>
                      <td className="num">{bs(p.precioVenta)}</td>
                      <td className="num">
                        {p.stockActual} <span style={{ color: "var(--madera-suave)" }}>/ min {p.stockMinimo}</span>
                      </td>
                      <td>{badge}</td>
                      <td>
                        {p.activo ? (
                          <>
                            <button className="icono-accion" title="Editar" onClick={() => abrirFormularioProducto(p)}>
                              <Icon name="editar" size={16} />
                            </button>
                            <button
                              className="icono-accion"
                              title="Desactivar"
                              onClick={() => desactivarProducto(p)}
                            >
                              <Icon name="eliminar" size={16} />
                            </button>
                          </>
                        ) : (
                          <button className="icono-accion" title="Reactivar" onClick={() => activarProducto(p)}>
                            <Icon name="reactivar" size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel" id="panelHistorialCompras" hidden={subvista !== "compras"}>
        <div className="panel-encabezado">
          <h4>Historial de compras a proveedores</h4>
          <button className="btn btn-primario" id="btnRegistrarCompra2" onClick={() => abrirModalCompra()}>
            <Icon name="camion" size={18} /> Registrar compra
          </button>
        </div>
        <div className="tabla-envoltorio">
          <table className="tabla">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Proveedor</th>
                <th>Productos</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody id="tablaCompras">
              {cargandoCompras ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", color: "var(--madera-suave)", padding: 26 }}>
                    Cargando compras…
                  </td>
                </tr>
              ) : errorCompras ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", color: "var(--vino)", padding: 26 }}>
                    {errorCompras}
                  </td>
                </tr>
              ) : !compras || compras.compras.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", color: "var(--madera-suave)", padding: 26 }}>
                    Aún no registras compras.
                  </td>
                </tr>
              ) : (
                [...compras.compras]
                  .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                  .map((c) => (
                    <tr key={c.idCompra}>
                      <td>{fechaLegible(c.fecha)}</td>
                      <td>{c.proveedor}</td>
                      <td style={{ maxWidth: 320 }}>
                        {c.detalles.map((d) => `${d.producto} ×${d.cantidad}`).join(", ")}
                      </td>
                      <td className="num">{bs(c.total)}</td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel" id="panelMovimientos" hidden={subvista !== "movimientos"}>
        <div className="panel-encabezado">
          <h4>Historial de movimientos de inventario</h4>
          <span className="etiqueta-suave">Entradas y salidas</span>
        </div>
        <div className="filtros-fila">
          <input
            type="text"
            id="buscarMovimiento"
            placeholder="Buscar por producto…"
            value={buscarMovimiento}
            onChange={(e) => setBuscarMovimiento(e.target.value)}
          />
          <select
            id="filtroTipoMovimiento"
            value={filtroTipoMovimiento}
            onChange={(e) => setFiltroTipoMovimiento(e.target.value)}
          >
            <option value="todos">Todos los movimientos</option>
            <option value="ENTRADA">Entradas (compras)</option>
            <option value="SALIDA">Salidas (ventas)</option>
            <option value="AJUSTE">Ajustes</option>
          </select>
        </div>
        <div className="tabla-envoltorio">
          <table className="tabla">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Observación</th>
              </tr>
            </thead>
            <tbody id="tablaMovimientos">
              {cargandoMovimientos ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "var(--madera-suave)", padding: 26 }}>
                    Cargando movimientos…
                  </td>
                </tr>
              ) : errorMovimientos ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "var(--vino)", padding: 26 }}>
                    {errorMovimientos}
                  </td>
                </tr>
              ) : movimientosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "var(--madera-suave)", padding: 26 }}>
                    Aún no hay movimientos de inventario registrados.
                  </td>
                </tr>
              ) : (
                movimientosFiltrados.map((m) => {
                  const [clase, icono, etiqueta] = ETIQUETAS_TIPO_MOVIMIENTO[m.tipoMovimiento] ?? [
                    "badge-ajuste",
                    "ajuste",
                    m.tipoMovimiento,
                  ];
                  const fecha = new Date(m.fecha);
                  return (
                    <tr key={m.idMovimiento}>
                      <td>{fecha.toLocaleDateString("es-BO")}</td>
                      <td>{m.producto}</td>
                      <td>
                        <span className={"badge " + clase}>
                          <Icon name={icono} size={13} style={{ verticalAlign: "-2px", marginRight: 4 }} />
                          {etiqueta}
                        </span>
                      </td>
                      <td className="num">{m.cantidad}</td>
                      <td style={{ color: "var(--madera-suave)", fontSize: ".88rem" }}>{m.observacion || "—"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}