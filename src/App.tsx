import { Navigate, Route, Routes } from "react-router-dom";
import { useApp } from "./context/AppContext";
import { LoginScreen } from "./views/LoginScreen";
import { AppShell } from "./layout/AppShell";
import { Dashboard } from "./views/Dashboard";
import { Ventas } from "./views/Ventas";
import { Productos } from "./views/Productos";
import { Proveedores } from "./views/Proveedores";
import { Reportes } from "./views/Reportes";
import { Config } from "./views/Config";
import { SelloOverlay } from "./components/SelloOverlay";
import { ToastStack } from "./components/ToastStack";
import { Modal } from "./components/Modal";

export function App() {
  const { sesion } = useApp();

  return (
    <>
      <SelloOverlay />
      <ToastStack />

      {!sesion.activo ? (
        <LoginScreen />
      ) : (
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="ventas" element={<Ventas />} />
            <Route path="productos" element={<Productos />} />
            <Route path="proveedores" element={<Proveedores />} />
            <Route path="reportes" element={<Reportes />} />
            <Route path="config" element={<Config />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      )}

      <Modal />
    </>
  );
}
