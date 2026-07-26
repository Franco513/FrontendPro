import { useApp } from "../context/AppContext";

/** Sello de confirmación — el elemento firma de la experiencia (migrado 1:1). */
export function SelloOverlay() {
  const { selloVisible, selloTexto } = useApp();

  return (
    <div className={"sello-overlay" + (selloVisible ? " mostrar" : "")} id="selloOverlay">
      <div className="sello" id="sello">
        <svg viewBox="0 0 120 120" width={120} height={120}>
          <circle cx={60} cy={60} r={54} className="sello-anillo-ext" />
          <circle cx={60} cy={60} r={42} className="sello-anillo-int" />
          <path
            id="selloCheck"
            className="sello-check"
            d="M40 62 L54 76 L82 46"
            fill="none"
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="sello-texto" id="selloTexto">
          {selloTexto}
        </p>
      </div>
    </div>
  );
}
