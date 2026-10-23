import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useTutores } from "../hooks/useTutores";
import { useAutenticacion } from "../hooks/useAutenticacion";
import "../styles/mis-cursos-tutor.css";

const CURSO_VACIO = {
  codigo: "",
  nombre: "",
  nivel: "intermedio",
  experiencia: "",
};

function MisCursosTutor() {
  const { id } = useParams();
  const { usuario } = useAutenticacion();
  const { tutores, cargando, actualizarTutor } = useTutores();

  const [formulario, setFormulario] = useState(CURSO_VACIO);
  const [codigoOriginal, setCodigoOriginal] = useState(null);
  const [mensaje, setMensaje] = useState("");

  const tutor =
    tutores.find((item) => item.id === (id || usuario?.id || "u-001")) || null;

  const cursos = tutor?.perfilTutor?.cursos || [];

  function cambiarCampo(evento) {
    const { name, value } = evento.target;
    setFormulario((actual) => ({ ...actual, [name]: value }));
    setMensaje("");
  }

  function guardarCurso(evento) {
    evento.preventDefault();

    if (!tutor) return;

    const codigo = formulario.codigo.trim().toUpperCase();
    const nombre = formulario.nombre.trim();
    const experiencia = formulario.experiencia.trim();

    if (!codigo || !nombre || !experiencia) {
      setMensaje("Completa todos los campos del curso.");
      return;
    }

    const duplicado = cursos.some(
      (curso) =>
        curso.codigo.toUpperCase() === codigo &&
        curso.codigo !== codigoOriginal
    );

    if (duplicado) {
      setMensaje("Ya existe un curso registrado con ese código.");
      return;
    }

    const nuevoCurso = {
      codigo,
      nombre,
      nivel: formulario.nivel,
      experiencia,
    };

    const nuevosCursos =
      codigoOriginal === null
        ? [...cursos, nuevoCurso]
        : cursos.map((curso) =>
            curso.codigo === codigoOriginal ? nuevoCurso : curso
          );

    actualizarTutor(tutor.id, {
      perfilTutor: { cursos: nuevosCursos },
    });

    setFormulario(CURSO_VACIO);
    setCodigoOriginal(null);
    setMensaje(
      codigoOriginal === null
        ? "Curso registrado correctamente."
        : "Curso actualizado correctamente."
    );
  }

  function editarCurso(curso) {
    setFormulario({
      codigo: curso.codigo,
      nombre: curso.nombre,
      nivel: curso.nivel || "intermedio",
      experiencia: curso.experiencia || "",
    });

    setCodigoOriginal(curso.codigo);
    setMensaje("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelarEdicion() {
    setFormulario(CURSO_VACIO);
    setCodigoOriginal(null);
    setMensaje("");
  }

  function eliminarCurso(curso) {
    if (!tutor) return;

    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar el curso ${curso.nombre} (${curso.codigo})?`
    );

    if (!confirmar) return;

    actualizarTutor(tutor.id, {
      perfilTutor: {
        cursos: cursos.filter(
          (item) => item.codigo !== curso.codigo
        ),
      },
    });

    if (codigoOriginal === curso.codigo) {
      cancelarEdicion();
    }

    setMensaje("Curso eliminado correctamente.");
  }

  if (cargando) {
    return (
      <div className="mis-cursos-tutor">
        <Header />
        <main className="mis-cursos-tutor__contenedor">
          <p>Cargando cursos...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="mis-cursos-tutor">
        <Header />
        <main className="mis-cursos-tutor__contenedor">
          <h1>No se encontró el tutor.</h1>
          <Link to="/tutores">Volver al directorio</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="mis-cursos-tutor">
      <Header />

      <main className="mis-cursos-tutor__contenedor">
        <nav className="mis-cursos-tutor__migas">
          <Link to="/">Inicio</Link>
          <span>/</span>
          <Link to={`/mi-perfil-tutor/${tutor.id}`}>
            Mi perfil
          </Link>
          <span>/</span>
          <span>Mis cursos</span>
        </nav>

        <header className="mis-cursos-tutor__encabezado">
          <div>
            <p className="mis-cursos-tutor__etiqueta">
              GESTIÓN DE TUTORÍAS
            </p>
            <h1>Mis cursos</h1>
            <p>
              Administra los cursos que enseñas y describe tu experiencia
              en cada uno.
            </p>
          </div>

          <Link
            className="mis-cursos-tutor__enlace"
            to={`/mi-perfil-tutor/${tutor.id}`}
          >
            Volver a mi perfil
          </Link>
        </header>

        <section className="mis-cursos-tutor__panel">
          <h2>
            {codigoOriginal === null
              ? "Registrar un curso"
              : "Editar curso"}
          </h2>

          <form onSubmit={guardarCurso}>
            <div className="mis-cursos-tutor__rejilla">
              <div className="mis-cursos-tutor__campo">
                <label htmlFor="codigo">Código del curso</label>
                <input
                  id="codigo"
                  name="codigo"
                  value={formulario.codigo}
                  onChange={cambiarCampo}
                  placeholder="Ej. MA101"
                  maxLength={20}
                  required
                />
              </div>

              <div className="mis-cursos-tutor__campo">
                <label htmlFor="nombre">Nombre del curso</label>
                <input
                  id="nombre"
                  name="nombre"
                  value={formulario.nombre}
                  onChange={cambiarCampo}
                  placeholder="Ej. Cálculo I"
                  maxLength={100}
                  required
                />
              </div>

              <div className="mis-cursos-tutor__campo">
                <label htmlFor="nivel">Nivel declarado</label>
                <select
                  id="nivel"
                  name="nivel"
                  value={formulario.nivel}
                  onChange={cambiarCampo}
                >
                  <option value="basico">Básico</option>
                  <option value="intermedio">Intermedio</option>
                  <option value="avanzado">Avanzado</option>
                </select>
              </div>

              <div className="mis-cursos-tutor__campo">
                <label htmlFor="experiencia">
                  Experiencia en el curso
                </label>
                <textarea
                  id="experiencia"
                  name="experiencia"
                  value={formulario.experiencia}
                  onChange={cambiarCampo}
                  placeholder="Describe brevemente tu experiencia..."
                  maxLength={300}
                  rows={3}
                  required
                />
              </div>
            </div>

            <div className="mis-cursos-tutor__acciones">
              <button
                type="submit"
                className="mis-cursos-tutor__boton es-primario"
              >
                {codigoOriginal === null
                  ? "Registrar curso"
                  : "Guardar cambios"}
              </button>

              {codigoOriginal !== null && (
                <button
                  type="button"
                  className="mis-cursos-tutor__boton es-secundario"
                  onClick={cancelarEdicion}
                >
                  Cancelar edición
                </button>
              )}
            </div>
          </form>

          {mensaje && (
            <p className="mis-cursos-tutor__mensaje" role="status">
              {mensaje}
            </p>
          )}
        </section>

        <section className="mis-cursos-tutor__panel">
          <div className="mis-cursos-tutor__lista-encabezado">
            <div>
              <h2>Mis cursos registrados</h2>
              <p>
                {cursos.length}{" "}
                {cursos.length === 1 ? "curso registrado" : "cursos registrados"}
              </p>
            </div>
          </div>

          {cursos.length === 0 ? (
            <div className="mis-cursos-tutor__vacio">
              <h3>Aún no has registrado cursos</h3>
              <p>Utiliza el formulario para agregar tu primer curso.</p>
            </div>
          ) : (
            <div className="mis-cursos-tutor__lista">
              {cursos.map((curso) => (
                <article
                  className="mis-cursos-tutor__curso"
                  key={curso.codigo}
                >
                  <div className="mis-cursos-tutor__curso-info">
                    <div className="mis-cursos-tutor__curso-titulo">
                      <span className="mis-cursos-tutor__codigo">
                        {curso.codigo}
                      </span>
                      <h3>{curso.nombre}</h3>
                    </div>

                    <span className="mis-cursos-tutor__nivel">
                      {curso.nivel || "No especificado"}
                    </span>

                    <p>{curso.experiencia || "Sin experiencia descrita."}</p>
                  </div>

                  <div className="mis-cursos-tutor__curso-acciones">
                    <button
                      type="button"
                      className="mis-cursos-tutor__boton es-secundario"
                      onClick={() => editarCurso(curso)}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className="mis-cursos-tutor__boton es-peligro"
                      onClick={() => eliminarCurso(curso)}
                    >
                      Eliminar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <p className="mis-cursos-tutor__nota">
          Los cambios se guardan en el estado compartido y en el almacenamiento
          local del navegador para esta demostración.
        </p>
      </main>

      <Footer />
    </div>
  );
}

export default MisCursosTutor;
