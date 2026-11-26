import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useTutores } from "../hooks/useTutores";
import { useAutenticacion } from "../hooks/useAutenticacion";
import "../styles/mi-perfil-tutor.css";

function MiPerfilTutor() {
  const { id } = useParams();
  const { usuario } = useAutenticacion();
  const { tutores, cargando, actualizarTutor } = useTutores();
  const [mensaje, setMensaje] = useState("");

  const tutor =
    tutores.find((item) => item.id === (id || usuario?.id || "u-001")) || null;

  const [prevTutorId, setPrevTutorId] = useState(tutor?.id);
  const [formulario, setFormulario] = useState(() => {
    const perfil = tutor?.perfilTutor || {};
    return {
      biografia: perfil.biografia || "",
      modalidad: perfil.modalidad || "ambas",
      sedePreferencia: perfil.sedePreferencia || "",
    };
  });

  if (tutor && tutor.id !== prevTutorId) {
    setPrevTutorId(tutor.id);
    const perfil = tutor.perfilTutor || {};
    setFormulario({
      biografia: perfil.biografia || "",
      modalidad: perfil.modalidad || "ambas",
      sedePreferencia: perfil.sedePreferencia || "",
    });
  }


  if (cargando) {
    return (
      <div className="mi-perfil-tutor">
        <Header />
        <main className="mi-perfil-tutor__contenedor">
          <p>Cargando perfil...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="mi-perfil-tutor">
        <Header />
        <main className="mi-perfil-tutor__contenedor">
          <h1>No se encontró el tutor</h1>
          <Link to="/tutores">Volver al directorio</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const perfil = tutor.perfilTutor || {};

  function cambiarCampo(evento) {
    const { name, value } = evento.target;

    setFormulario((actual) => ({
      ...actual,
      [name]: value,
    }));

    setMensaje("");
  }

  function guardarFicha(evento) {
    evento.preventDefault();

    if (!formulario.biografia.trim() || !formulario.sedePreferencia.trim()) {
      setMensaje("Completa tu biografía y tu sede de preferencia.");
      return;
    }

    actualizarTutor(tutor.id, {
      perfilTutor: {
        ...formulario,
        biografia: formulario.biografia.trim(),
        sedePreferencia: formulario.sedePreferencia.trim(),
      },
    });

    setMensaje("Tu ficha se guardó correctamente.");
  }

  function cambiarEstado() {
    const nuevoEstado = !perfil.activo;

    if (
      nuevoEstado &&
      (!formulario.biografia.trim() || !formulario.sedePreferencia.trim())
    ) {
      setMensaje("Completa tu biografía y sede antes de activar el perfil.");
      return;
    }

    actualizarTutor(tutor.id, {
      perfilTutor: {
        ...formulario,
        biografia: formulario.biografia.trim(),
        sedePreferencia: formulario.sedePreferencia.trim(),
        activo: nuevoEstado,
      },
    });

    setMensaje(
      nuevoEstado
        ? "Tu perfil de tutor está activo."
        : "Tu perfil de tutor está desactivado."
    );
  }

  return (
    <div className="mi-perfil-tutor">
      <Header />

      <main className="mi-perfil-tutor__contenedor">
        <nav className="mi-perfil-tutor__migas" aria-label="Ruta de navegación">
          <Link to="/">Inicio</Link>
          <span>/</span>
          <span>Mi perfil de tutor</span>
        </nav>

        <header className="mi-perfil-tutor__encabezado">
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            {tutor.fotoUrl ? (
              <img
                src={tutor.fotoUrl}
                alt={`${tutor.nombres} ${tutor.apellidos}`}
                style={{ width: "72px", height: "72px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
              />
            ) : null}
            <div>
              <p className="mi-perfil-tutor__etiqueta">GESTIÓN DE TUTORÍAS</p>
              <h1>Mi perfil de tutor</h1>
              <p>
                Administra la información que verán los estudiantes en tu ficha
                pública.
              </p>
              <p className="mi-perfil-tutor__nombre">
                Perfil de {tutor.nombres} {tutor.apellidos}
              </p>
            </div>
          </div>

          <div className="mi-perfil-tutor__navegacion">
            <Link
              to={`/mis-cursos-tutor/${tutor.id}`}
              className="mi-perfil-tutor__enlace"
            >
              Gestionar mis cursos
            </Link>

            <Link
              to={`/tutores/${tutor.id}`}
              className="mi-perfil-tutor__enlace"
            >
              Ver ficha pública
            </Link>
            <Link
              to={`/disponibilidad-tutor/${tutor.id}`}
              className="mi-perfil-tutor__enlace"
            >
              Gestionar disponibilidad
            </Link>
          </div>
        </header>

        <section className="mi-perfil-tutor__panel">
          <div className="mi-perfil-tutor__estado">
            <div>
              <h2>Estado de mi perfil</h2>
              <p>
                {perfil.activo
                  ? "Tu perfil está activo y puede aparecer en el directorio."
                  : "Tu perfil está desactivado y no aparece en el directorio."}
              </p>
            </div>

            <span
              className={`mi-perfil-tutor__insignia ${
                perfil.activo ? "es-activo" : "es-inactivo"
              }`}
            >
              {perfil.activo ? "Activo" : "Inactivo"}
            </span>
          </div>

          <button
            type="button"
            className={`mi-perfil-tutor__boton ${
              perfil.activo ? "es-peligro" : "es-primario"
            }`}
            onClick={cambiarEstado}
          >
            {perfil.activo ? "Desactivar perfil" : "Activar perfil"}
          </button>
        </section>

        <section className="mi-perfil-tutor__panel">
          <h2>Información de mi ficha</h2>
          <p className="mi-perfil-tutor__ayuda">
            Completa estos datos para que los estudiantes conozcan tu experiencia
            y modalidad de atención.
          </p>

          <form onSubmit={guardarFicha}>
            <div className="mi-perfil-tutor__campo">
              <label htmlFor="biografia">Biografía y experiencia</label>
              <textarea
                id="biografia"
                name="biografia"
                rows={5}
                maxLength={600}
                value={formulario.biografia}
                onChange={cambiarCampo}
                placeholder="Describe tu experiencia ayudando a otros estudiantes..."
                required
              />
              <small>{formulario.biografia.length}/600 caracteres</small>
            </div>

            <div className="mi-perfil-tutor__campo">
              <label htmlFor="modalidad">Modalidad de atención</label>
              <select
                id="modalidad"
                name="modalidad"
                value={formulario.modalidad}
                onChange={cambiarCampo}
              >
                <option value="presencial">Presencial</option>
                <option value="remota">Remota</option>
                <option value="ambas">Presencial y remota</option>
              </select>
            </div>

            <div className="mi-perfil-tutor__campo">
              <label htmlFor="sedePreferencia">Sede de preferencia</label>
              <input
                id="sedePreferencia"
                name="sedePreferencia"
                value={formulario.sedePreferencia}
                onChange={cambiarCampo}
                placeholder="Ej. Monterrico"
                required
              />
            </div>

            <button
              type="submit"
              className="mi-perfil-tutor__boton es-primario"
            >
              Guardar ficha
            </button>
          </form>

          {mensaje && (
            <p className="mi-perfil-tutor__mensaje" role="status">
              {mensaje}
            </p>
          )}
        </section>

        <p className="mi-perfil-tutor__nota">
          Esta versión guarda los cambios en el navegador para la demostración
          del proyecto. No modifica el archivo JSON original.
        </p>
      </main>

      <Footer />
    </div>
  );
}

export default MiPerfilTutor;
