import { useEffect, useState } from "react";
import { Icon } from "../lib/icons";
import { useApp } from "../context/AppContext";
import { TITULOS, type VistaId } from "./navConfig";

function textoReloj(): string {
  return new Date().toLocaleString("es-BO", { weekday: "long", hour: "2-digit", minute: "2-digit" });
}

interface HeaderProps {
  vista: VistaId;
  onAbrirMenuMovil: () => void;
}

export function Header({ vista, onAbrirMenuMovil }: HeaderProps) {
  const { sesion } = useApp();
  const [reloj, setReloj] = useState(textoReloj());

  useEffect(() => {
    const id = setInterval(() => setReloj(textoReloj()), 1000 * 30);
    return () => clearInterval(id);
  }, []);

  const iniciales = sesion.nombre
    ? sesion.nombre
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";
  const [titulo, subtitulo] = TITULOS[vista];

  return (
    <header className="encabezado">
      <button
        className="btn-menu-movil"
        id="btnMenuMovil"
        aria-label="Abrir menú"
        onClick={onAbrirMenuMovil}
      >
        <Icon name="menu" size={22} />
      </button>
      <div className="encabezado-titulo">
        <h2 id="tituloVista">{titulo}</h2>
        <p id="subtituloVista">{subtitulo}</p>
      </div>
      <div className="encabezado-usuario">
        <span className="reloj" id="relojActual">
          {reloj}
        </span>
        <div className="chip-usuario">
          <span className="avatar">{iniciales}</span>
          <span id="nombreUsuarioTop">{sesion.nombre ?? ""}</span>
        </div>
      </div>
    </header>
  );
}
