import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import EstrellasRating from '../components/EstrellasRating';
import { useTutores } from '../hooks/useTutores';
import valoraciones from '../data/ValoracionMock.json';
import '../styles/ficha-resenas.css';

const ID_TUTOR_POR_ID_VALORACION = {
  101: 'u-001',
  102: 'u-002',
};

function formatearFecha(fecha) {
  const [anio, mes, dia] = fecha.split('-');
  return `${dia}/${mes}/${anio}`;
}

export default function FichaTutorReseñas() {
  const { id } = useParams();
  const { tutores, cargando } = useTutores();
  const [filtroPuntaje, setFiltroPuntaje] = useState('todos');

  const tutor = tutores.find((item) => item.id === id);

  if (cargando) {
    return (
      <div className="ficha-resenas-page">
        <Header variante="publico" />
        <main className="ficha-resenas">
          <p className="ficha-resenas__estado">Cargando reseñas del tutor...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="ficha-resenas-page">
        <Header variante="publico" />
        <main className="ficha-resenas">
          <h1>No se encontró al tutor</h1>
          <Link to="/tutores">Volver al directorio</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const perfil = tutor.perfilTutor ?? {};
  const nombreCompleto = `${tutor.nombres ?? ''} ${tutor.apellidos ?? ''}`.trim();
  const cursos = (perfil.cursos ?? []).map((curso) => curso.codigo).filter(Boolean);

  const listaValoraciones = (() => {
    try {
      const guardadas = localStorage.getItem('tutorias_calificaciones');
      if (guardadas) {
        const parsed = JSON.parse(guardadas);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return valoraciones;
  })();

  const comentarios = listaValoraciones
    .filter(
      (valoracion) =>
        ID_TUTOR_POR_ID_VALORACION[valoracion.idTutor] === id ||
        valoracion.idTutor === id ||
        (valoracion.nombreTutor && nombreCompleto && valoracion.nombreTutor.toLowerCase().includes(nombreCompleto.toLowerCase()))
    )
    .map((valoracion) => ({
      id: valoracion.idCalificacion,
      curso: valoracion.curso,
      fecha: valoracion.fecha ? formatearFecha(valoracion.fecha) : '',
      estrellas: valoracion.puntajeGeneral,
      texto: valoracion.comentario,
      aspectos: valoracion.aspectos,
    }));
  const promedio =
    comentarios.length > 0
      ? comentarios.reduce((suma, comentario) => suma + comentario.estrellas, 0) /
        comentarios.length
      : Number(perfil.promedio ?? 0);
  const totalResenas =
    comentarios.length > 0
      ? comentarios.length
      : Number(perfil.totalResenas ?? 0);
  const distribucion = comentarios.reduce(
    (conteo, comentario) => ({
      ...conteo,
      [comentario.estrellas]: conteo[comentario.estrellas] + 1,
    }),
    { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  );
  const aspectos =
    comentarios.length > 0 && comentarios[0]?.aspectos
      ? Object.keys(comentarios[0].aspectos).map((aspecto) => ({
          nombre: aspecto,
          promedio:
            comentarios.reduce(
              (suma, comentario) => suma + (comentario.aspectos?.[aspecto] || 0),
              0
            ) / comentarios.length,
        }))
      : [];
  const comentariosFiltrados = comentarios.filter(
    (comentario) =>
      filtroPuntaje === 'todos' || comentario.estrellas === Number(filtroPuntaje)
  );

  return (
    <div className="ficha-resenas-page">
      <Header />
      <main className="ficha-resenas">
        <nav className="ficha-resenas__breadcrumb" aria-label="Ruta de navegación">
          <Link to="/tutores">Directorio</Link>
          <span aria-hidden="true">›</span>
          <Link to={`/tutores/${id}`}>{nombreCompleto}</Link>
          <span aria-hidden="true">›</span>
          <span>Reseñas</span>
        </nav>

        <section className="ficha-resenas__perfil">
          <div className="ficha-resenas__avatar">
            {perfil.fotoUrl ? (
              <img src={perfil.fotoUrl} alt="" />
            ) : null}
          </div>
          <div className="ficha-resenas__datos-tutor">
            <h1>{nombreCompleto}</h1>
            <p>
              {[tutor.carrera, tutor.ciclo ? `${tutor.ciclo}.° ciclo` : null, ...cursos]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
          <Link className="ficha-resenas__solicitar" to={`/tutores/${id}`}>
            Solicitar sesión
          </Link>
        </section>

        <section className="ficha-resenas__contenido" aria-label="Calificación y comentarios">
          <aside className="ficha-resenas__resumen">
            <div className="ficha-resenas__calificacion">
              <div className="ficha-resenas__promedio">
                <strong>{promedio.toFixed(1)}</strong>
                <EstrellasRating rating={Math.round(promedio)} readonly />
                <span>{totalResenas} reseñas</span>
              </div>

              <div className="ficha-resenas__distribucion" aria-label="Distribución de puntajes">
                {[5, 4, 3, 2, 1].map((puntaje) => (
                  <div className="ficha-resenas__fila-puntaje" key={puntaje}>
                    <span>{puntaje}</span>
                    <div
                      className="ficha-resenas__barra"
                      role="img"
                      aria-label={`${distribucion[puntaje]} reseñas con ${puntaje} estrellas`}
                    >
                      <span
                        style={{
                          width: `${comentarios.length ? (distribucion[puntaje] / comentarios.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span>{distribucion[puntaje]}</span>
                  </div>
                ))}
              </div>
            </div>

            {aspectos.length > 0 && (
              <dl className="ficha-resenas__aspectos">
                {aspectos.map(({ nombre, promedio: promedioAspecto }) => (
                  <div key={nombre}>
                    <dt>{nombre.charAt(0).toUpperCase() + nombre.slice(1)}</dt>
                    <dd>{promedioAspecto.toFixed(1)}</dd>
                  </div>
                ))}
              </dl>
            )}
          </aside>

          <section className="ficha-resenas__comentarios">
            <div className="ficha-resenas__comentarios-encabezado">
              <h2>Comentarios</h2>
              <label className="ficha-resenas__filtro">
                <span className="sr-only">Filtrar comentarios por puntaje</span>
                <select
                  value={filtroPuntaje}
                  onChange={(event) => setFiltroPuntaje(event.target.value)}
                >
                  <option value="todos">Puntaje: todos</option>
                  {[5, 4, 3, 2, 1].map((puntaje) => (
                    <option key={puntaje} value={puntaje}>
                      {puntaje} estrellas
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {comentariosFiltrados.length ? (
              <div className="ficha-resenas__lista">
                {comentariosFiltrados.map((comentario) => (
                  <article className="ficha-resenas__comentario" key={comentario.id}>
                    <div className="ficha-resenas__comentario-cabecera">
                      <div>
                        <h3>Estudiante</h3>
                        <p>{comentario.curso} · {comentario.fecha}</p>
                      </div>
                      <EstrellasRating rating={comentario.estrellas} readonly />
                    </div>
                    <p className="ficha-resenas__texto">{comentario.texto}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="ficha-resenas__estado">
                {comentarios.length
                  ? 'No hay comentarios con ese puntaje.'
                  : 'Aún no hay comentarios disponibles para este tutor.'}
              </p>
            )}

            {comentarios.length > 0 && (
              <p className="ficha-resenas__nota">
                Se muestran {comentarios.length} comentarios guardados en el archivo de valoraciones.
              </p>
            )}
          </section>
        </section>
      </main>
      <Footer />
    </div>
  );
}
