import { useEffect, useRef } from 'react';

const etiquetas = {
  programada: 'Programada',
  realizada: 'Realizada',
  'no-asistio': 'No asistió',
  cancelada: 'Cancelada',
};

export function BadgeEstadoSesion({ estado }) {
  return (
    <span className={`hu5-badge hu5-badge--${estado}`}>
      {etiquetas[estado] ?? estado}
    </span>
  );
}

export function EstadoVacio({ titulo, descripcion, children, accion, icono }) {
  return (
    <div className="hu5-empty">
      <span className="hu5-empty-icon" aria-hidden="true">
        {icono === 'enlace' ? <span>↗</span> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M7 3h7l4 4v14H6V3h1Z" />
          <path d="M14 3v5h4M9 12h6M9 16h4" />
        </svg>}
      </span>
      <h2>{titulo}</h2>
      {descripcion && <p>{descripcion}</p>}
      {children && <div className="hu5-empty-description">{children}</div>}
      {accion}
    </div>
  );
}

export function Paginacion({ pagina, total, paginaTamano = 6, onCambiar }) {
  const paginas = Math.max(1, Math.ceil(total / paginaTamano));
  const primeraSesion = total ? (pagina - 1) * paginaTamano + 1 : 0;
  const ultimaSesion = Math.min(pagina * paginaTamano, total);
  // Cinco botones como máximo: la ventana acompaña a la página seleccionada.
  const inicio = Math.max(1, Math.min(pagina - 2, paginas - 4));
  const numeros = Array.from({ length: Math.min(5, paginas) }, (_, indice) => inicio + indice);

  return (
    <div className="hu5-pagination">
      <p className="hu5-muted">
        Mostrando {primeraSesion} a {ultimaSesion} de {total} sesiones
      </p>
      <nav aria-label="Paginación de sesiones">
        <button
          type="button"
          className="hu5-icon-button"
          disabled={pagina <= 1}
          onClick={() => onCambiar(pagina - 1)}
          aria-label="Página anterior"
        >
          ‹
        </button>
        <span className="hu5-sr-only" aria-live="polite">Página {pagina} de {paginas}</span>
        {numeros.map(numero => (
          <button
            type="button"
            className={`hu5-icon-button hu5-pagina-numero${numero === pagina ? ' hu5-pagina-numero--activa' : ''}`}
            key={numero}
            aria-label={`Página ${numero}`}
            aria-current={numero === pagina ? 'page' : undefined}
            onClick={() => onCambiar(numero)}
          >
            {numero}
          </button>
        ))}
        <button
          type="button"
          className="hu5-icon-button"
          disabled={pagina >= paginas}
          onClick={() => onCambiar(pagina + 1)}
          aria-label="Página siguiente"
        >
          ›
        </button>
      </nav>
    </div>
  );
}

export function ModalConfirmacion({ titulo, children, confirmarTexto = 'Confirmar', onConfirmar, onCancelar, peligroso = false }) {
  const dialogo = useRef(null);

  // El diálogo nativo necesita abrirse desde el DOM y devolver el foco al cerrarse.
  useEffect(() => {
    const elemento = dialogo.current;
    const elementoAnterior = document.activeElement;
    elemento.showModal();

    return () => {
      elemento.close();
      elementoAnterior?.focus();
    };
  }, []);

  function cancelarConEscape(evento) {
    evento.preventDefault();
    onCancelar();
  }

  return (
    <dialog
      ref={dialogo}
      className="hu5-dialog"
      aria-labelledby="hu5-dialog-title"
      onCancel={cancelarConEscape}
    >
      <h2 id="hu5-dialog-title">{titulo}</h2>
      <div className="hu5-dialog-body">{children}</div>
      <div className="hu5-actions">
        <button
          type="button"
          className="hu5-button hu5-button--secondary"
          onClick={onCancelar}
          autoFocus
        >
          Cancelar
        </button>
        <button
          type="button"
          className={`hu5-button ${peligroso ? 'hu5-button--danger' : 'hu5-button--primary'}`}
          onClick={onConfirmar}
        >
          {confirmarTexto}
        </button>
      </div>
    </dialog>
  );
}
