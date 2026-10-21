import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import EstrellasRating from '../components/EstrellasRating';
import valoracionesIniciales from '../data/ValoracionMock.json';
import '../styles/calificaciones.css';

const DIAS_PARA_EDITAR = 7;

function obtenerFecha(fecha) {
  return new Date(`${fecha}T00:00:00`);
}

function formatearFecha(fecha) {
  return obtenerFecha(fecha).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function obtenerFechaLimite(fecha) {
  const limite = obtenerFecha(fecha);
  limite.setDate(limite.getDate() + DIAS_PARA_EDITAR);
  return limite;
}

function sePuedeEditar(fecha) {
  const limite = obtenerFechaLimite(fecha);
  limite.setHours(23, 59, 59, 999);
  return Date.now() <= limite.getTime();
}

export default function MisCalificaciones() {
  const [misReseñas, setMisReseñas] = useState(valoracionesIniciales);
  const [cursoSeleccionado, setCursoSeleccionado] = useState('todos');
  const [reseñaEditando, setReseñaEditando] = useState(null);
  const [borrador, setBorrador] = useState({ puntaje: 5, comentario: '' });

  const cursos = [...new Set(misReseñas.map((reseña) => reseña.curso))];
  const reseñasFiltradas = misReseñas.filter(
    (reseña) => cursoSeleccionado === 'todos' || reseña.curso === cursoSeleccionado
  );

  const handleEliminar = (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta calificación?')) {
      setMisReseñas((actuales) =>
        actuales.filter((reseña) => reseña.idCalificacion !== id)
      );
      if (reseñaEditando === id) setReseñaEditando(null);
    }
  };

  const iniciarEdicion = (reseña) => {
    setReseñaEditando(reseña.idCalificacion);
    setBorrador({
      puntaje: reseña.puntajeGeneral,
      comentario: reseña.comentario,
    });
  };

  const guardarEdicion = (event, id) => {
    event.preventDefault();
    setMisReseñas((actuales) =>
      actuales.map((reseña) =>
        reseña.idCalificacion === id
          ? {
              ...reseña,
              puntajeGeneral: borrador.puntaje,
              comentario: borrador.comentario.trim(),
            }
          : reseña
      )
    );
    setReseñaEditando(null);
  };

  return (
    <div className="mis-calificaciones-page">
      <Header />
      <main className="main-mis-calificaciones">
        <div className="mis-calificaciones-encabezado">
          <div>
            <h1>Mis calificaciones</h1>
            <p>Puedes editarlas o eliminarlas dentro de los 7 días posteriores a la sesión.</p>
          </div>
          <label className="filtro-curso">
            <span className="sr-only">Filtrar calificaciones por curso</span>
            <select
              value={cursoSeleccionado}
              onChange={(event) => setCursoSeleccionado(event.target.value)}
            >
              <option value="todos">Curso: todos</option>
              {cursos.map((curso) => (
                <option key={curso} value={curso}>{curso}</option>
              ))}
            </select>
          </label>
        </div>

        {reseñasFiltradas.length === 0 ? (
          <p className="estado-vacio">
            {misReseñas.length
              ? 'No tienes calificaciones para este curso.'
              : 'No has emitido ninguna calificación todavía.'}
          </p>
        ) : (
          <div className="lista-reseñas">
            {reseñasFiltradas.map((reseña) => {
              const puedeEditar = sePuedeEditar(reseña.fecha);
              const editando = reseñaEditando === reseña.idCalificacion;

              return (
                <article className="tarjeta-reseña-usuario" key={reseña.idCalificacion}>
                  <div className="calificacion-tutor">
                    <div className="calificacion-avatar" aria-hidden="true" />
                    <div className="calificacion-tutor__datos">
                      <h2>{reseña.nombreTutor}</h2>
                      <p>{reseña.curso} · {formatearFecha(reseña.fecha)}</p>
                    </div>
                    <EstrellasRating rating={reseña.puntajeGeneral} readonly />
                  </div>

                  {editando ? (
                    <form
                      className="edicion-calificacion"
                      onSubmit={(event) => guardarEdicion(event, reseña.idCalificacion)}
                    >
                      <label>
                        Puntaje
                        <select
                          value={borrador.puntaje}
                          onChange={(event) =>
                            setBorrador((actual) => ({
                              ...actual,
                              puntaje: Number(event.target.value),
                            }))
                          }
                        >
                          {[5, 4, 3, 2, 1].map((puntaje) => (
                            <option key={puntaje} value={puntaje}>{puntaje} estrellas</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Comentario
                        <textarea
                          value={borrador.comentario}
                          onChange={(event) =>
                            setBorrador((actual) => ({
                              ...actual,
                              comentario: event.target.value,
                            }))
                          }
                          required
                        />
                      </label>
                      <div className="acciones-edicion">
                        <button type="submit" className="btn-guardar">Guardar cambios</button>
                        <button
                          type="button"
                          className="btn-cancelar"
                          onClick={() => setReseñaEditando(null)}
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <p className="comentario-texto">{reseña.comentario}</p>
                      <div className="acciones-reseña">
                        {puedeEditar ? (
                          <>
                            <button
                              type="button"
                              className="btn-editar"
                              onClick={() => iniciarEdicion(reseña)}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="btn-eliminar"
                              onClick={() => handleEliminar(reseña.idCalificacion)}
                            >
                              Eliminar
                            </button>
                            <span className="plazo-edicion">
                              Plazo de edición hasta el {formatearFecha(
                                obtenerFechaLimite(reseña.fecha).toISOString().slice(0, 10)
                              )}
                            </span>
                          </>
                        ) : (
                          <span className="plazo-edicion">Plazo de edición vencido</span>
                        )}
                      </div>
                    </>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
