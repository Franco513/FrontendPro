import { useMemo, useState } from "react";
import { Icon } from "../lib/icons";
import { GraficoBarras } from "../components/GraficoBarras";
import { useApiResource } from "../lib/useAsync";
import { reporteService } from "../services/reporteService";

type ReporteId = "ventas" | "ganancias" | "inventario";
type Periodo = "diario" | "semanal" | "mensual";

/**
 * El backend solo expone un período a la vez (GET /Reporte/Ventas/Diario,
 * /Semanal, /Mensual — cada uno recibe una sola fecha). No existe un
 * endpoint que devuelva una serie de varios períodos, así que para armar
 * el gráfico de barras se hacen varias llamadas en paralelo (una por
 * punto): 7 días, 6 semanas o 6 meses, para no saturar la API.
 */
async function cargarSerie(periodo: Periodo, tipo: "ventas" | "ganancias") {
  const hoy = new Date();
  const fetcher =
    tipo === "ventas"
      ? periodo === "diario"
        ? reporteService.ventasDiario
        : periodo === "semanal"
        ? reporteService.ventasSemanal
        : null
      : periodo === "diario"
      ? reporteService.gananciasDiario
      : periodo === "semanal"
      ? reporteService.gananciasSemanal
      : null;

  if (periodo === "mensual") {
    const n = 6;
    const llamadas = Array.from({ length: n }, (_, i) => {
      const d = new Date(hoy.getFullYear(), hoy.getMonth() - (n - 1 - i), 1);
      const anio = d.getFullYear();
      const mes = d.getMonth() + 1;
      const etiqueta = d.toLocaleDateString("es-BO", { month: "short" });
      const promesa =
        tipo === "ventas" ? reporteService.ventasMensual(anio, mes) : reporteService.gananciasMensual(anio, mes);
      return promesa.then((r) => ({ etiqueta, valor: tipo === "ventas" ? r.totalIngresos : r.totalGanancia }));
    });
    return Promise.all(llamadas);
  }

  const n = periodo === "diario" ? 7 : 6;
  const pasoDias = periodo === "diario" ? 1 : 7;
  const llamadas = Array.from({ length: n }, (_, i) => {
    const d = new Date(hoy);
    d.setDate(d.getDate() - (n - 1 - i) * pasoDias);
    const fechaISO = d.toISOString().slice(0, 10);
    const etiqueta =
      periodo === "diario"
        ? d.toLocaleDateString("es-BO", { day: "2-digit", month: "2-digit" })
        : `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    // fetcher siempre está definido aquí (periodo !== "mensual")
    return fetcher!(fechaISO).then((r) => ({ etiqueta, valor: tipo === "ventas" ? r.totalIngresos : r.totalGanancia }));
  });
  return Promise.all(llamadas);
}

export function Reportes() {
  const [reporte, setReporte] = useState<ReporteId>("ventas");
  const [periodo, setPeriodo] = useState<Periodo>("diario");

  const {
    datos: serie,
    cargando: cargandoSerie,
    error: errorSerie,
  } = useApiResource(
    () => cargarSerie(periodo, reporte === "ganancias" ? "ganancias" : "ventas"),
    [periodo, reporte]
  );

  const {
    datos: inventario,
    cargando: cargandoInventario,
    error: errorInventario,
  } = useApiResource(() => reporteService.inventario(), []);

  const etiquetas = useMemo(() => serie?.map((p) => p.etiqueta) ?? [], [serie]);
  const valores = useMemo(() => serie?.map((p) => p.valor) ?? [], [serie]);

  const resumenInventario = useMemo(() => {
    if (!inventario) return { ok: 0, bajo: 0, agotado: 0 };
    return {
      ok: inventario.filter((p) => p.estado === "Disponible").length,
      bajo: inventario.filter((p) => p.estado === "Stock Bajo").length,
      agotado: inventario.filter((p) => p.estado === "Agotado").length,
    };
  }, [inventario]);

  return (
    <section className="vista activa" id="vista-reportes">
      <div className="tabs-reportes">
        <button className={"tab-reporte" + (reporte === "ventas" ? " activo" : "")} onClick={() => setReporte("ventas")}>
          Ventas
        </button>
        <button
          className={"tab-reporte" + (reporte === "ganancias" ? " activo" : "")}
          onClick={() => setReporte("ganancias")}
        >
          Ganancias
        </button>
        <button
          className={"tab-reporte" + (reporte === "inventario" ? " activo" : "")}
          onClick={() => setReporte("inventario")}
        >
          Inventario
        </button>
      </div>

      {reporte !== "inventario" && (
        <div className="selector-periodo" id="selectorPeriodoReporte">
          <button
            className={"chip-periodo" + (periodo === "diario" ? " activo" : "")}
            onClick={() => setPeriodo("diario")}
          >
            <Icon name="calendario" size={15} /> Diario
          </button>
          <button
            className={"chip-periodo" + (periodo === "semanal" ? " activo" : "")}
            onClick={() => setPeriodo("semanal")}
          >
            <Icon name="calendario" size={15} /> Semanal
          </button>
          <button
            className={"chip-periodo" + (periodo === "mensual" ? " activo" : "")}
            onClick={() => setPeriodo("mensual")}
          >
            <Icon name="calendario" size={15} /> Mensual
          </button>
        </div>
      )}

      <div className="panel reporte-panel" id="reporte-ventas" hidden={reporte !== "ventas"}>
        <div className="panel-encabezado">
          <h4>Ventas por período</h4>
        </div>
        {cargandoSerie ? (
          <p className="texto-ayuda">Cargando…</p>
        ) : errorSerie ? (
          <p className="login-error visible">{errorSerie}</p>
        ) : (
          <GraficoBarras etiquetas={etiquetas} valores={valores} />
        )}
      </div>

      <div className="panel reporte-panel" id="reporte-ganancias" hidden={reporte !== "ganancias"}>
        <div className="panel-encabezado">
          <h4>Ganancias por período</h4>
        </div>
        {cargandoSerie ? (
          <p className="texto-ayuda">Cargando…</p>
        ) : errorSerie ? (
          <p className="login-error visible">{errorSerie}</p>
        ) : (
          <GraficoBarras etiquetas={etiquetas} valores={valores} verde />
        )}
      </div>

      <div className="panel reporte-panel" id="reporte-inventario" hidden={reporte !== "inventario"}>
        <div className="panel-encabezado">
          <h4>Estado del inventario</h4>
        </div>
        {cargandoInventario ? (
          <p className="texto-ayuda">Cargando…</p>
        ) : errorInventario ? (
          <p className="login-error visible">{errorInventario}</p>
        ) : (
          <div className="resumen-inventario" id="resumenInventario">
            <div className="resumen-caja ok">
              <div className="num-grande">{resumenInventario.ok}</div>
              <div>Con buen stock</div>
            </div>
            <div className="resumen-caja bajo">
              <div className="num-grande">{resumenInventario.bajo}</div>
              <div>Con stock bajo</div>
            </div>
            <div className="resumen-caja agotado">
              <div className="num-grande">{resumenInventario.agotado}</div>
              <div>Agotados</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
