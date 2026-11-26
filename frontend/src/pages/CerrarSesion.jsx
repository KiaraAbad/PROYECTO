import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSesiones } from '../hooks/useSesiones';
import {
  BadgeEstadoSesion,
  EstadoVacio,
  ModalConfirmacion,
} from '../components/sesiones/ElementosSesion';
import {
  validarCierre,
  ventanaCierre,
} from '../utils/sesiones';
import { fechaCorta, fechaHoraCorta } from '../utils/presentacionSesiones';

function erroresDeRespuesta(respuesta) {
  const errores = respuesta.errores ?? {};
  return {
    ...errores,
    general: errores.formulario ?? respuesta.mensaje,
  };
}

function nombrePersona(persona, nombreAlternativo, identificador) {
  if (nombreAlternativo) {
    return nombreAlternativo;
  }
  if (persona) {
    const partesNombre = [
      persona.nombres ?? persona.nombre,
      persona.apellidos,
    ];
    return partesNombre.filter(Boolean).join(' ');
  }
  return identificador;
}

function ResumenSesion({ sesion, estadoPrevisto, ventana }) {
  const modalidad = sesion.modalidad === 'remota' ? 'Remota' : 'Presencial';
  const estaFinalizada = sesion.cierre?.finalizado
    || ['realizada', 'no-asistio'].includes(sesion.estado);
  const estadoGuardado = sesion.estado === 'realizada' ? 'Realizada' : 'No asistió';
  const plazoCierre = ventana ?? ventanaCierre(sesion);
  let textoEstado = `Programada → ${estadoPrevisto ?? 'Por confirmar'}`;
  if (estaFinalizada) {
    textoEstado = estadoGuardado;
  } else if (sesion.estado === 'cancelada') {
    textoEstado = 'Cancelada';
  }

  return (
    <aside className="hu5-sidebar hu5-cierre-sidebar">
      <section className="hu5-cierre-estado" aria-labelledby="estado-cierre-titulo">
        <h2 id="estado-cierre-titulo">Estado actual</h2>
        <p className="hu5-cierre-transicion" aria-live="polite">
          {textoEstado}
        </p>
        <p>
          {textoEstado.includes('No asistió')
            ? 'La inasistencia queda registrada y esta sesión no suma horas.'
            : 'Al cerrar, el estudiante podrá consultar las notas y los temas pendientes.'}
        </p>
      </section>
      <section className="hu5-card hu5-cierre-datos" aria-labelledby="resumen-sesion-titulo">
        <h2 id="resumen-sesion-titulo">Datos de la sesión</h2>
        <dl className="hu5-definition-list hu5-cierre-datos-lista">
          <div>
            <dt>Código</dt>
            <dd>{sesion.codigo}</dd>
          </div>
          <div>
            <dt>Curso</dt>
            <dd>{sesion.curso.codigo}</dd>
          </div>
          <div>
            <dt>Modalidad</dt>
            <dd>{modalidad}</dd>
          </div>
          <div>
            <dt>Bloque</dt>
            <dd>{sesion.horaInicio} – {sesion.horaFin}</dd>
          </div>
        </dl>
      </section>
      {!estaFinalizada && (
        <p className="hu5-cierre-plazo" role="status">
          {plazoCierre.habilitado
            ? `El cierre está habilitado hasta el ${fechaHoraCorta(plazoCierre.limite)} (72 horas después del bloque).`
            : plazoCierre.motivo}
        </p>
      )}
    </aside>
  );
}

function Asistencia({ campo, etiqueta, valor, onChange, error, disabled }) {
  const opcionesAsistencia = [
    { valor: true, texto: 'Sí' },
    { valor: false, texto: 'No' },
  ];

  return (
    <fieldset
      className={`hu5-cierre-asistencia${valor === false ? ' hu5-cierre-asistencia--ausente' : ''}`}
      aria-describedby={error ? `${campo}-error` : undefined}
    >
      <legend className="hu5-sr-only">
        {etiqueta} <span aria-hidden="true">*</span>
      </legend>
      <div className="hu5-cierre-asistencia-fila">
        <span aria-hidden="true">{etiqueta}</span>
        <div className="hu5-cierre-opciones">
          {opcionesAsistencia.map(opcion => {
            const estaSeleccionada = valor === opcion.valor;
            const claseOpcion = estaSeleccionada
              ? `hu5-cierre-opcion hu5-cierre-opcion--seleccionada${opcion.valor === false ? ' hu5-cierre-opcion--ausente' : ''}`
              : 'hu5-cierre-opcion';

            return (
              <label className={claseOpcion} key={String(opcion.valor)}>
                <input
                  type="radio"
                  name={campo}
                  value={String(opcion.valor)}
                  checked={estaSeleccionada}
                  onChange={() => onChange(campo, opcion.valor)}
                  disabled={disabled}
                  aria-invalid={Boolean(error)}
                />
                {opcion.texto}
              </label>
            );
          })}
        </div>
      </div>
      {error && (
        <p className="hu5-inline-error" id={`${campo}-error`}>
          {error}
        </p>
      )}
    </fieldset>
  );
}

function CierreGuardado({ sesion }) {
  const cierre = sesion.cierre ?? {};
  let asistenciaEstudiante = 'Sin registro';
  let asistenciaTutor = 'Sin registro';

  if (cierre.asistenciaEstudiante === true) {
    asistenciaEstudiante = 'Sí asistió';
  } else if (cierre.asistenciaEstudiante === false) {
    asistenciaEstudiante = 'No asistió';
  }

  if (cierre.asistenciaTutor === true) {
    asistenciaTutor = 'Sí asistió';
  } else if (cierre.asistenciaTutor === false) {
    asistenciaTutor = 'No asistió';
  }

  return (
    <div className="hu5-page-grid hu5-cierre-grid">
      <section className="hu5-card">
        <div className="hu5-card-header">
          <h2>Cierre registrado</h2>
          <BadgeEstadoSesion estado={sesion.estado} />
        </div>
        <p className="hu5-alert hu5-alert--info">
          Esta sesión ya está cerrada. Su asistencia y sus notas no pueden modificarse.
        </p>
        <dl className="hu5-definition-list">
          <div>
            <dt>Asistencia del estudiante</dt>
            <dd>{asistenciaEstudiante}</dd>
          </div>
          <div>
            <dt>Asistencia del tutor</dt>
            <dd>{asistenciaTutor}</dd>
          </div>
          <div>
            <dt>Duración real</dt>
            <dd>{cierre.duracionRealMin ?? 0} minutos</dd>
          </div>
        </dl>
        <h3>Notas de la sesión</h3>
        <p className="hu5-preserve-lines">
          {cierre.notas || 'No se registraron notas.'}
        </p>
        <h3>Temas pendientes</h3>
        <p className="hu5-preserve-lines">
          {cierre.temasPendientes || 'No se registraron temas pendientes.'}
        </p>
        <div className="hu5-actions">
          <Link
            className="hu5-button hu5-button--primary"
            to={`/sesiones/${sesion.codigo}`}
          >
            Ver detalle de la sesión
          </Link>
          <Link
            className="hu5-button hu5-button--secondary"
            to={`/sesiones/${sesion.codigo}/material`}
          >
            Gestionar material
          </Link>
        </div>
      </section>
      <ResumenSesion sesion={sesion} />
    </div>
  );
}

function FormularioCierre({ sesion }) {
  const { guardarBorrador, cerrarSesion } = useSesiones();
  const navegar = useNavigate();
  const cierre = sesion.cierre ?? {};
  // El estado conserva lo escrito y vuelve a dibujar el formulario al cambiar.
  const [formulario, setFormulario] = useState({
    asistenciaEstudiante: cierre.asistenciaEstudiante ?? null,
    asistenciaTutor: cierre.asistenciaTutor ?? null,
    duracionRealMin: String(cierre.duracionRealMin || 60),
    notas: cierre.notas ?? '',
    temasPendientes: cierre.temasPendientes ?? '',
  });
  const [errores, setErrores] = useState({});
  const [confirmando, setConfirmando] = useState(false);
  const ventana = ventanaCierre(sesion);
  const hayInasistencia = formulario.asistenciaEstudiante === false
    || formulario.asistenciaTutor === false;
  const asistieronAmbos = formulario.asistenciaEstudiante === true
    && formulario.asistenciaTutor === true;
  let estadoPrevisto = 'Por confirmar';
  if (hayInasistencia) {
    estadoPrevisto = 'No asistió';
  } else if (asistieronAmbos) {
    estadoPrevisto = 'Realizada';
  }
  const textoBotonCierre = hayInasistencia
    ? 'Cerrar como no asistió'
    : 'Cerrar sesión como realizada';
  let participanteAusente = 'el estudiante no asistió';
  if (formulario.asistenciaEstudiante === false && formulario.asistenciaTutor === false) {
    participanteAusente = 'ninguna de las partes asistió';
  } else if (formulario.asistenciaTutor === false) {
    participanteAusente = 'el tutor no asistió';
  }
  const duracionesPermitidas = Array.from({ length: 16 }, (_, indice) => (indice + 1) * 15);
  const mensajeConfirmacion = hayInasistencia
    ? 'Se registrará como «No asistió» y sumará 0 horas.'
    : `Se registrará como «Realizada» con ${formulario.duracionRealMin} minutos de tutoría.`;

  function actualizar(campo, valor) {
    // Spread copia los otros campos; [campo] elige la propiedad que cambia.
    setFormulario(actual => ({ ...actual, [campo]: valor }));
    setErrores(actuales => ({
      ...actuales,
      [campo]: undefined,
      general: undefined,
    }));
  }

  function datosFormulario() {
    return {
      ...formulario,
      duracionRealMin: formulario.duracionRealMin === ''
        ? null
        : Number(formulario.duracionRealMin),
    };
  }

  function guardar() {
    const respuesta = guardarBorrador(sesion.codigo, datosFormulario());
    setErrores(respuesta.ok ? {} : erroresDeRespuesta(respuesta));
  }

  function solicitarCierre(evento) {
    evento.preventDefault();
    // La validación devuelve un objeto con los errores de cada campo.
    const erroresValidacion = validarCierre(datosFormulario());
    if (!ventana.habilitado) {
      erroresValidacion.general = ventana.motivo;
    }

    setErrores(erroresValidacion);

    if (Object.keys(erroresValidacion).length === 0) {
      setConfirmando(true);
    }
  }

  function confirmarCierre() {
    // Solo se guarda el cierre definitivo después de aceptar el modal.
    const respuesta = cerrarSesion(sesion.codigo, datosFormulario());
    setConfirmando(false);
    if (respuesta.ok) {
      navegar(`/sesiones/${sesion.codigo}`);
    } else {
      setErrores(erroresDeRespuesta(respuesta));
    }
  }

  const botonBorrador = (
    <button
      className="hu5-cierre-borrador"
      type="button"
      onClick={guardar}
      disabled={!ventana.habilitado}
    >
      Guardar borrador
    </button>
  );

  return (
    <>
      <div className="hu5-page-grid hu5-cierre-grid">
        <form
          className={`hu5-card hu5-cierre-formulario${hayInasistencia ? ' hu5-cierre-formulario--inasistencia' : ''}`}
          onSubmit={solicitarCierre}
          noValidate
        >
          {errores.general && (
            <p className="hu5-inline-error" role="alert">
              {errores.general}
            </p>
          )}
          <div className={`hu5-cierre-campos${hayInasistencia ? ' hu5-cierre-campos--inasistencia' : ''}`}>
            <div className="hu5-cierre-participacion">
              <h2 className={hayInasistencia ? 'hu5-sr-only' : 'hu5-cierre-etiqueta'}>Asistencia</h2>
              {hayInasistencia && (
                <p className="hu5-cierre-aviso-ausencia" role="status">
                  Al marcar que {participanteAusente}, la sesión se cierra como «No asistió».
                  No se piden notas y no se suman horas.
                </p>
              )}
              <div className="hu5-cierre-asistencias">
                <Asistencia
                  campo="asistenciaEstudiante"
                  etiqueta="Asistió el estudiante"
                  valor={formulario.asistenciaEstudiante}
                  onChange={actualizar}
                  error={errores.asistenciaEstudiante}
                  disabled={!ventana.habilitado}
                />
                <Asistencia
                  campo="asistenciaTutor"
                  etiqueta="Asistí como tutor"
                  valor={formulario.asistenciaTutor}
                  onChange={actualizar}
                  error={errores.asistenciaTutor}
                  disabled={!ventana.habilitado}
                />
              </div>
              {hayInasistencia && (
                <div className="hu5-cierre-borrador-ausencia">{botonBorrador}</div>
              )}
              <div className="hu5-cierre-duracion" hidden={hayInasistencia}>
                <div className="hu5-cierre-duracion-fila">
                  <label htmlFor="duracion-real">Duración real</label>
                  <select
                    className="hu5-input hu5-cierre-selector"
                    id="duracion-real"
                    value={hayInasistencia ? 0 : formulario.duracionRealMin}
                    onChange={evento => actualizar('duracionRealMin', evento.target.value)}
                    disabled={!ventana.habilitado || hayInasistencia}
                    aria-invalid={Boolean(errores.duracionRealMin)}
                    aria-describedby={`duracion-ayuda${errores.duracionRealMin ? ' duracion-error' : ''}`}
                  >
                    {hayInasistencia && <option value="0">0 minutos</option>}
                    {duracionesPermitidas.map(minutos => (
                      <option value={minutos} key={minutos}>
                        {minutos} minutos
                      </option>
                    ))}
                  </select>
                </div>
                <span className="hu5-sr-only" id="duracion-ayuda">
                  Entre 15 y 240 minutos, en intervalos de 15.
                </span>
                {errores.duracionRealMin && (
                  <p id="duracion-error" className="hu5-inline-error">
                    {errores.duracionRealMin}
                  </p>
                )}
              </div>
            </div>
            <div className="hu5-cierre-contenido">
              <div className="hu5-field hu5-cierre-notas">
                <label htmlFor="notas-sesion">
                  Notas sobre lo trabajado{!hayInasistencia && ' *'}
                </label>
                <textarea
                  className="hu5-textarea"
                  id="notas-sesion"
                  rows="6"
                  maxLength="3000"
                  placeholder={hayInasistencia
                    ? 'Deshabilitado'
                    : 'Resume lo trabajado, los avances y las recomendaciones para el estudiante.'}
                  value={hayInasistencia ? '' : formulario.notas}
                  onChange={evento => actualizar('notas', evento.target.value)}
                  disabled={!ventana.habilitado || hayInasistencia}
                  aria-invalid={!hayInasistencia && Boolean(errores.notas)}
                  aria-describedby={hayInasistencia
                    ? 'notas-inasistencia-ayuda'
                    : `notas-ayuda${errores.notas ? ' notas-error' : ''}`}
                />
                {hayInasistencia && (
                  <span className="hu5-sr-only" id="notas-inasistencia-ayuda">
                    Las notas y los temas pendientes no se incluyen en un cierre por inasistencia.
                    Si vuelves a marcar que ambos asistieron, recuperarás el texto del formulario.
                  </span>
                )}
              <div className="hu5-field-meta hu5-sr-only" hidden={hayInasistencia}>
                  <span className="hu5-help" id="notas-ayuda">
                    Anotaciones visibles para el estudiante; no son una calificación.
                  </span>
                  <span className="hu5-counter">{formulario.notas.length}/3000</span>
                </div>
                {!hayInasistencia && errores.notas && (
                  <p id="notas-error" className="hu5-inline-error">
                    {errores.notas}
                  </p>
                )}
              </div>
              <div className="hu5-field hu5-cierre-pendientes" hidden={hayInasistencia}>
                <label htmlFor="temas-pendientes">
                Temas pendientes <span className="hu5-sr-only">(opcional)</span>
                </label>
                <textarea
                  className="hu5-textarea"
                  id="temas-pendientes"
                  rows="4"
                  maxLength="2000"
                  placeholder="¿Qué conviene practicar o retomar en la próxima tutoría?"
                  value={formulario.temasPendientes}
                  onChange={evento => actualizar('temasPendientes', evento.target.value)}
                  disabled={!ventana.habilitado || hayInasistencia}
                  aria-invalid={Boolean(errores.temasPendientes)}
                  aria-describedby={errores.temasPendientes ? 'pendientes-error' : undefined}
                />
              <span className="hu5-counter hu5-sr-only">{formulario.temasPendientes.length}/2000</span>
                {errores.temasPendientes && (
                  <p id="pendientes-error" className="hu5-inline-error">
                    {errores.temasPendientes}
                  </p>
                )}
              </div>
              <div className="hu5-actions hu5-actions--split hu5-cierre-acciones">
                <Link
                  className="hu5-text-link hu5-cierre-volver"
                  to={`/sesiones/${sesion.codigo}`}
                >
                  {hayInasistencia ? 'Volver' : 'Volver al detalle'}
                </Link>
                <div className="hu5-actions">
                  {!hayInasistencia && botonBorrador}
                  <button
                    className={`hu5-button ${hayInasistencia ? 'hu5-button--danger' : 'hu5-button--primary'}`}
                    type="submit"
                    disabled={!ventana.habilitado}
                  >
                    {textoBotonCierre}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
        <ResumenSesion sesion={sesion} estadoPrevisto={estadoPrevisto} ventana={ventana} />
      </div>
      {confirmando && (
        <ModalConfirmacion
          titulo="¿Finalizar esta tutoría?"
          confirmarTexto="Confirmar cierre"
          peligroso={hayInasistencia}
          onConfirmar={confirmarCierre}
          onCancelar={() => setConfirmando(false)}
        >
          <p>Este cierre es definitivo: no podrás editar la asistencia, la duración ni las notas.</p>
          <p>{mensajeConfirmacion}</p>
          <p>El estudiante podrá consultar el resultado desde el detalle de su sesión.</p>
        </ModalConfirmacion>
      )}
    </>
  );
}

export default function CerrarSesion() {
  const { codigo } = useParams();
  const { rol, usuario, obtenerSesion, obtenerUsuario } = useSesiones();
  const sesion = obtenerSesion(codigo);

  if (!sesion) {
    return (
      <EstadoVacio
        titulo="No encontramos esta sesión"
        descripcion="El código no existe o esta sesión no pertenece a tu cuenta."
      >
        <Link className="hu5-button hu5-button--primary" to="/sesiones">
          Volver a mis sesiones
        </Link>
      </EstadoVacio>
    );
  }
  if (rol !== 'tutor' || sesion.tutorId !== usuario.id) {
    return (
      <EstadoVacio
        titulo="Solo el tutor puede registrar el cierre"
        descripcion="Puedes consultar la información y los materiales desde el detalle de la sesión."
      >
        <Link
          className="hu5-button hu5-button--primary"
          to={`/sesiones/${codigo}`}
        >
          Ver detalle de la sesión
        </Link>
      </EstadoVacio>
    );
  }

  const finalizada = sesion.cierre?.finalizado
    || ['realizada', 'no-asistio'].includes(sesion.estado);
  const estudiante = obtenerUsuario(sesion.estudianteId);
  const nombreEstudiante = nombrePersona(
    estudiante ?? sesion.estudiante,
    sesion.estudianteNombre,
    sesion.estudianteId,
  );
  return (
    <div className="hu5-cierre-pagina">
      <header className="hu5-page-header hu5-cierre-cabecera">
        <nav className="hu5-eyebrow" aria-label="Ruta de navegación">
          <Link to="/sesiones">Mis sesiones</Link>
          <span aria-hidden="true"> › </span>
          <Link to={`/sesiones/${codigo}`}>{codigo}</Link>
          <span aria-hidden="true"> › </span>
          Cerrar sesión
        </nav>
        <h1>Cerrar sesión {sesion.codigo}</h1>
        <p className="hu5-lead">
          {nombreEstudiante} · {sesion.curso.codigo} {sesion.curso.nombre} ·{' '}
          {fechaCorta(sesion.fecha)}, {sesion.horaInicio} a {sesion.horaFin} · {sesion.modalidad}
        </p>
      </header>
      {finalizada ? (
        <CierreGuardado sesion={sesion} />
      ) : (
        <FormularioCierre
          key={`${codigo}-${usuario.id}-${rol}`}
          sesion={sesion}
        />
      )}
    </div>
  );
}
