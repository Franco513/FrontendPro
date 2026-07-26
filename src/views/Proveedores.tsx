import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "../lib/icons";
import { useApiResource } from "../lib/useAsync";
import { extraerMensajeError } from "../lib/apiClient";
import { proveedorService } from "../services/proveedorService";
import { ProveedorForm } from "../forms/ProveedorForm";
import type { ProveedorApi } from "../types/api";

export function Proveedores() {
  const { mostrarToast, abrirModal } = useApp();
  const [buscar, setBuscar] = useState("");
  const { datos: proveedores, cargando, error, recargar } = useApiResource(() => proveedorService.listar());

  function abrirFormularioProveedor(p?: ProveedorApi) {
    abrirModal(<ProveedorForm proveedor={p ?? null} onGuardado={recargar} />);
  }

  async function desactivarProveedor(p: ProveedorApi) {
    if (!confirm(`¿Desactivar "${p.nombre}"?`)) return;
    try {
      // DELETE /api/Proveedor/{id}
      await proveedorService.eliminar(p.idProveedor);
      mostrarToast("Proveedor desactivado", "info");
      recargar();
    } catch (err) {
      mostrarToast(extraerMensajeError(err), "error");
    }
  }

  const proveedoresFiltrados = useMemo(() => {
    if (!proveedores) return [];
    const texto = buscar.toLowerCase();
    return proveedores.filter((p) => p.nombre.toLowerCase().includes(texto) || (p.telefono || "").includes(texto));
  }, [proveedores, buscar]);

  return (
    <section className="vista activa" id="vista-proveedores">
      <div className="panel">
        <div className="panel-encabezado">
          <h4>Proveedores</h4>
          <button className="btn btn-primario" id="btnNuevoProveedor" onClick={() => abrirFormularioProveedor()}>
            <Icon name="agregar" size={18} /> Nuevo proveedor
          </button>
        </div>
        <div className="filtros-fila">
          <input
            type="text"
            id="buscarProveedor"
            placeholder="Buscar por nombre o teléfono…"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
          />
        </div>
        <div className="tabla-envoltorio">
          <table className="tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Dirección</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="tablaProveedores">
              {cargando ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "var(--madera-suave)", padding: 26 }}>
                    Cargando proveedores…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "var(--vino)", padding: 26 }}>
                    {error}{" "}
                    <button className="link-accion" style={{ display: "inline" }} onClick={recargar}>
                      Reintentar
                    </button>
                  </td>
                </tr>
              ) : proveedoresFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "var(--madera-suave)", padding: 26 }}>
                    No se encontraron proveedores.
                  </td>
                </tr>
              ) : (
                proveedoresFiltrados.map((p) => (
                  <tr key={p.idProveedor}>
                    <td>
                      <strong>{p.nombre}</strong>
                    </td>
                    <td className="num">{p.telefono}</td>
                    <td>{p.direccion}</td>
                    <td>
                      {p.activo ? (
                        <span className="badge badge-ok">Activo</span>
                      ) : (
                        <span className="badge badge-inactivo">Inactivo</span>
                      )}
                    </td>
                    <td>
                      <button className="icono-accion" title="Editar" onClick={() => abrirFormularioProveedor(p)}>
                        <Icon name="editar" size={16} />
                      </button>
                      {p.activo && (
                        <button className="icono-accion" title="Desactivar" onClick={() => desactivarProveedor(p)}>
                          <Icon name="eliminar" size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
