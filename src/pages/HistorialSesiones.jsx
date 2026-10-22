import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSesiones } from '../hooks/useSesiones';
import { filtrarSesiones } from '../utils/sesiones';
import { fechaCorta } from '../utils/presentacionSesiones';
import { BadgeEstadoSesion, EstadoVacio, Paginacion } from '../components/sesiones/ElementosSesion';

const TAMANO_PAGINA = 6;
const DESENLACES = {
  realizada: 'Realizada',
  'no-asistio': 'No asistió',
  cancelada: 'Cancelada',
};

function nombreCompleto(persona) {
  return persona ? `${persona.nombres} ${persona.apellidos}`.trim() : 'Usuario no disponible';
}

function mostrarFechaEnTabla(fecha) {
  const [anio, mes, dia] = fecha.split('-');
  return `${dia}/${mes}/${anio}`;
}

function minutosPrevistos(sesion) {
  function convertirHoraEnMinutos(hora) {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
  }

  return Math.max(0, convertirHoraEnMinutos(sesion.horaFin) - convertirHoraEnMinutos(sesion.horaInicio));
}

function mostrarDuracion(sesion) {
  if (sesion.estado === 'realizada' && sesion.cierre) {
    return `${sesion.cierre.duracionRealMin} min`;
  }

  if (sesion.estado === 'programada') {
    return <>{minutosPrevistos(sesion)} min<small>Prevista</small></>;
  }

  return '—';
}

function describirPeriodo(desde, hasta) {
  if (desde && hasta) return `${fechaCorta(desde)} — ${fechaCorta(hasta)}`;
  if (desde) return `Desde ${fechaCorta(desde)}`;
  if (hasta) return `Hasta ${fechaCorta(hasta)}`;
  return 'todos';
}

export default function HistorialSesiones({ historial = false }) {
  const { sesionesUsuario, rol, obtenerUsuario } = useSesiones();
  const [curso, setCurso] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [estado, setEstado] = useState('');
  const [pagina, setPagina] = useState(1);
  const esTutor = rol === 'tutor';
  const rangoInvalido = Boolean(desde && hasta && desde > hasta);

  // Un código único por curso evita repetir opciones del selector.
  const cursos = Array.from(new Map(
    sesionesUsuario.map((sesion) => [sesion.curso.codigo, sesion.curso]),
  ).values()).sort((primerCurso, segundoCurso) => (
    primerCurso.nombre.localeCompare(segundoCurso.nombre, 'es')
  ));

  const sesionesDePestana = sesionesUsuario.filter((sesion) => (
    historial ? ['realizada', 'no-asistio', 'cancelada'].includes(sesion.estado) : sesion.estado === 'programada'
  ));

  const resultados = rangoInvalido ? [] : filtrarSesiones(sesionesDePestana, {
    curso,
    desde,
    hasta,
    estado: historial ? estado : '',
  }).sort((primeraSesion, segundaSesion) => {
    const orden = `${primeraSesion.fecha}T${primeraSesion.horaInicio}`
      .localeCompare(`${segundaSesion.fecha}T${segundaSesion.horaInicio}`);
    return historial ? -orden : orden;
  });

  const paginaActual = Math.min(pagina, Math.max(1, Math.ceil(resultados.length / TAMANO_PAGINA)));
  const visibles = resultados.slice((paginaActual - 1) * TAMANO_PAGINA, paginaActual * TAMANO_PAGINA);
  const hayFiltros = Boolean(curso || desde || hasta || (historial && estado));
  const textoPeriodo = describirPeriodo(desde, hasta);
  const desenlaceActivo = historial && estado ? DESENLACES[estado] : '';
  let tituloVacio;
  let descripcionVacia;

  if (hayFiltros) {
    tituloVacio = 'No encontramos sesiones con esos filtros';
    descripcionVacia = 'Prueba con otro curso o amplía el periodo de consulta.';
  } else if (historial) {
    tituloVacio = 'Aún no tienes sesiones en tu historial';
    descripcionVacia = 'Las sesiones cerradas y canceladas aparecerán aquí.';
  } else {
    tituloVacio = 'No tienes sesiones programadas';
    descripcionVacia = 'Las sesiones que acuerdes aparecerán en esta lista.';
  }

  function cambiarFiltro(actualizar) {
    return (evento) => {
      actualizar(evento.target.value);
      setPagina(1);
    };
  }

  function limpiarFiltros() {
    setCurso('');
    setDesde('');
    setHasta('');
    setEstado('');
    setPagina(1);
  }

  return (
    <div className="hu5-page hu5-listado-page">
      <nav className="hu5-tabs hu5-listado-tabs" aria-label="Vistas de sesiones">
        <Link
          className={`hu5-tab${!historial ? ' hu5-tab-active' : ''}`}
          aria-current={!historial ? 'page' : undefined}
          to="/sesiones"
        >
          Próximas
        </Link>
        <Link
          className={`hu5-tab${historial ? ' hu5-tab-active' : ''}`}
          aria-current={historial ? 'page' : undefined}
          to="/sesiones/historial"
        >
          Historial
        </Link>
      </nav>

      <header className="hu5-listado-header">
        <div className="hu5-listado-titulo">
          <h1>{historial ? 'Historial de sesiones' : 'Mis sesiones'}</h1>
          <p className="hu5-listado-subtitulo" role="status">
            {rangoInvalido ? 'Revisa el periodo seleccionado.' : (
              <>{resultados.length} {resultados.length === 1 ? 'sesión' : 'sesiones'} {historial ? (resultados.length === 1 ? 'cerrada' : 'cerradas') : (resultados.length === 1 ? 'programada' : 'programadas')} como {esTutor ? 'tutor' : 'estudiante'}</>
            )}
          </p>
        </div>
        <div className="hu5-listado-filtros" role="group" aria-label="Filtrar sesiones">
          <label className="hu5-selector-compacto">
            <span>Curso:</span>
            <select aria-label="Curso" value={curso} onChange={cambiarFiltro(setCurso)}>
              <option value="">todos</option>
              {cursos.map((opcion) => (
                <option key={opcion.codigo} value={opcion.codigo}>{opcion.nombre}</option>
              ))}
            </select>
          </label>
          <details className="hu5-periodo">
            <summary title={`Periodo: ${textoPeriodo}`}>
              <span>Periodo: {textoPeriodo}{desenlaceActivo && ` · ${desenlaceActivo}`}</span>
              <span className="hu5-sr-only">. Abrir fechas y filtros adicionales</span>
            </summary>
            <div className="hu5-periodo-panel">
              <p className="hu5-periodo-titulo">Filtrar por periodo</p>
              <div className="hu5-periodo-fechas">
                <label className="hu5-field">
                  <span>Desde</span>
                  <input
                    type="date"
                    value={desde}
                    onChange={cambiarFiltro(setDesde)}
                    aria-invalid={rangoInvalido}
                    aria-describedby={rangoInvalido ? 'sesiones-error-fechas' : undefined}
                  />
                </label>
                <label className="hu5-field">
                  <span>Hasta</span>
                  <input
                    type="date"
                    value={hasta}
                    onChange={cambiarFiltro(setHasta)}
                    aria-invalid={rangoInvalido}
                    aria-describedby={rangoInvalido ? 'sesiones-error-fechas' : undefined}
                  />
                </label>
              </div>
              <p className="hu5-periodo-ayuda">Ambas fechas están incluidas.</p>
              {rangoInvalido && (
                <p id="sesiones-error-fechas" className="hu5-inline-error" role="alert">
                  La fecha «Desde» debe ser anterior o igual a «Hasta».
                </p>
              )}
              {historial && (
                <label className="hu5-field">
                  <span>Desenlace</span>
                  <select value={estado} onChange={cambiarFiltro(setEstado)}>
                    <option value="">Todos los desenlaces</option>
                    <option value="realizada">Realizada</option>
                    <option value="no-asistio">No asistió</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </label>
              )}
              <button
                type="button"
                className="hu5-button hu5-button-secondary"
                onClick={limpiarFiltros}
                disabled={!hayFiltros}
              >
                Limpiar filtros
              </button>
            </div>
          </details>
        </div>
      </header>

      {!rangoInvalido && (
        <section aria-label={historial ? 'Historial de tus tutorías' : 'Tus tutorías programadas'}>
          {!historial && (
            <p className="hu5-help hu5-listado-aviso">También se incluyen sesiones pasadas que aún están pendientes de cierre.</p>
          )}
          {resultados.length === 0 ? (
            <div className="hu5-listado-vacio">
              <EstadoVacio
                titulo={tituloVacio}
                accion={hayFiltros ? (
                  <button type="button" className="hu5-button hu5-button-secondary" onClick={limpiarFiltros}>
                    Quitar filtros
                  </button>
                ) : undefined}
              >
                {descripcionVacia}
              </EstadoVacio>
            </div>
          ) : (
            <>
              <p className="hu5-scroll-hint">Desliza la tabla para ver todas las columnas →</p>
              <div
                className="hu5-table-wrap hu5-listado-tabla"
                tabIndex={0}
                role="region"
                aria-label="Tabla de sesiones, desplazable horizontalmente"
              >
                <table className="hu5-table hu5-sessions-table">
                  <caption className="hu5-sr-only">{historial ? 'Historial de tus tutorías' : 'Tus tutorías programadas'}</caption>
                  <thead>
                    <tr>
                      <th scope="col">Fecha</th>
                      <th scope="col">{esTutor ? 'Estudiante' : 'Tutor'}</th>
                      <th scope="col">Curso</th>
                      <th scope="col">Duración</th>
                      <th scope="col">{historial ? 'Desenlace' : 'Estado'}</th>
                      <th scope="col">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibles.map((sesion) => (
                      <tr key={sesion.codigo}>
                        <td>
                          <time dateTime={sesion.fecha}>{mostrarFechaEnTabla(sesion.fecha)}</time>
                          {!historial && <small>{sesion.horaInicio} – {sesion.horaFin}</small>}
                        </td>
                        <td>{nombreCompleto(obtenerUsuario(esTutor ? sesion.estudianteId : sesion.tutorId))}</td>
                        <td>{sesion.curso.codigo} {sesion.curso.nombre}</td>
                        <td>{mostrarDuracion(sesion)}</td>
                        <td><BadgeEstadoSesion estado={sesion.estado} /></td>
                        <td>
                          <Link
                            className="hu5-text-link"
                            to={`/sesiones/${sesion.codigo}`}
                            aria-label={`Ver detalle de la sesión ${sesion.codigo}`}
                          >
                            Ver detalle
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Paginacion
                pagina={paginaActual}
                total={resultados.length}
                paginaTamano={TAMANO_PAGINA}
                onCambiar={setPagina}
              />
            </>
          )}
        </section>
      )}
    </div>
  );
}
