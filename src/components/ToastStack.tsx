import { useApp } from "../context/AppContext";

export function ToastStack() {
  const { toasts } = useApp();

  return (
    <div className="toast-pila" id="toastPila">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={
            "toast " +
            (t.tipo === "exito" ? "exito" : t.tipo === "error" ? "error" : "") +
            (t.saliendo ? " saliendo" : "")
          }
        >
          {t.mensaje}
        </div>
      ))}
    </div>
  );
}
