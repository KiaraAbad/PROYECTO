import "./FiltrosActivos.css";

function FiltrosActivos({ filtros, onQuitar, onLimpiar }) {
  const etiquetas = [
    { campo: "curso", etiqueta: "Curso", valor: filtros.curso },
    { campo: "carrera", etiqueta: "Carrera", valor: filtros.carrera },
    { campo: "modalidad", etiqueta: "Modalidad", valor: filtros.modalidad },
    { campo: "dia", etiqueta: "Día", valor: filtros.dia },
  ].filter((item) => Boolean(item.valor));

  if (etiquetas.length === 0) {
    return null;
  }

  return (
    <div className="filtros-activos" aria-label="Filtros aplicados">
      <div className="filtros-activos__chips">
        {etiquetas.map(({ campo, etiqueta, valor }) => (
          <button
            key={campo}
            type="button"
            className="filtros-activos__chip"
            onClick={() => onQuitar(campo)}
            aria-label={`Quitar filtro ${etiqueta}: ${valor}`}
          >
            <span>
              {etiqueta}: {valor}
            </span>
            <span className="filtros-activos__cruz" aria-hidden="true">
              ✕
            </span>
          </button>
        ))}

        <button
          type="button"
          className="filtros-activos__limpiar"
          onClick={onLimpiar}
        >
          Limpiar todo
        </button>
      </div>
    </div>
  );
}

export default FiltrosActivos;
