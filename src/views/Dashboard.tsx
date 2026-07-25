import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Icon } from "../lib/icons";
import { bs, fechaLegible, horaConSegundos } from "../lib/format";
import { useApiResource } from "../lib/useAsync";
import { productoService } from "../services/productoService";
import { reporteService } from "../services/reporteService";
import { ventaService } from "../services/ventaService";

async function cargarResumenDashboard() {
  const [ventasHoy, alertas, productos, ventas] = await Promise.all([
    reporteService.ventasDiario(),
    productoService.alertas(),
    productoService.listar(),
    ventaService.listar(),
  ]);
  return { ventasHoy, alertas, productos, ventas };
}

export function Dashboard() {
  const { sesion } = useApp();
  const { datos, cargando, error, recargar } = useApiResource(cargarResumenDashboard);

  const hora = new Date().getHours();
  const saludo = hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches";
  const nombre = sesion.nombre?.split(" ")[0] || "";

  if (cargando) {
    return (
      <section className="vista activa" id="vista-dashboard">
        <p className="texto-ayuda">Cargando tu resumen…</p>
      </section>
    );
  }

  if (error || !datos) {
    return (
      <section className="vista activa" id="vista-dashboard">
        <p className="login-error visible">{error || "No se pudo cargar la información."}</p>
        <button className="btn btn-secundario" onClick={recargar}>
          Reintentar
        </button>
      </section>
    );
  }

  const { ventasHoy, alertas, productos, ventas } = datos;
  const productosActivos = productos.filter((p) => p.activo);
  const ultimasVentas = [...ventas]
    .sort((a, b) => new Date(b.fecha + "T" + b.hora).getTime() - new Date(a.fecha + "T" + a.hora).getTime())
    .slice(0, 6);

  return (
    <section className="vista activa" id="vista-dashboard">
      <div className="saludo-tarjeta">
        <div>
          <p className="saludo-eyebrow" id="saludoDia">
            {saludo}
          </p>
          <h3 id="saludoNombre">
            {saludo}, {nombre}. Tu negocio está en buenas manos.
          </h3>
          <p className="saludo-sub">Aquí tienes el resumen de tu licorería.</p>
        </div>
        <div className="saludo-sello">
          <Icon name="escudo" size={30} />
        </div>
      </div>

      <div className="tarjetas-kpi">
        <div className="kpi kpi-ambar">
          <span className="kpi-icono-badge">
            <Icon name="moneda" />
          </span>
          <div>
            <p className="kpi-label">Ventas de hoy</p>
            <p className="kpi-valor" id="kpiVentasHoy">
              {bs(ventasHoy.totalIngresos)}
            </p>
          </div>
        </div>
        <div className="kpi kpi-verde">
          <span className="kpi-icono-badge">
            <Icon name="tendencia" />
          </span>
          <div>
            <p className="kpi-label">Ganancia de hoy</p>
            <p className="kpi-valor" id="kpiGananciaHoy">
              {bs(ventasHoy.totalGanancia)}
            </p>
          </div>
        </div>
        <div className="kpi kpi-vino">
          <span className="kpi-icono-badge">
            <Icon name="alerta" />
          </span>
          <div>
            <p className="kpi-label">Stock bajo</p>
            <p className="kpi-valor" id="kpiStockBajo">
              {alertas.totalEnAlerta} producto{alertas.totalEnAlerta === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <div className="kpi kpi-madera">
          <span className="kpi-icono-badge">
            <Icon name="carpeta" />
          </span>
          <div>
            <p className="kpi-label">Productos activos</p>
            <p className="kpi-valor" id="kpiProductos">
              {productosActivos.length}
            </p>
          </div>
        </div>
      </div>

      <div className="fila-dos-columnas">
        <div className="panel">
          <div className="panel-encabezado">
            <h4>Alertas de inventario</h4>
            <span className="etiqueta-suave">Reponer pronto</span>
          </div>
          <div id="listaAlertas" className="lista-alertas">
            {alertas.productos.length === 0 ? (
              <p className="sin-alertas">
                <Icon name="circuloCheck" size={18} style={{ verticalAlign: "-4px", marginRight: 6 }} />
                Todo tu stock está en orden.
              </p>
            ) : (
              alertas.productos.map((p) => (
                <div className="alerta-item" key={p.idProducto}>
                  <span>
                    <Icon
                      name={p.stockActual === 0 ? "circuloX" : "alerta"}
                      size={16}
                      style={{ verticalAlign: "-3px", marginRight: 6 }}
                    />
                    {p.nombre}
                  </span>
                  <span className="stock">{p.stockActual === 0 ? "Agotado" : p.stockActual + " uds."}</span>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="panel">
          <div className="panel-encabezado">
            <h4>Últimas ventas</h4>
            <Link to="/ventas" className="link-accion">
              Ver todas <Icon name="flecha" size={14} />
            </Link>
          </div>
          <div id="listaUltimasVentas" className="lista-ultimas-ventas">
            {ultimasVentas.length === 0 ? (
              <p className="sin-alertas" style={{ color: "var(--madera-suave)" }}>
                Aún no registras ventas.
              </p>
            ) : (
              ultimasVentas.map((v) => (
                <div className="venta-item" key={v.idVenta}>
                  <span>
                    {fechaLegible(v.fecha)} <span className="venta-hora">{horaConSegundos(v.hora)}</span>
                  </span>
                  <span className="venta-monto">{bs(v.total)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="accesos-rapidos">
        <Link to="/ventas?accion=nueva-venta" className="acceso-rapido">
          <Icon name="carrito" size={26} /> Registrar venta
        </Link>
        <Link to="/productos?accion=registrar-compra" className="acceso-rapido">
          <Icon name="camion" size={26} /> Registrar compra
        </Link>
        <Link to="/reportes" className="acceso-rapido">
          <Icon name="calculadora" size={26} /> Ver reportes
        </Link>
      </div>
    </section>
  );
}