import { useState, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTutores } from "../hooks/useTutores";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ModalSolicitud from "../components/ModalSolicitud";
import Notificacion from "../components/Notificacion";
import { useAviso } from "../hooks/useAviso";
import "../styles/detalle-tutor.css";

const SEMANAS = [
  {
    indice: 0,
    rango: "14/09/2026 — 19/09/2026",
    fechaSiguiente: "21/09/2026",
    tieneBloques: true,
    dias: [
      { clave: "lunes", diaSemana: "Lun", fechaNum: 14, fechaCompleta: "14/09/2026", nombreDia: "lunes" },
      { clave: "martes", diaSemana: "Mar", fechaNum: 15, fechaCompleta: "15/09/2026", nombreDia: "martes" },
      { clave: "miercoles", diaSemana: "Mié", fechaNum: 16, fechaCompleta: "16/09/2026", nombreDia: "miércoles" },
      { clave: "jueves", diaSemana: "Jue", fechaNum: 17, fechaCompleta: "17/09/2026", nombreDia: "jueves" },
      { clave: "viernes", diaSemana: "Vie", fechaNum: 18, fechaCompleta: "18/09/2026", nombreDia: "viernes" },
      { clave: "sabado", diaSemana: "Sáb", fechaNum: 19, fechaCompleta: "19/09/2026", nombreDia: "sábado" },
    ],
  },
  {
    indice: 1,
    rango: "21/09/2026 — 26/09/2026",
    fechaSiguiente: "28/09/2026",
    tieneBloques: false,
    dias: [],
  },
  {
    indice: 2,
    rango: "28/09/2026 — 03/10/2026",
    fechaSiguiente: "05/10/2026",
    tieneBloques: true,
    dias: [
      { clave: "lunes", diaSemana: "Lun", fechaNum: 28, fechaCompleta: "28/09/2026", nombreDia: "lunes" },
      { clave: "martes", diaSemana: "Mar", fechaNum: 29, fechaCompleta: "29/09/2026", nombreDia: "martes" },
      { clave: "miercoles", diaSemana: "Mié", fechaNum: 30, fechaCompleta: "30/09/2026", nombreDia: "miércoles" },
      { clave: "jueves", diaSemana: "Jue", fechaNum: 1, fechaCompleta: "01/10/2026", nombreDia: "jueves" },
      { clave: "viernes", diaSemana: "Vie", fechaNum: 2, fechaCompleta: "02/10/2026", nombreDia: "viernes" },
      { clave: "sabado", diaSemana: "Sáb", fechaNum: 3, fechaCompleta: "03/10/2026", nombreDia: "sábado" },
    ],
  },
];

const HORAS_FILAS = [
  { hora: "08:00", fin: "09:00" },
  { hora: "09:00", fin: "10:00" },
  { hora: "16:00", fin: "17:00" },
  { hora: "17:00", fin: "18:00" },
];

const ESTADOS_SEMANA_1 = {
  "lunes-08:00": "libre",
  "lunes-09:00": "ocupado",
  "lunes-16:00": "libre",
  "lunes-17:00": "libre",

  "martes-09:00": "libre",
  "martes-17:00": "ocupado",

  "miercoles-08:00": "libre",
  "miercoles-16:00": "libre",

  "jueves-09:00": "libre",

  "viernes-08:00": "ocupado",
  "viernes-16:00": "libre",
  "viernes-17:00": "libre",

  "sabado-09:00": "libre",
};

function DetalleTutor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tutores, cargando } = useTutores();

  const [semanaIndice, setSemanaIndice] = useState(0);
  const [solicitando, setSolicitando] = useState(false);
  const { aviso, avisar, cerrarAviso } = useAviso(9000);


  const [bloqueSeleccionado, setBloqueSeleccionado] = useState({
    diaClave: "lunes",
    nombreDia: "lunes",
    fecha: "14/09/2026",
    horaInicio: "16:00",
    horaFin: "17:00",
  });

  const tutor = useMemo(() => {
    if (!tutores.length) return null;
    return (
      tutores.find((item) => item.id === id) ||
      tutores.find((item) => item.id === "u-003") ||
      tutores[0]
    );
  }, [tutores, id]);

  const semanaActual = SEMANAS[semanaIndice] || SEMANAS[0];

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

  const perfil = tutor.perfilTutor ?? {};
  const primerNombre = tutor.nombres?.split(" ")[0] || "El tutor";
  const nombreCompleto = `${tutor.nombres} ${tutor.apellidos}`.trim();
  const modalidad = perfil.modalidad || "remota";
  const promedio = perfil.promedio != null ? Number(perfil.promedio).toFixed(1) : "4.7";

  const cursos = perfil.cursos?.length
    ? perfil.cursos
    : [
      { codigo: "MA101", nombre: "Cálculo I" },
      { codigo: "FI202", nombre: "Física II" },
    ];

  const primerCursoCodigo = cursos[0]?.codigo || "MA101";
  const primerCursoNombre = cursos[0]?.nombre || "Cálculo I";

  const subtituloCursos = cursos
    .map((c) => `${c.codigo} ${c.nombre}`)
    .join(" · ");

  const subtituloCompleto = `${tutor.carrera || "Ingeniería Civil"} · ${tutor.ciclo ? `${tutor.ciclo}.° ciclo` : "9.° ciclo"
    } · ${subtituloCursos} · ${promedio}`;

  const handleSeleccionarBloque = (col, fila) => {
    setBloqueSeleccionado({
      diaClave: col.clave,
      nombreDia: col.nombreDia,
      fecha: col.fechaCompleta,
      horaInicio: fila.hora,
      horaFin: fila.fin,
    });
  };

  const irSemanaAnterior = () => {
    if (semanaIndice > 0) setSemanaIndice(semanaIndice - 1);
  };

  const irSemanaSiguiente = () => {
    if (semanaIndice < SEMANAS.length - 1) setSemanaIndice(semanaIndice + 1);
  };

  return (
    <div className="detalle-tutor-page">
      <Header />

      <main className="detalle-tutor-container">
        {/* Breadcrumb */}
        <nav className="detalle-tutor__breadcrumb" aria-label="Ruta de navegación">
          <Link to="/tutores" className="detalle-tutor__breadcrumb-link">
            Directorio
          </Link>
          <span className="detalle-tutor__breadcrumb-separador">›</span>
          <span className="detalle-tutor__breadcrumb-actual">{nombreCompleto}</span>
        </nav>

        {/* Tarjeta 1: Perfil del tutor */}
        <section className="detalle-tutor__tarjeta-perfil">
          <div className="detalle-tutor__perfil-izq">
            <div className="detalle-tutor__avatar-grande" aria-hidden="true">
              {perfil.fotoUrl ? (
                <img src={perfil.fotoUrl} alt={nombreCompleto} />
              ) : null}
            </div>

            <div className="detalle-tutor__info-principal">
              <h1 className="detalle-tutor__nombre">{nombreCompleto}</h1>
              <p className="detalle-tutor__subtitulo">{subtituloCompleto}</p>
            </div>
          </div>

          <div className="detalle-tutor__perfil-der">
            <button
              type="button"
              className="detalle-tutor__btn-ver-resenas"
              onClick={() => alert(`Reseñas de ${nombreCompleto}: promedio ${promedio} con 28 opiniones.`)}
            >
              Ver reseñas
            </button>
          </div>
        </section>

        {/* Tarjeta 2: Disponibilidad semanal */}
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
                disabled={semanaIndice === 0}
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
                disabled={semanaIndice === SEMANAS.length - 1}
              >
                Semana siguiente ›
              </button>
            </div>
          </div>

          {/* ESTADO CON BLOQUES vs ESTADO SIN BLOQUES LIBRES */}
          {!semanaActual.tieneBloques ? (
            <div className="detalle-tutor__sin-bloques-caja">
              <div className="detalle-tutor__sin-bloques-icono" aria-hidden="true">
                —
              </div>
              <h3 className="detalle-tutor__sin-bloques-titulo">
                No hay bloques libres esta semana
              </h3>
              <p className="detalle-tutor__sin-bloques-mensaje">
                {primerNombre} registró una excepción del 21 al 26 de setiembre.
                Puedes revisar la semana siguiente o ver otros tutores de{" "}
                {primerCursoNombre}.
              </p>

              <div className="detalle-tutor__sin-bloques-acciones">
                <button
                  type="button"
                  className="detalle-tutor__btn-accion-primario"
                  onClick={() => setSemanaIndice(2)}
                >
                  Ver semana del 28/09/2026
                </button>
                <button
                  type="button"
                  className="detalle-tutor__btn-accion-secundario"
                  onClick={() => navigate("/tutores")}
                >
                  Ver 9 tutores de {primerCursoCodigo}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="detalle-tutor__grilla-wrapper">
                <table className="detalle-tutor__tabla">
                  <thead>
                    <tr>
                      <th className="detalle-tutor__th-hora"></th>
                      {semanaActual.dias.map((col) => (
                        <th key={col.clave} className="detalle-tutor__th-dia">
                          {col.diaSemana} {col.fechaNum}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {HORAS_FILAS.map((fila) => (
                      <tr key={fila.hora}>
                        <td className="detalle-tutor__td-hora">{fila.hora}</td>
                        {semanaActual.dias.map((col) => {
                          const celdaKey = `${col.clave}-${fila.hora}`;
                          const estado = ESTADOS_SEMANA_1[celdaKey];
                          const esElegido =
                            bloqueSeleccionado?.diaClave === col.clave &&
                            bloqueSeleccionado?.horaInicio === fila.hora;

                          if (esElegido) {
                            return (
                              <td key={col.clave} className="detalle-tutor__td-slot">
                                <div className="detalle-tutor__slot detalle-tutor__slot--elegido">
                                  Elegido
                                </div>
                              </td>
                            );
                          }

                          if (estado === "libre") {
                            return (
                              <td key={col.clave} className="detalle-tutor__td-slot">
                                <button
                                  type="button"
                                  className="detalle-tutor__slot detalle-tutor__slot--libre"
                                  onClick={() => handleSeleccionarBloque(col, fila)}
                                >
                                  Libre
                                </button>
                              </td>
                            );
                          }

                          if (estado === "ocupado") {
                            return (
                              <td key={col.clave} className="detalle-tutor__td-slot">
                                <div className="detalle-tutor__slot detalle-tutor__slot--ocupado">
                                  Ocupado
                                </div>
                              </td>
                            );
                          }

                          return (
                            <td key={col.clave} className="detalle-tutor__td-slot">
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
                    {bloqueSeleccionado.nombreDia} {bloqueSeleccionado.fecha},{" "}
                    {bloqueSeleccionado.horaInicio} a {bloqueSeleccionado.horaFin} ·
                    modalidad {modalidad}
                  </div>

                  <button
                    type="button"
                    className="detalle-tutor__btn-continuar"
                    onClick={() => setSolicitando(true)}
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

      {solicitando && (
        <ModalSolicitud
          tutor={tutor}
          bloque={{
            fecha: bloqueSeleccionado.fecha.split("/").reverse().join("-"),
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