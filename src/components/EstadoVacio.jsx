import "./EstadoVacio.css";

function EstadoVacio({ onQuitarFiltros, onVerTodos }) {
  return (
    <section className="estado-sin-resultados" aria-live="polite">
      <div className="estado-sin-resultados__icono" aria-hidden="true">
        ?
      </div>
      <h2 className="estado-sin-resultados__titulo">
        Ningún tutor coincide con estos filtros
      </h2>
      <p className="estado-sin-resultados__mensaje">
        Prueba quitando el día de atención o busca en otra modalidad.
      </p>
      <div className="estado-sin-resultados__acciones">
        <button
          type="button"
          className="estado-sin-resultados__btn-primario"
          onClick={onQuitarFiltros}
        >
          Quitar filtros
        </button>
        <button
          type="button"
          className="estado-sin-resultados__btn-secundario"
          onClick={onVerTodos}
        >
          Ver todos
        </button>
      </div>
    </section>
  );
}

export default EstadoVacio;
