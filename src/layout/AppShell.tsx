import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import type { VistaId } from "./navConfig";

function vistaDesdeRuta(pathname: string): VistaId {
  const segmento = pathname.replace("/", "") as VistaId;
  const validas: VistaId[] = ["dashboard", "ventas", "productos", "proveedores", "reportes", "config"];
  return validas.includes(segmento) ? segmento : "dashboard";
}

export function AppShell() {
  const location = useLocation();
  const vista = vistaDesdeRuta(location.pathname);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  return (
    <div className="app" id="app">
      <Sidebar abierta={menuMovilAbierto} onNavegar={() => setMenuMovilAbierto(false)} />
      {menuMovilAbierto && (
        <div
          className="overlay-menu visible"
          onClick={() => setMenuMovilAbierto(false)}
        />
      )}
      <main className="contenido">
        <Header vista={vista} onAbrirMenuMovil={() => setMenuMovilAbierto(true)} />
        <Outlet />
      </main>
    </div>
  );
}
