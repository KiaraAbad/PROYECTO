import "./Paginacion.css";

function Paginacion({
  pagina = 1,
  totalPaginas = 1,
  totalResultados = 0,
  porPagina = 8,
  onCambiar,
}) {
  const inicio = totalResultados === 0 ? 0 : (pagina - 1) * porPagina + 1;
  const fin = Math.min(pagina * porPagina, totalResultados);

  return (
    <footer className="paginacion-mockup" aria-label="Navegación de páginas">
      <div className="paginacion-mockup__info" aria-live="polite">
        Mostrando {inicio} a {fin} de {totalResultados} tutores
      </div>

      <nav className="paginacion-mockup__controles" aria-label="Páginas">
        <button
          type="button"
          className="paginacion-mockup__btn paginacion-mockup__btn--flecha"
          onClick={() => onCambiar(pagina - 1)}
          disabled={pagina <= 1}
          aria-label="Página anterior"
        >
          ‹
        </button>

        {Array.from({ length: Math.max(1, totalPaginas) }, (_, i) => i + 1).map(
          (num) => (
            <button
              key={num}
              type="button"
              className={`paginacion-mockup__btn ${
                num === pagina ? "paginacion-mockup__btn--activo" : ""
              }`}
              onClick={() => onCambiar(num)}
              aria-current={num === pagina ? "page" : undefined}
            >
              {num}
            </button>
          )
        )}

        <button
          type="button"
          className="paginacion-mockup__btn paginacion-mockup__btn--flecha"
          onClick={() => onCambiar(pagina + 1)}
          disabled={pagina >= totalPaginas}
          aria-label="Página siguiente"
        >
          ›
        </button>
      </nav>
    </footer>
  );
}

export default Paginacion;
