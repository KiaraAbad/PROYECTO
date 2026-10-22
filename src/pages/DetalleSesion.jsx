import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BadgeEstadoSesion from "../components/BadgeEstadoSesion";
import TrazabilidadSesion from "../components/TrazabilidadSesion";
import ModalCancelarSesion from "../components/ModalCancelarSesion";
import ModalProponerHorario from "../components/ModalProponerHorario";
import EstadoVacioAgenda from "../components/EstadoVacioAgenda";
import EsqueletoSesiones from "../components/EsqueletoSesiones";
import Notificacion from "../components/Notificacion";
import { useSesiones } from "../hooks/useSesiones";
import { useAviso } from "../hooks/useAviso";
import {
  HORAS_LIMITE_CANCELACION,
  HORAS_VENTANA_CIERRE,
  abreviarCarrera,
  capitalizar,
  esActiva,
  evaluarCancelacion,
  evaluarCierre,
  formatearFechaLarga,
} from "../utils/reglasSesion";
import "../styles/sesiones-comun.css";
import "../styles/detalle-sesion.css";

function DetalleSesion() {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const { usuario, rol } = useSesiones();

  const { sesiones, todas, cargando, cancelar, proponer, aceptarNuevoHorario, rechazarNuevoHorario } =
    useSesiones(usuario.id);
  const { aviso, avisar, cerrarAviso } = useAviso();

  const [cancelando, setCancelando] = useState(false);
  const [reprogramando, setReprogramando] = useState(false);

  const sesion = sesiones.find((item) => item.codigo === codigo
    && (rol === 'tutor' ? item.tutorId : item.estudianteId) === usuario.id);

  function pagina(contenido) {
    return (
      <div className="agenda-page">
        <Header />
        <main className="agenda-container">{contenido}</main>
        <Footer rol={rol} />
        {aviso && (
          <Notificacion tipo={aviso.tipo} mensaje={aviso.mensaje} accion={aviso.accion} onCerrar={cerrarAviso} />
        )}
      </div>
    );
  }

  if (cargando) return pagina(<EsqueletoSesiones cantidad={3} mensaje="Cargando sesión..." />);

  if (!sesion) {
    return pagina(
      <EstadoVacioAgenda
        icono="?"
        titulo="No encontramos esta sesión"
        mensaje="El código puede ser incorrecto o la sesión no es tuya."
        textoAccion="Ir a mis sesiones"
        destino="/mis-sesiones"
      />
    );
  }

  const cancelacion = evaluarCancelacion(sesion);
  const cierre = evaluarCierre(sesion);
  const propuesta = sesion.horarioAlternativo;
  const puedeResponder = sesion.estado === "horario-propuesto" && propuesta.propuestoPor !== rol;
  const tutorConSolicitud = rol === "tutor" && sesion.estado === "pendiente";
  const programadasDelTutor = todas.filter(
    (item) => item.tutorId === sesion.tutorId && item.estado === "programada"
  );

  function confirmarCancelacion() {
    const resultado = cancelar(sesion.codigo);
    setCancelando(false);
    if (resultado.ok) avisar("exito", `Sesión ${sesion.codigo} cancelada. Le avisaremos a la otra persona.`);
    else avisar("error", resultado.error.mensaje);
  }

  function responderPropuesta(aceptar) {
    const resultado = aceptar ? aceptarNuevoHorario(sesion.codigo) : rechazarNuevoHorario(sesion.codigo);
    if (resultado.ok) avisar("exito", aceptar ? "Propuesta aceptada. La sesión quedó programada." : "Propuesta rechazada.");
    else avisar("error", resultado.error.mensaje);
  }

  function manejarPropuesta(horario, mensaje) {
    const resultado = proponer(sesion.codigo, horario, mensaje);
    if (resultado.ok) avisar("exito", "Propuesta enviada. Te avisaremos cuando la otra persona responda.");
    return resultado;
  }

  return pagina(
    <>
      <div className="detalle-sesion__migas">
        <Link to="/mis-sesiones">Mis sesiones</Link>
        <span>›</span>
        <span>Sesión {sesion.codigo}</span>
      </div>

      <div className="detalle-sesion__encabezado">
        <div>
          <h1 className="detalle-sesion__titulo">
            Sesión {sesion.codigo} <BadgeEstadoSesion estado={sesion.estado} />
          </h1>
          <p className="agenda-subtitulo">
            {capitalizar(formatearFechaLarga(sesion.fecha))} · {sesion.horaInicio} a {sesion.horaFin} · modalidad{" "}
            {sesion.modalidad}
          </p>
        </div>

        {esActiva(sesion) && (
          <div className="detalle-sesion__acciones">
            {!tutorConSolicitud && (
              <button
                type="button"
                className="sesion-btn sesion-btn--texto-peligro"
                disabled={!cancelacion.permitido}
                title={cancelacion.motivo ?? undefined}
                onClick={() => setCancelando(true)}
              >
                Cancelar sesión
              </button>
            )}
            {sesion.estado === "programada" && (
              <button
                type="button"
                className="sesion-btn sesion-btn--contorno"
                disabled={!cancelacion.permitido}
                title={cancelacion.motivo ?? undefined}
                onClick={() => setReprogramando(true)}
              >
                Reprogramar
              </button>
            )}
            {rol === "tutor" && sesion.estado === "programada" && (
              <button
                type="button"
                className="sesion-btn sesion-btn--primario"
                disabled={!cierre.permitido}
                title={cierre.motivo ?? undefined}
                onClick={() => navigate(`/sesiones/${sesion.codigo}/cerrar`)}
              >
                Cerrar sesión
              </button>
            )}
          </div>
        )}
        {rol === "tutor" && sesion.estado === "programada" && !cierre.permitido && (
          <p className="detalle-sesion__ayuda-cierre">{cierre.motivo}</p>
        )}
      </div>

      <div className="detalle-sesion__acciones">
        <Link to={`/sesiones/${sesion.codigo}`} className="sesion-btn sesion-btn--contorno">
          Ver notas y desarrollo
        </Link>
        <Link to={`/sesiones/${sesion.codigo}/material`} className="sesion-btn sesion-btn--contorno">
          Material compartido ({sesion.cierre?.material.length ?? 0})
        </Link>
      </div>

      {tutorConSolicitud && (
        <div className="detalle-sesion__banner detalle-sesion__banner--aviso">
          <p>Esta solicitud espera tu respuesta: acéptala, recházala o propón otro horario.</p>
          <Link to="/solicitudes" className="sesion-btn sesion-btn--contorno sesion-btn--chico">
            Ir a solicitudes recibidas
          </Link>
        </div>
      )}

      {sesion.estado === "horario-propuesto" && (
        <div className="detalle-sesion__banner detalle-sesion__banner--aviso">
          <p>
            {propuesta.propuestoPor === "tutor" ? "El tutor" : "El estudiante"} propone el{" "}
            <strong>
              {formatearFechaLarga(propuesta.fecha)}, {propuesta.horaInicio} a {propuesta.horaFin}
            </strong>
            .{propuesta.mensaje ? ` «${propuesta.mensaje}»` : ""}
            {puedeResponder ? " ¿Aceptas el nuevo horario?" : " Esperando la respuesta de la otra persona."}
          </p>
          {puedeResponder && (
            <div className="detalle-sesion__banner-acciones">
              <button
                type="button"
                className="sesion-btn sesion-btn--texto-peligro"
                onClick={() => responderPropuesta(false)}
              >
                Rechazar propuesta
              </button>
              <button
                type="button"
                className="sesion-btn sesion-btn--primario"
                onClick={() => responderPropuesta(true)}
              >
                Aceptar propuesta
              </button>
            </div>
          )}
        </div>
      )}

      {sesion.estado === "rechazada" && (
        <div className="detalle-sesion__banner detalle-sesion__banner--error">
          <p>
            <strong>Solicitud rechazada.</strong> Motivo: {sesion.motivoRechazo}
          </p>
        </div>
      )}

      <div className="detalle-sesion__cuerpo">
        <div>
          <div className="detalle-sesion__bloque">
            <p className="detalle-sesion__etiqueta">Tutor</p>
            <div className="detalle-sesion__persona">
              <div className="detalle-sesion__avatar" aria-hidden="true" />
              <div>
                <p className="detalle-sesion__nombre">{sesion.tutor.nombreCompleto}</p>
                <p className="detalle-sesion__persona-meta">
                  {abreviarCarrera(sesion.tutor.carrera)} · {sesion.tutor.ciclo}.º ciclo
                  {sesion.tutor.promedio !== null && ` · ${sesion.tutor.promedio.toFixed(1)}`}
                </p>
              </div>
            </div>
          </div>

          <div className="detalle-sesion__bloque">
            <p className="detalle-sesion__etiqueta">Estudiante</p>
            <div className="detalle-sesion__persona">
              <div className="detalle-sesion__avatar" aria-hidden="true" />
              <div>
                <p className="detalle-sesion__nombre">{sesion.estudiante.nombreCompleto}</p>
                <p className="detalle-sesion__persona-meta">
                  {abreviarCarrera(sesion.estudiante.carrera)} · {sesion.estudiante.ciclo}.º ciclo
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="detalle-sesion__bloque">
            <p className="detalle-sesion__etiqueta">Curso y tema</p>
            <div className="detalle-sesion__tarjeta">
              <p className="detalle-sesion__curso">
                {sesion.curso.nombre}
                <span className="detalle-sesion__codigo-curso">{sesion.curso.codigo}</span>
              </p>
              <p className="detalle-sesion__tema">«{sesion.tema}»</p>
              {sesion.modalidad === "remota" ? (
                sesion.enlaceSesion ? (
                  <>
                    <p className="detalle-sesion__enlace-titulo">Enlace de la sesión remota:</p>
                    <a
                      className="detalle-sesion__enlace"
                      href={`https://${sesion.enlaceSesion}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {sesion.enlaceSesion}
                    </a>
                  </>
                ) : (
                  <p className="detalle-sesion__enlace-titulo">
                    El enlace de la sesión se genera cuando queda programada.
                  </p>
                )
              ) : (
                <p className="detalle-sesion__enlace-titulo">
                  Sesión presencial. Coordinen el punto de encuentro por mensaje.
                </p>
              )}
            </div>
          </div>

          <div className="detalle-sesion__bloque">
            <p className="detalle-sesion__etiqueta">Ventana permitida</p>
            <p className="detalle-sesion__texto">
              La cancelación es posible hasta {HORAS_LIMITE_CANCELACION} horas antes. El cierre se habilita al
              terminar el bloque y hasta {HORAS_VENTANA_CIERRE} horas después.
            </p>
          </div>
        </div>

        <div>
          <p className="detalle-sesion__etiqueta">Trazabilidad</p>
          <TrazabilidadSesion eventos={sesion.trazabilidad} />
        </div>
      </div>

      {cancelando && (
        <ModalCancelarSesion
          sesion={sesion}
          rol={rol}
          onConfirmar={confirmarCancelacion}
          onCerrar={() => setCancelando(false)}
        />
      )}

      {reprogramando && (
        <ModalProponerHorario
          sesion={sesion}
          rol={rol}
          sesionesTutor={programadasDelTutor}
          onProponer={manejarPropuesta}
          onCerrar={() => setReprogramando(false)}
        />
      )}
    </>
  );
}

export default DetalleSesion;
