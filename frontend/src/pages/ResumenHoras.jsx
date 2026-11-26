import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSesiones } from '../hooks/useSesiones';
import { filtrarSesiones, formatearHoras, resumirHoras } from '../utils/sesiones';
import { fechaCorta, mesCorto, resumirCierresPorMes } from '../utils/presentacionSesiones';
import { EstadoVacio } from '../components/sesiones/ElementosSesion';

function describirPeriodo(desde, hasta) {
  if (desde && hasta) return `${fechaCorta(desde)} — ${fechaCorta(hasta)}`;
  if (desde) return `Desde ${fechaCorta(desde)}`;
  if (hasta) return `Hasta ${fechaCorta(hasta)}`;
  return 'todos';
}

export default function ResumenHoras() {
  const { sesionesUsuario, rol } = useSesiones();
  const [curso, setCurso] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const rangoInvalido = Boolean(desde && hasta && desde > hasta);
  const hayFiltros = Boolean(curso || desde || hasta);
  const textoPeriodo = describirPeriodo(desde, hasta);
  const cursos = Array.from(new Map(
    sesionesUsuario.map((sesion) => [sesion.curso.codigo, sesion.curso]),
  ).values()).sort((primerCurso, segundoCurso) => (
    primerCurso.nombre.localeCompare(segundoCurso.nombre, 'es')
  ));
  const filtradas = rangoInvalido ? [] : filtrarSesiones(sesionesUsuario, { curso, desde, hasta });

  // La utilidad conserva la regla: solo suman sesiones realizadas con cierre válido.
  const resumen = resumirHoras(filtradas);
  const cierresPorMes = resumirCierresPorMes(filtradas);
  const maximoSesiones = Math.max(1, ...cierresPorMes.map(mes => mes.cantidad));

  function limpiarFiltros() {
    setCurso('');
    setDesde('');
    setHasta('');
  }

  if (rol !== 'tutor') {
    return (
      <div className="hu5-page hu5-resumen-page">
        <section className="hu5-card">
          <EstadoVacio
            titulo="El resumen de horas es una vista para tutores"
            accion={<Link className="hu5-button" to="/sesiones/historial">Ir a mi historial</Link>}
          >
            Puedes consultar tus sesiones y su duración en tu historial de estudiante.
          </EstadoVacio>
        </section>
      </div>
    );
  }

  return (
    <div className="hu5-page hu5-resumen-page">
      <header className="hu5-listado-header">
        <div className="hu5-listado-titulo">
          <h1>Resumen de horas</h1>
          <p className="hu5-listado-subtitulo">
            {desde || hasta ? `Periodo: ${textoPeriodo}` : 'Todos los periodos'}
          </p>
        </div>
        <div className="hu5-listado-filtros" role="group" aria-label="Filtrar resumen de horas">
          <details className="hu5-periodo">
            <summary title={`Periodo: ${textoPeriodo}`}>
              <span>Periodo: {textoPeriodo}</span>
              <span className="hu5-sr-only">. Abrir fechas y limpiar filtros</span>
            </summary>
            <div className="hu5-periodo-panel">
              <p className="hu5-periodo-titulo">Filtrar por periodo</p>
              <label className="hu5-field">
                <span>Curso</span>
                <select aria-label="Curso" value={curso} onChange={evento => setCurso(evento.target.value)}>
                  <option value="">Todos los cursos</option>
                  {cursos.map(opcion => (
                    <option key={opcion.codigo} value={opcion.codigo}>{opcion.nombre}</option>
                  ))}
                </select>
              </label>
              <div className="hu5-periodo-fechas">
                <label className="hu5-field">
                  <span>Desde</span>
                  <input
                    type="date"
                    value={desde}
                    onChange={(evento) => setDesde(evento.target.value)}
                    aria-invalid={rangoInvalido}
                    aria-describedby={rangoInvalido ? 'horas-error-fechas' : undefined}
                  />
                </label>
                <label className="hu5-field">
                  <span>Hasta</span>
                  <input
                    type="date"
                    value={hasta}
                    onChange={(evento) => setHasta(evento.target.value)}
                    aria-invalid={rangoInvalido}
                    aria-describedby={rangoInvalido ? 'horas-error-fechas' : undefined}
                  />
                </label>
              </div>
              <p className="hu5-periodo-ayuda">Ambas fechas están incluidas.</p>
              {rangoInvalido && (
                <p id="horas-error-fechas" className="hu5-inline-error" role="alert">
                  La fecha «Desde» debe ser anterior o igual a «Hasta».
                </p>
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
        <>
          <section className="hu5-horas-tarjetas" aria-label="Horas acumuladas y desglose por curso" aria-live="polite">
            <article className="hu5-horas-tarjeta hu5-horas-tarjeta-total">
              <h2>Horas acumuladas</h2>
              <p className="hu5-horas-valor">{formatearHoras(resumen.minutos)} h</p>
              <p className="hu5-horas-auxiliar">en {resumen.sesiones} {resumen.sesiones === 1 ? 'sesión realizada' : 'sesiones realizadas'}</p>
            </article>
            {resumen.porCurso.map((cursoResumido) => (
              <article key={cursoResumido.codigo} className="hu5-horas-tarjeta">
                <h2>{cursoResumido.codigo} {cursoResumido.nombre}</h2>
                <p className="hu5-horas-valor">{formatearHoras(cursoResumido.minutos)} h</p>
                <p className="hu5-horas-auxiliar">{cursoResumido.sesiones} {cursoResumido.sesiones === 1 ? 'sesión realizada' : 'sesiones realizadas'}</p>
              </article>
            ))}
          </section>

          {resumen.sesiones === 0 ? (
            <section className="hu5-card">
              <EstadoVacio
                titulo={hayFiltros ? 'No hay horas realizadas con esos filtros' : 'Aún no registras horas realizadas'}
                accion={hayFiltros ? (
                  <button type="button" className="hu5-button hu5-button-secondary" onClick={limpiarFiltros}>
                    Quitar filtros
                  </button>
                ) : (
                  <Link className="hu5-button" to="/sesiones">Ver sesiones programadas</Link>
                )}
              >
                {hayFiltros ? 'Prueba con otro curso o amplía el periodo.' : 'Cuando cierres una sesión como realizada, sus horas aparecerán aquí.'}
              </EstadoVacio>
            </section>
          ) : null}
          {cierresPorMes.length > 0 && (
            <section className="hu5-card hu5-grafico-mensual" aria-labelledby="sesiones-por-mes">
              <h2 id="sesiones-por-mes">Sesiones cerradas por mes</h2>
              <p className="hu5-sr-only">Cuenta sesiones realizadas y con inasistencia. Solo las realizadas suman horas. Las barras más oscuras señalan los meses con más cierres.</p>
              <div className="hu5-grafico-desplazable" tabIndex={0} role="region" aria-label="Sesiones por mes, desplazable horizontalmente">
                <ul className="hu5-barras-meses" style={{ '--hu5-meses': cierresPorMes.length }}>
                  {cierresPorMes.map(mes => (
                    <li key={mes.mes} className="hu5-barra-mes" aria-label={`${mesCorto(mes.mes)} de ${mes.mes.slice(0, 4)}: ${mes.cantidad} ${mes.cantidad === 1 ? 'cierre' : 'cierres'}`} style={{ '--hu5-altura': `${(mes.cantidad / maximoSesiones) * 100}%` }}>
                      <div className="hu5-barra-area">
                        <span className="hu5-barra-valor" aria-hidden="true">{mes.cantidad}</span>
                        <div
                          className={`hu5-barra-columna${mes.cantidad === maximoSesiones ? ' hu5-barra-columna-maxima' : ''}`}
                          aria-hidden="true"
                        />
                      </div>
                      <span className="hu5-barra-etiqueta" aria-hidden="true">{mesCorto(mes.mes)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}
          <p className="hu5-horas-nota">Solo se suman sesiones realizadas con cierre registrado. Las horas corresponden a la duración real.</p>
        </>
      )}
    </div>
  );
}
