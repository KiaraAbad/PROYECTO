import { Link } from "react-router-dom";
import BadgeEstadoSesion from "./BadgeEstadoSesion";
import { formatearFecha } from "../utils/reglasSesion";
import "../styles/sesiones-comun.css";
import "./TarjetaSesion.css";

function TarjetaSesion({ sesion, rol = "estudiante", compacta = false, onCalificar }) {
  const persona = rol === "tutor" ? sesion.estudiante : sesion.tutor;
  const destino = `/mis-sesiones/${sesion.codigo}`;
  const detalle = `${sesion.curso.codigo} ${sesion.curso.nombre} · «${sesion.tema}»${compacta ? "" : ` · ${sesion.modalidad}`
    }`;

  function renderAccion() {
    if (sesion.estado === "horario-propuesto") {
      return (
        <Link to={destino} state={{ rol }} className="sesion-btn sesion-btn--primario">
          Revisar propuesta
        </Link>
      );
    }
    if (sesion.estado === "realizada" && rol === "estudiante") {
      return <>
        <Link to={destino} state={{ rol }} className="sesion-btn sesion-btn--texto">Ver detalle</Link>
        {sesion.calificacion != null
          ? <span className="tarjeta-sesion__texto-accion">Calificada {sesion.calificacion.toFixed(1)}</span>
          : <button type="button" className="sesion-btn sesion-btn--acento" onClick={() => onCalificar?.(sesion)}>Calificar</button>}
      </>;
    }
    return (
      <Link
        to={destino}
        state={{ rol }}
        className={`sesion-btn ${compacta ? "sesion-btn--texto" : "sesion-btn--contorno"}`}
      >
        Ver detalle
      </Link>
    );
  }

  return (
    <article className={`tarjeta-sesion ${compacta ? "tarjeta-sesion--compacta" : ""}`}>
      <div className="tarjeta-sesion__avatar" aria-hidden="true">
        {persona.fotoUrl ? (
          <img src={persona.fotoUrl} alt="" className="tarjeta-sesion__foto" />
        ) : null}
      </div>

      <div className="tarjeta-sesion__info">
        <h3 className="tarjeta-sesion__nombre">{persona.nombreCompleto}</h3>
        <p className="tarjeta-sesion__detalle">{detalle}</p>
        {!compacta && sesion.estado === "pendiente" && (
          <p className="tarjeta-sesion__nota">Esperando la respuesta del tutor.</p>
        )}
        {sesion.estado === "rechazada" && sesion.motivoRechazo && (
          <p className="tarjeta-sesion__detalle">Motivo: {sesion.motivoRechazo}</p>
        )}
      </div>

      <div className="tarjeta-sesion__fecha">
        {compacta ? (
          <p className="tarjeta-sesion__dia">
            {formatearFecha(sesion.fecha)} · {sesion.horaInicio} a {sesion.horaFin}
          </p>
        ) : (
          <>
            <p className="tarjeta-sesion__dia">{formatearFecha(sesion.fecha)}</p>
            <p className="tarjeta-sesion__hora">
              {sesion.horaInicio} a {sesion.horaFin}
            </p>
          </>
        )}
      </div>

      <div className="tarjeta-sesion__estado">
        <BadgeEstadoSesion estado={sesion.estado} />
      </div>

      <div className="tarjeta-sesion__accion">{renderAccion()}</div>
    </article>
  );
}

export default TarjetaSesion;
