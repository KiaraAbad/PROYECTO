import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useTutores } from "../hooks/useTutores";
import { useAutenticacion } from "../hooks/useAutenticacion";
import "../styles/disponibilidad-tutor.css";

const DIAS = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
];

const BLOQUE_VACIO = {
  dia: "lunes",
  horaInicio: "09:00",
  horaFin: "11:00",
};

const EXCEPCION_VACIA = {
  fecha: "",
  horaInicio: "08:00",
  horaFin: "20:00",
};

function DisponibilidadTutor() {
  const { id } = useParams();
  const { usuario } = useAutenticacion();
  const { tutores, cargando, actualizarTutor } = useTutores();

  const [bloque, setBloque] = useState(BLOQUE_VACIO);
  const [excepcion, setExcepcion] = useState(EXCEPCION_VACIA);
  const [editando, setEditando] = useState(null);
  const [mensaje, setMensaje] = useState("");

  const tutor =
    tutores.find((item) => item.id === (id || usuario?.id || "u-001")) || null;

  const disponibilidad = tutor?.disponibilidad || [];

  const recurrentes = disponibilidad.filter(
    (item) => item.tipo === "recurrente"
  );

  const excepciones = disponibilidad.filter(
    (item) => item.tipo === "excepcion"
  );

  function guardarDisponibilidad(nuevaDisponibilidad) {
    actualizarTutor(tutor.id, {
      disponibilidad: nuevaDisponibilidad,
    });
  }

  function cambiarBloque(evento) {
    setBloque({
      ...bloque,
      [evento.target.name]: evento.target.value,
    });
    setMensaje("");
  }

  function guardarBloque(evento) {
    evento.preventDefault();

    if (bloque.horaInicio >= bloque.horaFin) {
      setMensaje("La hora de inicio debe ser anterior a la hora de fin.");
      return;
    }

    const conflicto = recurrentes.some((item, indice) => {
      if (editando !== null && indice === editando) return false;

      return (
        item.dia === bloque.dia &&
        bloque.horaInicio < item.horaFin &&
        bloque.horaFin > item.horaInicio
      );
    });

    if (conflicto) {
      setMensaje("Ese horario se cruza con otro bloque del mismo día.");
      return;
    }

    const nuevo = {
      tutorId: tutor.id,
      tipo: "recurrente",
      dia: bloque.dia,
      horaInicio: bloque.horaInicio,
      horaFin: bloque.horaFin,
      fecha: null,
      estado: "libre",
    };

    const actualizados =
      editando === null
        ? [...disponibilidad, nuevo]
        : disponibilidad.map((item) => {
            if (item !== recurrentes[editando]) return item;
            return nuevo;
          });

    guardarDisponibilidad(actualizados);
    setBloque(BLOQUE_VACIO);
    setEditando(null);
    setMensaje(
      editando === null
        ? "Bloque horario registrado correctamente."
        : "Bloque horario actualizado correctamente."
    );
  }

  function editarBloque(item) {
    setEditando(recurrentes.indexOf(item));
    setBloque({
      dia: item.dia,
      horaInicio: item.horaInicio,
      horaFin: item.horaFin,
    });
    setMensaje("");
  }

  function cancelarEdicion() {
    setEditando(null);
    setBloque(BLOQUE_VACIO);
    setMensaje("");
  }

  function eliminarBloque(item) {
    if (!window.confirm("¿Deseas eliminar este bloque horario?")) return;

    guardarDisponibilidad(
      disponibilidad.filter((actual) => actual !== item)
    );

    if (recurrentes.indexOf(item) === editando) {
      cancelarEdicion();
    }

    setMensaje("Bloque horario eliminado.");
  }

  function cambiarExcepcion(evento) {
    setExcepcion({
      ...excepcion,
      [evento.target.name]: evento.target.value,
    });
    setMensaje("");
  }

  function guardarExcepcion(evento) {
    evento.preventDefault();

    if (!excepcion.fecha) {
      setMensaje("Selecciona la fecha de la excepción.");
      return;
    }

    if (excepcion.horaInicio >= excepcion.horaFin) {
      setMensaje("La hora de inicio debe ser anterior a la hora de fin.");
      return;
    }

    const existe = excepciones.some(
      (item) =>
        item.fecha === excepcion.fecha &&
        excepcion.horaInicio < item.horaFin &&
        excepcion.horaFin > item.horaInicio
    );

    if (existe) {
      setMensaje("Ya existe una excepción que se cruza con ese horario.");
      return;
    }

    const diaFecha = new Date(`${excepcion.fecha}T12:00:00`)
      .getDay();

    const dia = [
      "domingo",
      "lunes",
      "martes",
      "miercoles",
      "jueves",
      "viernes",
      "sabado",
    ][diaFecha];

    const nueva = {
      tutorId: tutor.id,
      tipo: "excepcion",
      dia,
      horaInicio: excepcion.horaInicio,
      horaFin: excepcion.horaFin,
      fecha: excepcion.fecha,
      estado: "no-disponible",
    };

    guardarDisponibilidad([...disponibilidad, nueva]);
    setExcepcion(EXCEPCION_VACIA);
    setMensaje("Excepción registrada correctamente.");
  }

  function eliminarExcepcion(item) {
    if (!window.confirm("¿Deseas eliminar esta excepción?")) return;

    guardarDisponibilidad(
      disponibilidad.filter((actual) => actual !== item)
    );

    setMensaje("Excepción eliminada correctamente.");
  }

  if (cargando) {
    return (
      <div className="disponibilidad-tutor">
        <Header />
        <main className="disponibilidad-tutor__contenedor">
          <p>Cargando disponibilidad...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="disponibilidad-tutor">
        <Header />
        <main className="disponibilidad-tutor__contenedor">
          <h1>No se encontró el tutor.</h1>
          <Link to="/tutores">Volver al directorio</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="disponibilidad-tutor">
      <Header />

      <main className="disponibilidad-tutor__contenedor">
        <nav className="disponibilidad-tutor__migas">
          <Link to="/">Inicio</Link>
          <span>/</span>
          <Link to={`/mi-perfil-tutor/${tutor.id}`}>
            Mi perfil
          </Link>
          <span>/</span>
          <span>Disponibilidad</span>
        </nav>

        <header className="disponibilidad-tutor__encabezado">
          <div>
            <p className="disponibilidad-tutor__etiqueta">
              GESTIÓN DE TUTORÍAS
            </p>
            <h1>Mi disponibilidad</h1>
            <p>
              Define tus horarios semanales y registra fechas en las
              que no podrás atender tutorías.
            </p>
          </div>

          <Link
            className="disponibilidad-tutor__enlace"
            to={`/mi-perfil-tutor/${tutor.id}`}
          >
            Volver a mi perfil
          </Link>
        </header>

        <section className="disponibilidad-tutor__panel">
          <h2>
            {editando === null
              ? "Agregar horario semanal"
              : "Editar horario semanal"}
          </h2>

          <form onSubmit={guardarBloque}>
            <div className="disponibilidad-tutor__rejilla">
              <div className="disponibilidad-tutor__campo">
                <label htmlFor="dia">Día de la semana</label>
                <select
                  id="dia"
                  name="dia"
                  value={bloque.dia}
                  onChange={cambiarBloque}
                >
                  {DIAS.map((dia) => (
                    <option value={dia} key={dia}>
                      {dia.charAt(0).toUpperCase() + dia.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="disponibilidad-tutor__campo">
                <label htmlFor="horaInicio">Hora de inicio</label>
                <input
                  id="horaInicio"
                  name="horaInicio"
                  type="time"
                  value={bloque.horaInicio}
                  onChange={cambiarBloque}
                  required
                />
              </div>

              <div className="disponibilidad-tutor__campo">
                <label htmlFor="horaFin">Hora de fin</label>
                <input
                  id="horaFin"
                  name="horaFin"
                  type="time"
                  value={bloque.horaFin}
                  onChange={cambiarBloque}
                  required
                />
              </div>
            </div>

            <div className="disponibilidad-tutor__acciones">
              <button
                className="disponibilidad-tutor__boton es-primario"
                type="submit"
              >
                {editando === null ? "Agregar horario" : "Guardar cambios"}
              </button>

              {editando !== null && (
                <button
                  className="disponibilidad-tutor__boton es-secundario"
                  type="button"
                  onClick={cancelarEdicion}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>

          <h3>Horarios semanales registrados</h3>

          {recurrentes.length === 0 ? (
            <p>No hay horarios semanales registrados.</p>
          ) : (
            <div className="disponibilidad-tutor__lista">
              {recurrentes.map((item) => (
                <article
                  className="disponibilidad-tutor__elemento"
                  key={`${item.dia}-${item.horaInicio}-${item.horaFin}`}
                >
                  <div>
                    <strong>
                      {item.dia.charAt(0).toUpperCase() + item.dia.slice(1)}
                    </strong>
                    <p>
                      {item.horaInicio} – {item.horaFin}
                    </p>
                  </div>

                  <div className="disponibilidad-tutor__acciones">
                    <button
                      type="button"
                      className="disponibilidad-tutor__boton es-secundario"
                      onClick={() => editarBloque(item)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="disponibilidad-tutor__boton es-peligro"
                      onClick={() => eliminarBloque(item)}
                    >
                      Eliminar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="disponibilidad-tutor__panel">
          <h2>Registrar una excepción por fecha</h2>
          <p>
            Utiliza esta opción para indicar que no atenderás durante
            un horario concreto en una fecha determinada.
          </p>

          <form onSubmit={guardarExcepcion}>
            <div className="disponibilidad-tutor__rejilla">
              <div className="disponibilidad-tutor__campo">
                <label htmlFor="fecha">Fecha</label>
                <input
                  id="fecha"
                  name="fecha"
                  type="date"
                  value={excepcion.fecha}
                  onChange={cambiarExcepcion}
                  required
                />
              </div>

              <div className="disponibilidad-tutor__campo">
                <label htmlFor="excepcionInicio">Hora de inicio</label>
                <input
                  id="excepcionInicio"
                  name="horaInicio"
                  type="time"
                  value={excepcion.horaInicio}
                  onChange={cambiarExcepcion}
                  required
                />
              </div>

              <div className="disponibilidad-tutor__campo">
                <label htmlFor="excepcionFin">Hora de fin</label>
                <input
                  id="excepcionFin"
                  name="horaFin"
                  type="time"
                  value={excepcion.horaFin}
                  onChange={cambiarExcepcion}
                  required
                />
              </div>
            </div>

            <div className="disponibilidad-tutor__acciones">
              <button
                type="submit"
                className="disponibilidad-tutor__boton es-primario"
              >
                Registrar excepción
              </button>
            </div>
          </form>

          <h3>Excepciones registradas</h3>

          {excepciones.length === 0 ? (
            <p>No tienes excepciones registradas.</p>
          ) : (
            <div className="disponibilidad-tutor__lista">
              {excepciones.map((item) => (
                <article
                  className="disponibilidad-tutor__elemento"
                  key={`${item.fecha}-${item.horaInicio}-${item.horaFin}`}
                >
                  <div>
                    <strong>{item.fecha}</strong>
                    <p>
                      {item.horaInicio} – {item.horaFin}
                    </p>
                    <small>No disponible</small>
                  </div>

                  <button
                    type="button"
                    className="disponibilidad-tutor__boton es-peligro"
                    onClick={() => eliminarExcepcion(item)}
                  >
                    Eliminar
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        {mensaje && (
          <p className="disponibilidad-tutor__mensaje" role="status">
            {mensaje}
          </p>
        )}

        <p className="disponibilidad-tutor__nota">
          Los horarios y las excepciones se guardan en los datos compartidos
          del tutor para esta demostración.
        </p>
      </main>

      <Footer />
    </div>
  );
}

export default DisponibilidadTutor;
