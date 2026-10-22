import { Link } from "react-router-dom";
import "../styles/sesiones-comun.css";
import "./Notificacion.css";

function Notificacion({ tipo = "exito", mensaje, accion, onCerrar }) {
  return (
    <div
      className={`notificacion notificacion--${tipo}`}
      role={tipo === "error" ? "alert" : "status"}
    >
      <div className="notificacion__fila">
        <p className="notificacion__mensaje">{mensaje}</p>
        <button
          type="button"
          className="notificacion__cerrar"
          aria-label="Cerrar aviso"
          onClick={onCerrar}
        >
          ✕
        </button>
      </div>
      {accion && (
        <div className="notificacion__accion">
          <Link to={accion.ruta} className="sesion-btn sesion-btn--primario" onClick={onCerrar}>
            {accion.texto}
          </Link>
        </div>
      )}
    </div>
  );
}

export default Notificacion;
