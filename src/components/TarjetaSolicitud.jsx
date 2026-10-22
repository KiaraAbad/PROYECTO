import { Link } from "react-router-dom";
import {
  HORAS_RESPUESTA_TUTOR,
  abreviarCarrera,
  fechaSolicitud,
  formatearFechaCorta,
  formatearFechaLarga,
  hace,
  horasDesdeSolicitud,
} from "../utils/reglasSesion";
import "../styles/sesiones-comun.css";
import "./TarjetaSolicitud.css";

function TarjetaSolicitud({
  solicitud,
  error = "",
  onAceptar,
  onRechazar,
  onProponer,
  onAceptarPropuesta,
  onRechazarPropuesta,
}) {
  const { estudiante, horarioAlternativo: propuesta } = solicitud;
  const esPendiente = solicitud.estado === "pendiente";
  const propuestaDelEstudiante =
    solicitud.estado === "horario-propuesto" && propuesta.propuestoPor === "estudiante";
  const propuestaDelTutor = solicitud.estado === "horario-propuesto" && propuesta.propuestoPor === "tutor";
  const vencida = esPendiente && horasDesdeSolicitud(solicitud) > HORAS_RESPUESTA_TUTOR;

  return (
    <article className="tarjeta-solicitud">
      <div className="tarjeta-solicitud__cabecera">
        <div className="tarjeta-solicitud__persona">
          <div className="tarjeta-solicitud__avatar" aria-hidden="true" />
          <div>
            <h3 className="tarjeta-solicitud__nombre">{estudiante.nombreCompleto}</h3>
            <p className="tarjeta-solicitud__meta">
              {abreviarCarrera(estudiante.carrera)} · {estudiante.ciclo}.º ciclo · solicitó {hace(fechaSolicitud(solicitud))}
            </p>
            {vencida && (
              <p className="tarjeta-solicitud__meta tarjeta-solicitud__meta--aviso">
                Más de {HORAS_RESPUESTA_TUTOR} horas sin responder
              </p>
            )}
          </div>
        </div>

        <div className="tarjeta-solicitud__bloque">
          <p className="tarjeta-solicitud__fecha">
            {formatearFechaCorta(solicitud.fecha)} · {solicitud.horaInicio} a {solicitud.horaFin}
          </p>
          <p className="tarjeta-solicitud__curso">
            {solicitud.curso.codigo} {solicitud.curso.nombre} · {solicitud.modalidad}
          </p>
        </div>
      </div>

      <p className="tarjeta-solicitud__tema">«{solicitud.tema}»</p>

      {propuestaDelEstudiante && (
        <p className="tarjeta-solicitud__nota">
          El estudiante propone reprogramar para el {formatearFechaLarga(propuesta.fecha)},{" "}
          {propuesta.horaInicio} a {propuesta.horaFin}.
        </p>
      )}
      {propuestaDelTutor && (
        <p className="tarjeta-solicitud__nota">
          Propusiste el {formatearFechaLarga(propuesta.fecha)}, {propuesta.horaInicio} a {propuesta.horaFin}.
          Esperando la respuesta del estudiante.
        </p>
      )}
      {error && (
        <p className="tarjeta-solicitud__error" role="alert">
          {error}
        </p>
      )}

      <div className="tarjeta-solicitud__acciones">
        {esPendiente && (
          <>
            <button
              type="button"
              className="sesion-btn sesion-btn--texto-peligro"
              onClick={() => onRechazar(solicitud)}
            >
              Rechazar
            </button>
            <button
              type="button"
              className="sesion-btn sesion-btn--contorno"
              onClick={() => onProponer(solicitud)}
            >
              Proponer otro horario
            </button>
            <button
              type="button"
              className="sesion-btn sesion-btn--primario"
              onClick={() => onAceptar(solicitud)}
            >
              Aceptar
            </button>
          </>
        )}
        {propuestaDelEstudiante && (
          <>
            <button
              type="button"
              className="sesion-btn sesion-btn--texto-peligro"
              onClick={() => onRechazarPropuesta(solicitud)}
            >
              Rechazar propuesta
            </button>
            <button
              type="button"
              className="sesion-btn sesion-btn--primario"
              onClick={() => onAceptarPropuesta(solicitud)}
            >
              Aceptar propuesta
            </button>
          </>
        )}
        {propuestaDelTutor && (
          <Link
            to={`/mis-sesiones/${solicitud.codigo}`}
            state={{ rol: "tutor" }}
            className="sesion-btn sesion-btn--contorno"
          >
            Ver detalle
          </Link>
        )}
      </div>
    </article>
  );
}

export default TarjetaSolicitud;
