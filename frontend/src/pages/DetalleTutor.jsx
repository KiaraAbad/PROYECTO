import { useState, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTutores } from "../hooks/useTutores";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ModalSolicitud from "../components/ModalSolicitud";
import Notificacion from "../components/Notificacion";
import { useAviso } from "../hooks/useAviso";
import { useSesiones } from "../hooks/useSesiones";
import "../styles/detalle-tutor.css";

const DIAS_AGENDA = [
  { clave: "lunes", etiqueta: "Lun" },
  { clave: "martes", etiqueta: "Mar" },
  { clave: "miercoles", etiqueta: "Mié" },
  { clave: "jueves", etiqueta: "Jue" },
  { clave: "viernes", etiqueta: "Vie" },
  { clave: "sabado", etiqueta: "Sáb" },
];

function fechaISO(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

function fechaVisible(fecha) {
  return fecha.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function obtenerLunes(fecha, desplazamiento = 0) {
  const lunes = new Date(
    fecha.getFullYear(),
    fecha.getMonth(),
    fecha.getDate()
  );

  const dia = lunes.getDay();
  lunes.setDate(
    lunes.getDate() - (dia === 0 ? 6 : dia - 1) + desplazamiento * 7
  );

  return lunes;
}

function crearSemana(indice) {
  const lunes = obtenerLunes(new Date(), indice);

  const dias = DIAS_AGENDA.map((dia, posicion) => {
    const fecha = new Date(lunes);
    fecha.setDate(lunes.getDate() + posicion);

    return {
      ...dia,
      fechaISO: fechaISO(fecha),
      fechaNum: fecha.getDate(),
      fechaCompleta: fechaVisible(fecha),
    };
  });

  return {
    rango: `${dias[0].fechaCompleta} — ${dias[5].fechaCompleta}`,
    dias,
    tieneBloques: true,
  };
}

function generarHoras(disponibilidad) {
  const horas = new Set();

  disponibilidad
    .filter((item) => item.tipo === "recurrente")
    .forEach((item) => {
      const inicio = Number(item.horaInicio.slice(0, 2));
      const fin = Number(item.horaFin.slice(0, 2));

      for (let hora = inicio; hora < fin; hora++) {
        horas.add(`${String(hora).padStart(2, "0")}:00`);
      }
    });

  return [...horas].sort().map((hora) => {
    const inicio = Number(hora.slice(0, 2));

    return {
      hora,
      fin: `${String(inicio + 1).padStart(2, "0")}:00`,
    };
  });
}

function hayDisponibilidad(
  disponibilidad,
  dia,
  fecha,
  horaInicio,
  horaFin
) {
  const recurrente = disponibilidad.some(
    (item) =>
      item.tipo === "recurrente" &&
      item.dia === dia &&
      item.estado === "libre" &&
      horaInicio >= item.horaInicio &&
      horaFin <= item.horaFin
  );

  if (!recurrente) return false;

  const tieneExcepcion = disponibilidad.some(
    (item) =>
      item.tipo === "excepcion" &&
      item.fecha === fecha &&
      horaInicio < item.horaFin &&
      horaFin > item.horaInicio
  );

  return !tieneExcepcion;
}

function DetalleTutor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tutores, cargando } = useTutores();
  const { rol } = useSesiones();
  const [referencia] = useState(() => new Date());

  const [semanaIndice, setSemanaIndice] = useState(0);
  const [solicitando, setSolicitando] = useState(false);
  const { aviso, avisar, cerrarAviso } = useAviso(9000);


  const [bloqueSeleccionado, setBloqueSeleccionado] = useState(null);

  const tutor = useMemo(() => {
    if (!tutores.length) return null;

    return (
      tutores.find((item) => item.id === id) ||
      tutores.find((item) => item.id === "u-003") ||
      tutores[0]
    );
  }, [tutores, id]);

  const disponibilidad = useMemo(
    () => tutor?.disponibilidad || [],
    [tutor]
  );

  const semanaActual = useMemo(
    () => crearSemana(semanaIndice),
    [semanaIndice]
  );

  const horasFilas = useMemo(
    () => generarHoras(disponibilidad),
    [disponibilidad]
  );

  const semanaTieneBloquesLibres = horasFilas.some((fila) =>
    semanaActual.dias.some((col) =>
      hayDisponibilidad(
        disponibilidad,
        col.clave,
        col.fechaISO,
        fila.hora,
        fila.fin
      )
    )
  );

  if (cargando) {
    return (
      <div className="detalle-tutor-page">
        <Header />
        <main className="detalle-tutor-container">
          <p className="detalle-tutor-cargando">Cargando perfil del tutor...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="detalle-tutor-page">
        <Header />
        <main className="detalle-tutor-container">
          <h1>Tutor no encontrado</h1>
          <Link to="/tutores">Volver al directorio</Link>
        </main>
        <Footer />
      </div>
    );
  }
  const perfil = tutor.perfilTutor || {};
  const nombreCompleto = `${tutor.nombres || ""} ${tutor.apellidos || ""}`.trim();

  const modalidadTexto = {
    presencial: "Presencial",
    remota: "Remota",
    ambas: "Presencial y remota",
  };

  const modalidad = perfil.modalidad || "remota";
  const modalidadVisible = modalidadTexto[modalidad] || modalidad;

  const sede = perfil.sedePreferencia?.trim() || "No especificada";
  const biografia =
    perfil.biografia?.trim() || "El tutor todavía no ha agregado su biografía.";

  const promedio =
    perfil.promedio != null ? Number(perfil.promedio).toFixed(1) : "4.7";

  const cursos = Array.isArray(perfil.cursos) ? perfil.cursos : [];

  const subtituloCursos = cursos.length
    ? cursos.map((curso) => `${curso.codigo} ${curso.nombre}`).join(" · ")
    : "Sin cursos registrados";

  const subtituloCompleto = [
    tutor.carrera,
    tutor.ciclo ? `${tutor.ciclo}.° ciclo` : null,
    subtituloCursos,
    promedio,
  ]
    .filter(Boolean)
    .join(" · ");

  const handleSeleccionarBloque = (col, fila) => {
    if (rol !== 'estudiante') {
      avisar('info', 'Cambia a la vista de estudiante para solicitar una sesión.');
      return;
    }
    if (new Date(`${col.fechaISO}T${fila.hora}:00-05:00`) <= new Date()) {
      avisar('info', 'Ese bloque ya comenzó. Elige uno posterior.');
      return;
    }
    setBloqueSeleccionado({
      diaClave: col.clave,
      nombreDia: col.clave,
      fecha: col.fechaISO,
      fechaVisible: col.fechaCompleta,
      horaInicio: fila.hora,
      horaFin: fila.fin,
    });
  };

  const irSemanaAnterior = () => {
    setSemanaIndice((actual) => actual - 1);
    setBloqueSeleccionado(null);
  };

  const irSemanaSiguiente = () => {
    setSemanaIndice((actual) => actual + 1);
    setBloqueSeleccionado(null);
  };

  return (
    <div className="detalle-tutor-page">
      <Header />

      <main className="detalle-tutor-container">
        <nav
          className="detalle-tutor__breadcrumb"
          aria-label="Ruta de navegación"
        >
          <Link to="/tutores" className="detalle-tutor__breadcrumb-link">
            Directorio
          </Link>
          <span className="detalle-tutor__breadcrumb-separador">›</span>
          <span className="detalle-tutor__breadcrumb-actual">
            {nombreCompleto}
          </span>
        </nav>

        {/* Información principal del tutor */}
        <section className="detalle-tutor__tarjeta-perfil">
          <div className="detalle-tutor__perfil-izq">
            <div className="detalle-tutor__avatar-grande" aria-hidden="true">
              {tutor.fotoUrl || perfil.fotoUrl ? (
                <img
                  src={tutor.fotoUrl || perfil.fotoUrl}
                  alt={nombreCompleto}
                />
              ) : null}
            </div>

            <div className="detalle-tutor__info-principal">
              <h1 className="detalle-tutor__nombre">{nombreCompleto}</h1>
              <p className="detalle-tutor__subtitulo">
                {subtituloCompleto}
              </p>
            </div>
          </div>

          <div className="detalle-tutor__perfil-der">
            <Link
              to={`/tutor/${tutor.id}`}
              className="detalle-tutor__btn-ver-resenas"
            >
              Ver reseñas
            </Link>
          </div>
        </section>

        <section
          className="detalle-tutor__tarjeta-agenda"
          aria-labelledby="detalle-tutor-info-titulo"
        >
          <h2
            id="detalle-tutor-info-titulo"
            className="detalle-tutor__agenda-titulo"
            style={{ marginBottom: "20px" }}
          >
            Sobre el tutor
          </h2>

          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ marginBottom: "8px" }}>Biografía y experiencia</h3>
            <p
              style={{
                color: "var(--text-muted)",
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
                margin: 0,
              }}
            >
              {biografia}
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
              marginBottom: "28px",
            }}
          >
            <div
              style={{
                background: "var(--primary-soft)",
                borderRadius: "10px",
                padding: "16px",
              }}
            >
              <h3 style={{ margin: "0 0 8px", fontSize: "1rem" }}>
                Modalidad de atención
              </h3>
              <p style={{ margin: 0, color: "var(--text-muted)" }}>
                {modalidadVisible}
              </p>
            </div>

            <div
              style={{
                background: "var(--primary-soft)",
                borderRadius: "10px",
                padding: "16px",
              }}
            >
              <h3 style={{ margin: "0 0 8px", fontSize: "1rem" }}>
                Sede de preferencia
              </h3>
              <p style={{ margin: 0, color: "var(--text-muted)" }}>{sede}</p>
            </div>
          </div>

          <h2
            className="detalle-tutor__agenda-titulo"
            style={{ marginBottom: "16px" }}
          >
            Cursos que enseña
          </h2>

          {cursos.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>
              Este tutor todavía no ha registrado cursos.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "16px",
              }}
            >
              {cursos.map((curso, indice) => (
                <article
                  key={`${curso.codigo || curso.nombre}-${indice}`}
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    padding: "18px",
                    background: "var(--surface)",
                  }}
                >
                  <p
                    style={{
                      color: "var(--primary)",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      margin: "0 0 6px",
                    }}
                  >
                    {curso.codigo || "Curso"}
                  </p>

                  <h3 style={{ margin: "0 0 12px", fontSize: "1.05rem" }}>
                    {curso.nombre || "Nombre no especificado"}
                  </h3>

                  <p style={{ margin: "0 0 10px" }}>
                    <strong>Nivel:</strong>{" "}
                    {curso.nivel || "No especificado"}
                  </p>

                  <p
                    style={{
                      margin: 0,
                      color: "var(--text-muted)",
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {curso.experiencia || "Sin descripción de experiencia."}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Agenda semanal: se conserva la lógica existente */}
        <section className="detalle-tutor__tarjeta-agenda">
          <div className="detalle-tutor__agenda-encabezado">
            <h2 className="detalle-tutor__agenda-titulo">
              Disponibilidad de la semana
            </h2>

            <div className="detalle-tutor__semana-controles">
              <button
                type="button"
                className="detalle-tutor__btn-semana"
                onClick={irSemanaAnterior}
              >
                ‹ Semana anterior
              </button>

              <span className="detalle-tutor__rango-fechas">
                {semanaActual.rango}
              </span>

              <button
                type="button"
                className="detalle-tutor__btn-semana"
                onClick={irSemanaSiguiente}
              >
                Semana siguiente ›
              </button>
            </div>
          </div>

          {horasFilas.length === 0 || !semanaTieneBloquesLibres ? (
            <div className="detalle-tutor__sin-bloques-caja">
            <div
              className="detalle-tutor__sin-bloques-icono"
              aria-hidden="true"
            >
              —
            </div>

            <h3 className="detalle-tutor__sin-bloques-titulo">
              {horasFilas.length === 0
                ? "No hay horarios registrados"
                : "No hay bloques libres esta semana"}
            </h3>

            <p className="detalle-tutor__sin-bloques-mensaje">
              {horasFilas.length === 0
                ? "Este tutor todavía no ha registrado su disponibilidad semanal."
                : "Este tutor no tiene bloques disponibles en las fechas consultadas. Puedes revisar la siguiente semana o buscar otros tutores."}
            </p>

            {horasFilas.length > 0 && (
              <div className="detalle-tutor__sin-bloques-acciones">
                <button
                  type="button"
                  className="detalle-tutor__btn-continuar"
                  onClick={irSemanaSiguiente}
                >
                  Ver semana siguiente
                </button>

                <button
                  type="button"
                  className="detalle-tutor__btn-semana"
                  onClick={() => {
                    navigate("/tutores");
                  }}
                >
                  Buscar otros tutores
                </button>
              </div>
            )}
          </div>
          ) : (
            <>
              <div className="detalle-tutor__grilla-wrapper">
                <table className="detalle-tutor__tabla">
                  <thead>
                    <tr>
                      <th className="detalle-tutor__th-hora"></th>
                      {semanaActual.dias.map((col) => (
                        <th
                          key={col.clave}
                          className="detalle-tutor__th-dia"
                        >
                          {col.etiqueta} {col.fechaNum}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {horasFilas.map((fila) => (
                      <tr key={fila.hora}>
                        <td className="detalle-tutor__td-hora">
                          {fila.hora}
                        </td>

                        {semanaActual.dias.map((col) => {
                          const estado = hayDisponibilidad(
                            disponibilidad,
                            col.clave,
                            col.fechaISO,
                            fila.hora,
                            fila.fin
                          )
                            ? "libre"
                            : null;
                           
                          const fechaHoraBloque = new Date(`${col.fechaISO}T${fila.hora}:00-05:00`);
                          const vencido = fechaHoraBloque <= referencia;


                          const esElegido =
                            bloqueSeleccionado?.diaClave === col.clave &&
                            bloqueSeleccionado?.fecha === col.fechaISO &&
                            bloqueSeleccionado?.horaInicio === fila.hora;

                          if (esElegido) {
                            return (
                              <td
                                key={col.clave}
                                className="detalle-tutor__td-slot"
                              >
                                <div className="detalle-tutor__slot detalle-tutor__slot--elegido">
                                  Elegido
                                </div>
                              </td>
                            );
                          }

                          if (estado === "libre") {
                            return (
                              <td
                                key={col.clave}
                                className="detalle-tutor__td-slot"
                              >
                                <button
                                  type="button"
                                  className="detalle-tutor__slot detalle-tutor__slot--libre"
                                  disabled={vencido || rol !== 'estudiante'}
                                  title={vencido ? 'Este bloque ya pasó' : rol !== 'estudiante' ? 'Cambia a la vista de estudiante para solicitar' : undefined}
                                  onClick={() => handleSeleccionarBloque(col, fila)}
                                >
                                  {vencido ? 'Pasado' : 'Libre'}
                                </button>
                              </td>
                            );
                          }

                          return (
                            <td
                              key={col.clave}
                              className="detalle-tutor__td-slot"
                            >
                              <div className="detalle-tutor__slot detalle-tutor__slot--vacio" />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {bloqueSeleccionado && (
                <div className="detalle-tutor__banner-confirmacion">
                  <div className="detalle-tutor__banner-texto">
                    <strong>Bloque elegido:</strong>{" "}
                    {bloqueSeleccionado.nombreDia}{" "}
                    {bloqueSeleccionado.fechaVisible},{" "}
                    {bloqueSeleccionado.horaInicio} a{" "}
                    {bloqueSeleccionado.horaFin} · modalidad {modalidadVisible}
                  </div>

                  <button
                    type="button"
                    className="detalle-tutor__btn-continuar"
                    onClick={() => setSolicitando(true)}
                    disabled={rol !== 'estudiante'}
                  >
                    Continuar con la solicitud
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <Footer />

      {solicitando && bloqueSeleccionado && rol === 'estudiante' && (
        <ModalSolicitud
          tutor={tutor}
          bloque={{
            fecha: bloqueSeleccionado.fecha,
            horaInicio: bloqueSeleccionado.horaInicio,
            horaFin: bloqueSeleccionado.horaFin,
          }}
          onCerrar={() => setSolicitando(false)}
          onEnviada={() => {
            setSolicitando(false);
            avisar(
              "exito",
              "Solicitud enviada al tutor. Te avisaremos cuando responda; suele hacerlo en 6 horas.",
              { texto: "Ir a mis sesiones", ruta: "/mis-sesiones" }
            );
          }}
        />
      )}

      {aviso && (
        <Notificacion tipo={aviso.tipo} mensaje={aviso.mensaje} accion={aviso.accion} onCerrar={cerrarAviso} />
      )}
    </div>
  );
}

export default DetalleTutor;
