interface GraficoBarrasProps {
  etiquetas: string[];
  valores: number[];
  verde?: boolean;
}

export function GraficoBarras({ etiquetas, valores, verde }: GraficoBarrasProps) {
  const max = Math.max(...valores, 1);
  return (
    <div className="grafico-barras">
      {etiquetas.map((etiqueta, i) => {
        const alto = Math.max((valores[i] / max) * 100, 3);
        return (
          <div className="barra-col" key={etiqueta + i}>
            <span className="barra-valor">{valores[i] > 0 ? "Bs " + valores[i].toFixed(0) : ""}</span>
            <div className={"barra" + (verde ? " verde" : "")} style={{ height: alto + "%" }} />
            <span className="barra-etq">{etiqueta}</span>
          </div>
        );
      })}
    </div>
  );
}
