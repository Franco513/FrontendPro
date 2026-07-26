import { useApp } from "../context/AppContext";
import { Icon } from "../lib/icons";

export function Modal() {
  const { modalAbierto, modalContenido, cerrarModal } = useApp();

  if (!modalAbierto) {
    // El original usa [hidden] con "display:none !important"; en React
    // directamente no montamos el contenido cuando está cerrado.
    return (
      <div className="modal-fondo" id="modalFondo" hidden>
        <div className="modal" id="modalCaja">
          <div id="modalContenido" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="modal-fondo"
      id="modalFondo"
      onClick={(e) => {
        if (e.target === e.currentTarget) cerrarModal();
      }}
    >
      <div className="modal" id="modalCaja">
        <button
          className="modal-cerrar"
          id="modalCerrar"
          aria-label="Cerrar"
          onClick={cerrarModal}
        >
          <Icon name="cerrar" size={16} />
        </button>
        <div id="modalContenido">{modalContenido}</div>
      </div>
    </div>
  );
}
