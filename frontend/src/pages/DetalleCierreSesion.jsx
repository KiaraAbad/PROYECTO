import { Link, useParams } from 'react-router-dom';
import { useSesiones } from '../hooks/useSesiones';
import { BadgeEstadoSesion, EstadoVacio } from '../components/sesiones/ElementosSesion';
import { formatearFecha, formatearFechaHora, ventanaCierre } from '../utils/sesiones';

export default function DetalleCierreSesion() {
  const { codigo } = useParams();
  const { obtenerSesion, obtenerUsuario, rol } = useSesiones();
  const sesion = obtenerSesion(codigo);

  if (!sesion) {
    return (
      <EstadoVacio
        titulo="Sesión no disponible"
        descripcion="No existe o no pertenece al usuario de esta vista."
        accion={<Link className="hu5-button" to="/sesiones">Ver mis sesiones</Link>}
      />
    );
  }

  const cierre = sesion.cierre;
  const tutor = obtenerUsuario(sesion.tutorId);
  const estudiante = obtenerUsuario(sesion.estudianteId);
  const ventana = ventanaCierre(sesion);
  const mensajeSinCierre = sesion.estado === 'cancelada'
    ? 'La sesión fue cancelada. No tiene horas realizadas.'
    : 'El tutor todavía no ha registrado el cierre de esta sesión.';
  const tituloAyuda = cierre.finalizado ? 'Sesión cerrada' : 'Cierre de la tutoría';
  const descripcionAyuda = cierre.finalizado
    ? 'El estudiante puede consultar las notas y los enlaces compartidos.'
    : 'El cierre se habilita al finalizar el bloque y durante las siguientes 72 horas.';

  return (
    <>
      <div className="hu5-page-header">
        <p className="hu5-eyebrow"><Link to="/sesiones">Mis sesiones</Link> / {codigo}</p>
        <div className="hu5-section-heading">
          <h1>Sesión {codigo}</h1>
          <BadgeEstadoSesion estado={sesion.estado} />
        </div>
        <p className="hu5-lead">{formatearFecha(sesion.fecha)} · {sesion.horaInicio} a {sesion.horaFin} · {sesion.modalidad}</p>
      </div>
      <div className="hu5-page-grid">
        <div className="hu5-stack">
          <section className="hu5-card">
            <h2>Datos de la tutoría</h2>
            <div className="hu5-summary-grid">
              <div>
                <span className="hu5-label">Tutor</span>
                <p>{tutor?.nombres} {tutor?.apellidos}</p>
              </div>
              <div>
                <span className="hu5-label">Estudiante</span>
                <p>{estudiante?.nombres} {estudiante?.apellidos}</p>
              </div>
            </div>
            <span className="hu5-label">Curso y tema</span>
            <h3>{sesion.curso.codigo} · {sesion.curso.nombre}</h3>
            <p>{sesion.tema}</p>
          </section>
          <section className="hu5-card">
            <div className="hu5-section-heading">
              <h2>Desarrollo de la sesión</h2>
              <Link className="hu5-text-link" to={`/sesiones/${codigo}/material`}>
                Ver material compartido ↗
              </Link>
            </div>
            {/* Un cierre finalizado se consulta; un borrador todavía no se publica. */}
            {cierre.finalizado ? (
              <>
                <dl className="hu5-definition-list">
                  <div>
                    <dt>Asistió el estudiante</dt>
                    <dd>{cierre.asistenciaEstudiante ? 'Sí' : 'No'}</dd>
                  </div>
                  <div>
                    <dt>Asistió el tutor</dt>
                    <dd>{cierre.asistenciaTutor ? 'Sí' : 'No'}</dd>
                  </div>
                  <div>
                    <dt>Duración realizada</dt>
                    <dd>{cierre.duracionRealMin} minutos</dd>
                  </div>
                </dl>
                {cierre.notas && (
                  <>
                    <h3>Notas sobre lo trabajado</h3>
                    <p className="hu5-preserve-lines">{cierre.notas}</p>
                  </>
                )}
                {cierre.temasPendientes && (
                  <>
                    <h3>Temas pendientes</h3>
                    <p className="hu5-preserve-lines">{cierre.temasPendientes}</p>
                  </>
                )}
                <p className="hu5-help">Cierre registrado el {formatearFechaHora(cierre.cerradoEn)}</p>
              </>
            ) : (
              <p className="hu5-muted">{mensajeSinCierre}</p>
            )}
          </section>
          <section className="hu5-card">
            <h2>Trazabilidad</h2>
            <ul className="hu5-timeline">
              <li>
                <strong>Sesión {sesion.estado === 'cancelada' ? 'cancelada' : 'programada'}</strong>
                <span>{formatearFecha(sesion.fecha)} · {sesion.horaInicio}</span>
              </li>
              {(sesion.trazabilidad ?? []).map((evento, indice) => (
                <li key={`${evento.fecha}-${indice}`}>
                  <strong>{evento.evento}</strong>
                  <span>{evento.actor} · {formatearFechaHora(evento.fecha)}</span>
                </li>
              ))}
              {cierre.finalizado && !(sesion.trazabilidad ?? []).some(evento => evento.evento.startsWith('Cierre registrado')) && (
                <li>
                  <strong>Cierre registrado · {cierre.estadoFinal === 'realizada' ? 'Realizada' : 'No asistió'}</strong>
                  <span>{formatearFechaHora(cierre.cerradoEn)}</span>
                </li>
              )}
            </ul>
          </section>
        </div>
        <aside className="hu5-sidebar">
          <section className="hu5-card hu5-help-card">
            <h2>{tituloAyuda}</h2>
            <p>{descripcionAyuda}</p>
            {rol === 'tutor' && !cierre.finalizado && (
              ventana.habilitado ? (
                <Link className="hu5-button" to={`/sesiones/${codigo}/cerrar`}>
                  Registrar cierre
                </Link>
              ) : (
                <p className="hu5-alert hu5-alert--warning">{ventana.motivo}</p>
              )
            )}
            {rol === 'tutor' && !cierre.finalizado && Boolean(cierre.actualizadoEn) && (
              <p className="hu5-muted">Tienes un borrador guardado.</p>
            )}
          </section>
          <Link className="hu5-button hu5-button--secondary" to={`/sesiones/${codigo}/material`}>
            Material compartido ({cierre.material.length})
          </Link>
          <Link className="hu5-back-link" to="/sesiones/historial">Volver al historial</Link>
        </aside>
      </div>
    </>
  );
}
