import { NavLink } from "react-router-dom";
import { Icon } from "../lib/icons";
import { NAV_ITEMS } from "./navConfig";
import { useApp } from "../context/AppContext";

interface SidebarProps {
  abierta: boolean;
  onNavegar: () => void;
}

export function Sidebar({ abierta, onNavegar }: SidebarProps) {
  const { cerrarSesion } = useApp();

  return (
    <aside className={"barra-lateral" + (abierta ? " abierta" : "")} id="barraLateral">
      <div className="marca-mini">
        <span className="marca-icono">
          <Icon name="botella" size={22} />
        </span>
        <span className="marca-texto">La Reserva</span>
      </div>
      <nav className="nav-principal">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.vista}
            to={"/" + item.vista}
            onClick={onNavegar}
            className={({ isActive }) => "nav-item" + (isActive ? " activo" : "")}
          >
            <span className="nav-ico">
              <Icon name={item.icono} />
            </span>
            <span>{item.etiqueta}</span>
          </NavLink>
        ))}
      </nav>
      <button className="btn-salir" id="btnCerrarSesion" onClick={cerrarSesion}>
        <span className="nav-ico">
          <Icon name="salir" />
        </span>
        <span>Cerrar sesión</span>
      </button>
    </aside>
  );
}
