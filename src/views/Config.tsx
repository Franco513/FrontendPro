import { CambioPasswordForm } from "../forms/CambioPasswordForm";
import { AgregarUsuarioForm } from "../forms/AgregarUsuarioForm";
import { fechaLegible } from "../lib/format";
import { useApiResource } from "../lib/useAsync";
import { auditoriaService } from "../services/auditoriaService";

export function Config() {
  return (
    <section className="vista activa" id="vista-config">
      <div className="panel panel-angosto">
        <div className="panel-encabezado">
          <h4>Cambiar contraseña</h4>
        </div>
        <CambioPasswordForm />
      </div>

      <div className="panel panel-angosto">
        <div className="panel-encabezado">
          <h4>Agregar usuario</h4>
        </div>
        <AgregarUsuarioForm />
      </div>

      <AuditoriaPanel />
    </section>
  );
}

/**
 * Auditoría — usa GET /api/Auditoria (AuditoriaController.GetAuditorias).
 * El campo `fecha` de Auditoria se guarda como "date" en PostgreSQL (ver
 * LICORERIA_DBContext.OnModelCreating, que fuerza SetColumnType("date") a
 * toda propiedad DateTime del modelo), así que aunque el backend arma el
 * valor con DateTime.Now, una vez releído de la base no conserva hora — por
 * eso acá se muestra solo con fechaLegible (fecha), nunca con hora.
 */
function AuditoriaPanel() {
  const { datos, cargando, error, recargar } = useApiResource(() => auditoriaService.listar());

  return (
    <div className="panel">
      <div className="panel-encabezado">
        <h4>Auditoría</h4>
        <span className="etiqueta-suave">Últimos cambios registrados</span>
      </div>
      <div className="tabla-envoltorio">
        <table className="tabla">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tabla</th>
              <th>Acción</th>
              <th>Usuario</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", color: "var(--madera-suave)", padding: 26 }}>
                  Cargando auditoría…
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", color: "var(--vino)", padding: 26 }}>
                  {error}{" "}
                  <button className="link-accion" style={{ display: "inline" }} onClick={recargar}>
                    Reintentar
                  </button>
                </td>
              </tr>
            ) : !datos || datos.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", color: "var(--madera-suave)", padding: 26 }}>
                  Aún no hay registros de auditoría.
                </td>
              </tr>
            ) : (
              datos.slice(0, 100).map((a) => (
                <tr key={a.idAuditoria}>
                  <td>{fechaLegible(a.fecha)}</td>
                  <td>{a.tabla}</td>
                  <td>{a.accion}</td>
                  <td>{a.usuario}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
