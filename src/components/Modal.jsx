import { useEffect, useId } from "react";
import "../styles/sesiones-comun.css";
import "./Modal.css";

function Modal({ titulo, subtitulo, tamano = "normal", onCerrar, children }) {
  const idTitulo = useId();

  useEffect(() => {
    const alPresionar = (evento) => {
      if (evento.key === "Escape") onCerrar();
    };
    document.addEventListener("keydown", alPresionar);
    return () => document.removeEventListener("keydown", alPresionar);
  }, [onCerrar]);

  const clasePanel = `modal__panel ${tamano === "angosto" ? "modal__panel--angosto" : ""} ${tamano === "ancho" ? "modal__panel--ancho" : ""
    }`;

  return (
    <div
      className="modal__fondo"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) onCerrar();
      }}
    >
      <div className={clasePanel} role="dialog" aria-modal="true" aria-labelledby={idTitulo}>
        <div className="modal__encabezado">
          <div>
            <h2 id={idTitulo} className="modal__titulo">
              {titulo}
            </h2>
            {subtitulo && <p className="modal__subtitulo">{subtitulo}</p>}
          </div>
          <button type="button" className="modal__cerrar" aria-label="Cerrar" onClick={onCerrar}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default Modal;
