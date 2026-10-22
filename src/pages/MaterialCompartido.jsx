import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSesiones } from '../hooks/useSesiones';
import {
  EstadoVacio,
  ModalConfirmacion,
} from '../components/sesiones/ElementosSesion';
import { validarMaterial } from '../utils/sesiones';

const FORMULARIO_VACIO = { titulo: '', url: '', descripcion: '' };

function erroresDeRespuesta(respuesta) {
  const errores = respuesta.errores ?? {};
  return {
    ...errores,
    general: errores.formulario ?? respuesta.mensaje,
  };
}

function urlPermitida(valor) {
  try {
    return ['http:', 'https:'].includes(new URL(valor).protocol);
  } catch {
    return false;
  }
}

function MaterialDeSesion({ sesion }) {
  const { rol, usuario, obtenerUsuario, guardarMaterial, eliminarMaterial } = useSesiones();
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [errores, setErrores] = useState({});
  const [materialAEliminar, setMaterialAEliminar] = useState(null);
  const [mostrarDescripcion, setMostrarDescripcion] = useState(false);
  // La referencia permite enfocar el input al elegir un material para editar.
  const referenciaTitulo = useRef(null);
  const puedeEditar = rol === 'tutor'
    && usuario.id === sesion.tutorId
    && sesion.estado !== 'cancelada';
  const materiales = sesion.cierre?.material ?? [];
  const cantidadRecursos = materiales.length === 1 ? 'recurso' : 'recursos';
  const mensajeSoloLectura = sesion.estado === 'cancelada'
    ? 'La sesión está cancelada. Sus materiales se conservan en modo lectura.'
    : 'Estos recursos fueron compartidos por tu tutor. Puedes abrirlos, pero no modificarlos.';
  const descripcionSinMateriales = puedeEditar
    ? 'Agrega enlaces a guías, prácticas o apuntes para que el estudiante los revise después.'
    : 'Cuando tu tutor comparta material, aparecerá aquí.';
  const claseFormulario = editandoId
    ? 'hu5-card hu5-material-editor hu5-material-editor--editando'
    : 'hu5-card hu5-material-editor';
  const tituloFormulario = editandoId ? 'Editar enlace' : 'Agregar material';
  const textoBotonGuardar = editandoId ? 'Guardar cambios' : 'Guardar';
  const estudiante = obtenerUsuario(sesion.estudianteId);
  const nombreEstudiante = estudiante
    ? `${estudiante.nombres} ${estudiante.apellidos}`
    : sesion.estudianteId;

  function enfocarFormulario() {
    referenciaTitulo.current?.focus();
    referenciaTitulo.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }

  function actualizar(campo, valor) {
    setFormulario(actual => ({ ...actual, [campo]: valor }));
    setErrores(actuales => ({
      ...actuales,
      [campo]: undefined,
      general: undefined,
    }));
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setFormulario(FORMULARIO_VACIO);
    setErrores({});
    setMostrarDescripcion(false);
  }

  function agregarEnlace() {
    cancelarEdicion();
    enfocarFormulario();
  }

  function editar(material) {
    setEditandoId(material.id);
    setFormulario({
      titulo: material.titulo,
      url: material.url,
      descripcion: material.descripcion ?? '',
    });
    setErrores({});
    setMostrarDescripcion(Boolean(material.descripcion));
    enfocarFormulario();
  }

  function guardar(evento) {
    evento.preventDefault();
    const datosMaterial = {
      titulo: formulario.titulo.trim(),
      url: formulario.url.trim(),
      descripcion: formulario.descripcion.trim(),
    };
    const erroresValidacion = validarMaterial(datosMaterial);
    setErrores(erroresValidacion);
    if (Object.keys(erroresValidacion).length > 0) {
      if (erroresValidacion.descripcion) setMostrarDescripcion(true);
      return;
    }

    const materialAGuardar = editandoId
      ? { ...datosMaterial, id: editandoId }
      : datosMaterial;
    const respuesta = guardarMaterial(sesion.codigo, materialAGuardar);
    if (respuesta.ok) {
      cancelarEdicion();
    } else {
      setErrores(erroresDeRespuesta(respuesta));
    }
  }

  function confirmarEliminacion() {
    const respuesta = eliminarMaterial(sesion.codigo, materialAEliminar.id);
    if (respuesta.ok && editandoId === materialAEliminar.id) {
      cancelarEdicion();
    }
    if (!respuesta.ok) {
      setErrores(erroresDeRespuesta(respuesta));
    }
    setMaterialAEliminar(null);
  }

  return (
    <div className="hu5-material-pagina">
      <header className="hu5-page-header hu5-material-cabecera">
        <div className="hu5-material-titulos">
          <nav className="hu5-eyebrow" aria-label="Ruta de navegación">
            <Link to="/sesiones">Mis sesiones</Link>
            <span aria-hidden="true"> › </span>
            <Link to={`/sesiones/${sesion.codigo}`}>{sesion.codigo}</Link>
            <span aria-hidden="true"> › </span>
            Material compartido
          </nav>
          <h1>Material compartido</h1>
          <p className="hu5-lead">
            Visible para {nombreEstudiante} en el detalle de la sesión {sesion.codigo}.
          </p>
        </div>
        {puedeEditar && (
          <button
            type="button"
            className="hu5-button hu5-button--primary hu5-material-agregar"
            onClick={agregarEnlace}
          >
            Agregar enlace
          </button>
        )}
      </header>
      {!puedeEditar && (
        <p className="hu5-alert hu5-alert--info">
          {mensajeSoloLectura}
        </p>
      )}
      {errores.general && (
        <p className="hu5-inline-error" role="alert">
          {errores.general}
        </p>
      )}
      {puedeEditar && (
        <form
          className={claseFormulario}
          onSubmit={guardar}
          noValidate
          aria-labelledby="material-form-titulo"
        >
          <h2 className="hu5-sr-only" id="material-form-titulo">
            {tituloFormulario}
          </h2>
          <div className="hu5-material-editor-fila">
            <div className="hu5-field hu5-material-campo-titulo">
              <label htmlFor="material-titulo">Título *</label>
              <input
                className="hu5-input"
                id="material-titulo"
                ref={referenciaTitulo}
                value={formulario.titulo}
                onChange={evento => actualizar('titulo', evento.target.value)}
                maxLength="120"
                placeholder="Ej.: Guía de ejercicios resueltos"
                aria-invalid={Boolean(errores.titulo)}
                aria-describedby={errores.titulo ? 'material-titulo-error' : undefined}
              />
              {errores.titulo && (
                <p className="hu5-inline-error" id="material-titulo-error">
                  {errores.titulo}
                </p>
              )}
            </div>
            <div className="hu5-field hu5-material-campo-url">
              <label htmlFor="material-url">Enlace *</label>
              <input
                className="hu5-input"
                id="material-url"
                type="url"
                value={formulario.url}
                onChange={evento => actualizar('url', evento.target.value)}
                placeholder="https://..."
                aria-invalid={Boolean(errores.url)}
                aria-describedby={`material-url-ayuda${errores.url ? ' material-url-error' : ''}`}
              />
              <span className="hu5-sr-only" id="material-url-ayuda">
                Solo enlaces web. No se cargan archivos a la plataforma.
              </span>
              {errores.url && (
                <p className="hu5-inline-error" id="material-url-error">
                  {errores.url}
                </p>
              )}
            </div>
            <button
              className="hu5-button hu5-button--secondary hu5-material-guardar"
              type="submit"
            >
              {textoBotonGuardar}
            </button>
          </div>
          <details
            className="hu5-material-descripcion-opcional"
            open={mostrarDescripcion}
            onToggle={evento => setMostrarDescripcion(evento.currentTarget.open)}
          >
            <summary>Descripción opcional</summary>
            <div className="hu5-field hu5-material-campo-descripcion">
              <label htmlFor="material-descripcion">
                Descripción <span className="hu5-muted">(opcional)</span>
              </label>
              <textarea
                className="hu5-textarea"
                id="material-descripcion"
                rows="3"
                maxLength="500"
                value={formulario.descripcion}
                onChange={evento => actualizar('descripcion', evento.target.value)}
                placeholder="Indica qué encontrará el estudiante en este recurso."
                aria-invalid={Boolean(errores.descripcion)}
                aria-describedby={errores.descripcion ? 'material-descripcion-error' : undefined}
              />
              <span className="hu5-counter">
                {formulario.descripcion.length}/500
              </span>
              {errores.descripcion && (
                <p className="hu5-inline-error" id="material-descripcion-error">
                  {errores.descripcion}
                </p>
              )}
            </div>
          </details>
          {editandoId && (
            <button
              className="hu5-material-accion hu5-material-cancelar"
              type="button"
              onClick={cancelarEdicion}
            >
              Cancelar edición
            </button>
          )}
        </form>
      )}
      <section className="hu5-material-listado" aria-labelledby="materiales-titulo">
        <h2 className="hu5-sr-only" id="materiales-titulo">
          Enlaces de la sesión: {materiales.length} {cantidadRecursos}
        </h2>
        {materiales.length === 0 ? (
          <div className="hu5-card hu5-material-vacio">
            <EstadoVacio
              titulo="Sin material compartido"
              descripcion={descripcionSinMateriales}
              icono="enlace"
            >
              {puedeEditar && (
                <button type="button" className="hu5-button" onClick={agregarEnlace}>
                  Agregar el primer enlace
                </button>
              )}
            </EstadoVacio>
          </div>
        ) : (
          <ul className="hu5-material-tarjetas">
            {materiales.map(material => (
              <li className="hu5-card hu5-material-tarjeta" key={material.id}>
                <div className="hu5-material-recurso">
                  <h3>{material.titulo}</h3>
                  {material.descripcion && (
                    <p className="hu5-preserve-lines">{material.descripcion}</p>
                  )}
                  {urlPermitida(material.url) ? (
                    <a
                      className="hu5-material-enlace"
                      href={material.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${material.titulo} (se abre en otra pestaña)`}
                    >
                      {material.url}
                    </a>
                  ) : (
                    <span className="hu5-material-enlace">{material.url}</span>
                  )}
                </div>
                {puedeEditar && (
                  <div className="hu5-material-controles">
                    <button
                      className="hu5-material-accion"
                      type="button"
                      onClick={() => editar(material)}
                      aria-label={`Editar ${material.titulo}`}
                    >
                      Editar
                    </button>
                    <button
                      className="hu5-material-accion hu5-material-accion--quitar"
                      type="button"
                      onClick={() => setMaterialAEliminar(material)}
                      aria-label={`Quitar ${material.titulo}`}
                    >
                      Quitar
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
      <Link
        className="hu5-text-link hu5-back-link hu5-material-volver"
        to={`/sesiones/${sesion.codigo}`}
      >
        ← Volver al detalle de la sesión
      </Link>
      {materialAEliminar && (
        <ModalConfirmacion
          titulo="¿Quitar este material?"
          confirmarTexto="Sí, quitar enlace"
          peligroso
          onConfirmar={confirmarEliminacion}
          onCancelar={() => setMaterialAEliminar(null)}
        >
          <p>
            Se quitará «{materialAEliminar.titulo}» de esta sesión y el estudiante dejará de verlo aquí.
          </p>
          <p>El recurso original seguirá existiendo en su plataforma.</p>
        </ModalConfirmacion>
      )}
    </div>
  );
}

export default function MaterialCompartido() {
  const { codigo } = useParams();
  const { obtenerSesion, usuario, rol } = useSesiones();
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

  // La key reinicia el formulario al cambiar de sesión, usuario o rol.
  return (
    <MaterialDeSesion
      key={`${codigo}-${usuario.id}-${rol}`}
      sesion={sesion}
    />
  );
}
