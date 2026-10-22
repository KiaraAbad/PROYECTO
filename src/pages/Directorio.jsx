import { useMemo, useState } from "react";
import { useTutores } from "../hooks/useTutores";
import { Link, useSearchParams } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";
import TarjetaTutor from "../components/TarjetaTutor";
import FiltrosSidebar from "../components/FiltrosSidebar";
import FiltrosActivos from "../components/FiltrosActivos";
import Paginacion from "../components/Paginacion";
import EstadoVacio from "../components/EstadoVacio";
import EsqueletoCarga from "../components/EsqueletoCarga";
import EstrellasRating from "../components/EstrellasRating";
import "../styles/directorio.css";

const POR_PAGINA = 8;
const MINIMO_CALIFICACIONES_RANKING = 5;


const FILTROS_INICIALES = {
  carrera: "",
  curso: "MA101",
  modalidad: "remota",
  dia: "lunes",
};

const FILTROS_VACIOS = {
  carrera: "",
  curso: "",
  modalidad: "",
  dia: "",
};

const DIAS = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
];

function nombreCompleto(tutor) {
  return `${tutor.nombres ?? ""} ${tutor.apellidos ?? ""}`.trim();
}

function tieneDisponibilidadLibre(tutor, dia) {
  return (tutor.disponibilidad ?? []).some(
    (bloque) =>
      bloque.estado === "libre" &&
      bloque.tipo === "recurrente" &&
      (!dia || bloque.dia === dia)
  );
}

function obtenerProximaDisponibilidad(tutor) {
  const ahora = new Date();
  let proxima = Infinity;

  for (const bloque of tutor.disponibilidad ?? []) {
    if (bloque.estado !== "libre" || bloque.tipo !== "recurrente") {
      continue;
    }

    const indiceDia = DIAS.indexOf(bloque.dia);
    if (indiceDia === -1) continue;

    const fecha = new Date(ahora);
    const indiceHoy = (fecha.getDay() + 6) % 7;
    const diferencia = (indiceDia - indiceHoy + 7) % 7;

    fecha.setDate(fecha.getDate() + diferencia);

    const [hora, minuto] = (bloque.horaInicio || "08:00").split(":").map(Number);
    fecha.setHours(hora, minuto, 0, 0);

    if (fecha <= ahora) {
      fecha.setDate(fecha.getDate() + 7);
    }

    proxima = Math.min(proxima, fecha.getTime());
  }

  return proxima;
}

function Directorio() {
  const { tutores, cargando } = useTutores();
  const [searchParams, setSearchParams] = useSearchParams();

  const [seccionDirectorio, setSeccionDirectorio] = useState(() =>
    searchParams.get("vista") === "ranking" ? "ranking" : "todos"
  );
  const [cursoRanking, setCursoRanking] = useState("MA101");
  const [carreraRanking, setCarreraRanking] = useState("");
  const [orden, setOrden] = useState("promedio");
  const [filtrosBorrador, setFiltrosBorrador] = useState(FILTROS_INICIALES);
  const [filtrosAplicados, setFiltrosAplicados] = useState(FILTROS_INICIALES);
  const [pagina, setPagina] = useState(1);

  // Perfiles activos con rol tutor
  const tutoresActivos = useMemo(
    () =>
      tutores.filter(
        (tutor) =>
          tutor.rol?.includes("tutor") &&
          tutor.perfilTutor?.activo === true
      ),
    [tutores]
  );

  // Opciones dinámicas para los selectores
  const opciones = useMemo(() => {
    const carreras = new Set();
    const mapaCursos = new Map();
    const modalidades = new Set();
    const dias = new Set();

    tutoresActivos.forEach((tutor) => {
      if (tutor.carrera) carreras.add(tutor.carrera);

      if (tutor.perfilTutor?.modalidad) {
        modalidades.add(tutor.perfilTutor.modalidad);
      }

      (tutor.perfilTutor?.cursos ?? []).forEach((curso) => {
        if (curso.codigo && !mapaCursos.has(curso.codigo)) {
          mapaCursos.set(curso.codigo, {
            codigo: curso.codigo,
            nombre: curso.nombre || curso.codigo,
          });
        }
      });

      (tutor.disponibilidad ?? []).forEach((bloque) => {
        if (bloque.estado === "libre" && bloque.tipo === "recurrente") {
          dias.add(bloque.dia);
        }
      });
    });

    const ordenarTexto = (a, b) => a.localeCompare(b, "es");

    return {
      carreras: [...carreras].sort(ordenarTexto),
      cursos: [...mapaCursos.values()].sort((a, b) =>
        a.codigo.localeCompare(b.codigo, "es")
      ),
      modalidades: [...modalidades].sort(ordenarTexto),
      dias: DIAS.filter((dia) => dias.has(dia)),
    };
  }, [tutoresActivos]);

  const tutoresRanking = useMemo(
    () =>
      tutoresActivos
        .filter((tutor) => {
          const perfil = tutor.perfilTutor ?? {};
          const tieneCalificacionesSuficientes =
            Number(perfil.totalResenas ?? 0) >= MINIMO_CALIFICACIONES_RANKING;
          const coincideCurso =
            !cursoRanking ||
            (perfil.cursos ?? []).some((curso) => curso.codigo === cursoRanking);
          const coincideCarrera =
            !carreraRanking || tutor.carrera === carreraRanking;

          return (
            tieneCalificacionesSuficientes &&
            coincideCurso &&
            coincideCarrera
          );
        })
        .sort(
          (a, b) =>
            Number(b.perfilTutor?.promedio ?? 0) -
              Number(a.perfilTutor?.promedio ?? 0) ||
            nombreCompleto(a).localeCompare(nombreCompleto(b), "es")
        ),
    [tutoresActivos, cursoRanking, carreraRanking]
  );

  function cambiarSeccion(seccion) {
    setSeccionDirectorio(seccion);
    const nuevosParametros = new URLSearchParams(searchParams);
    if (seccion === "ranking") {
      nuevosParametros.set("vista", "ranking");
    } else {
      nuevosParametros.delete("vista");
    }
    setSearchParams(nuevosParametros, { replace: true });
  }

  // Filtrado y ordenamiento de tutores
  const tutoresFiltrados = useMemo(() => {
    const resultado = tutoresActivos.filter((tutor) => {
      const perfil = tutor.perfilTutor ?? {};
      const cursosTutor = perfil.cursos ?? [];

      const coincideCarrera =
        !filtrosAplicados.carrera ||
        tutor.carrera === filtrosAplicados.carrera;

      const coincideCurso =
        !filtrosAplicados.curso ||
        cursosTutor.some(
          (curso) =>
            curso.codigo === filtrosAplicados.curso ||
            curso.nombre === filtrosAplicados.curso
        );

      const coincideModalidad =
        !filtrosAplicados.modalidad ||
        perfil.modalidad === filtrosAplicados.modalidad ||
        (filtrosAplicados.modalidad === "remota" && perfil.modalidad === "ambas") ||
        (filtrosAplicados.modalidad === "presencial" && perfil.modalidad === "ambas");

      const coincideDia =
        !filtrosAplicados.dia ||
        tieneDisponibilidadLibre(tutor, filtrosAplicados.dia);

      return (
        coincideCarrera &&
        coincideCurso &&
        coincideModalidad &&
        coincideDia
      );
    });

    resultado.sort((a, b) => {
      if (orden === "promedio") {
        return (b.perfilTutor?.promedio ?? 0) - (a.perfilTutor?.promedio ?? 0);
      }

      if (orden === "cursos") {
        return (
          (b.perfilTutor?.cursos?.length ?? 0) -
          (a.perfilTutor?.cursos?.length ?? 0)
        );
      }

      if (orden === "disponibilidad") {
        return (
          obtenerProximaDisponibilidad(a) -
          obtenerProximaDisponibilidad(b)
        );
      }

      return nombreCompleto(a).localeCompare(nombreCompleto(b), "es");
    });

    return resultado;
  }, [tutoresActivos, filtrosAplicados, orden]);

  const totalPaginas = Math.ceil(tutoresFiltrados.length / POR_PAGINA);
  const paginaValida =
    totalPaginas > 0 ? Math.min(Math.max(1, pagina), totalPaginas) : 1;

  const tutoresPagina = useMemo(() => {
    const inicio = (paginaValida - 1) * POR_PAGINA;
    return tutoresFiltrados.slice(inicio, inicio + POR_PAGINA);
  }, [tutoresFiltrados, paginaValida]);

  function handleOrden(e) {
    setOrden(e.target.value);
    setPagina(1);
  }

  function aplicarFiltros() {
    setFiltrosAplicados({ ...filtrosBorrador });
    setPagina(1);
  }

  function limpiarTodo() {
    setFiltrosBorrador({ ...FILTROS_VACIOS });
    setFiltrosAplicados({ ...FILTROS_VACIOS });
    setPagina(1);
  }

  function quitarFiltro(campo) {
    const nuevosFiltros = {
      ...filtrosAplicados,
      [campo]: "",
    };

    setFiltrosAplicados(nuevosFiltros);
    setFiltrosBorrador(nuevosFiltros);
    setPagina(1);
  }

  // Subtítulo dinámico para el encabezado
  const subtituloResultados = useMemo(() => {
    const partes = [];
    if (filtrosAplicados.curso) {
      const cursoObj = opciones.cursos.find(
        (c) => c.codigo === filtrosAplicados.curso
      );
      partes.push(
        cursoObj
          ? `${cursoObj.codigo} ${cursoObj.nombre}`
          : filtrosAplicados.curso
      );
    }
    if (filtrosAplicados.carrera) {
      partes.push(`carrera ${filtrosAplicados.carrera}`);
    }
    if (filtrosAplicados.modalidad) {
      partes.push(`modalidad ${filtrosAplicados.modalidad}`);
    }
    if (filtrosAplicados.dia) {
      partes.push(filtrosAplicados.dia);
    }

    const total = tutoresFiltrados.length;
    const textoTutores = `${total} ${total === 1 ? "tutor encontrado" : "tutores encontrados"}`;

    if (partes.length === 0) {
      return `${textoTutores} en total`;
    }

    return `${textoTutores} para ${partes.join(", ")}`;
  }, [filtrosAplicados, tutoresFiltrados.length, opciones.cursos]);

  return (
    <div className="directorio-page-wrapper">
      <Header />

      <main className="directorio-layout">
        <nav className="directorio-secciones" aria-label="Secciones del directorio">
          <button
            type="button"
            className={`directorio-secciones__tab ${seccionDirectorio === "todos" ? "directorio-secciones__tab--activa" : ""}`}
            aria-current={seccionDirectorio === "todos" ? "page" : undefined}
            onClick={() => cambiarSeccion("todos")}
          >
            Todos los tutores
          </button>
          <button
            type="button"
            className={`directorio-secciones__tab ${seccionDirectorio === "ranking" ? "directorio-secciones__tab--activa" : ""}`}
            aria-current={seccionDirectorio === "ranking" ? "page" : undefined}
            onClick={() => cambiarSeccion("ranking")}
          >
            Ranking por curso
          </button>
        </nav>

        {seccionDirectorio === "todos" ? (
        <div className="directorio-layout__grid">
          {/* Barra lateral de filtros */}
          <aside className="directorio-layout__sidebar">
            <FiltrosSidebar
              filtros={filtrosBorrador}
              opciones={opciones}
              onChange={setFiltrosBorrador}
              onAplicar={aplicarFiltros}
              onLimpiar={limpiarTodo}
            />
          </aside>

          {/* Sección principal de resultados */}
          <section className="directorio-layout__principal" aria-label="Resultados de tutores">
            <div className="directorio-encabezado-seccion">
              <div className="directorio-encabezado-seccion__textos">
                <h1 className="directorio-encabezado-seccion__titulo">
                  Directorio de tutores
                </h1>
                <p className="directorio-encabezado-seccion__subtitulo">
                  {subtituloResultados}
                </p>
              </div>

              <div className="directorio-ordenar">
                <label
                  htmlFor="selector-orden"
                  className="directorio-ordenar__etiqueta"
                >
                  Ordenar:
                </label>
                <div className="directorio-ordenar__select-wrapper">
                  <select
                    id="selector-orden"
                    className="directorio-ordenar__select"
                    value={orden}
                    onChange={handleOrden}
                  >
                    <option value="promedio">mejor promedio</option>
                    <option value="nombre">nombre</option>
                    <option value="cursos">más cursos</option>
                    <option value="disponibilidad">disponibilidad próxima</option>
                  </select>
                  <span className="directorio-ordenar__flecha" aria-hidden="true">▾</span>
                </div>
              </div>
            </div>

            {/* Chips de filtros activos */}
            <FiltrosActivos
              filtros={filtrosAplicados}
              onQuitar={quitarFiltro}
              onLimpiar={limpiarTodo}
            />

            {cargando ? (
              <EsqueletoCarga cantidad={4} />
            ) : tutoresFiltrados.length === 0 ? (
              <EstadoVacio
                onQuitarFiltros={limpiarTodo}
                onVerTodos={limpiarTodo}
              />
            ) : (
              <>
                <div className="directorio-cards-grid">
                  {tutoresPagina.map((tutor) => (
                    <TarjetaTutor
                      key={tutor.id}
                      id={tutor.id}
                      nombre={nombreCompleto(tutor)}
                      carrera={tutor.carrera}
                      ciclo={tutor.ciclo}
                      cursos={tutor.perfilTutor?.cursos ?? []}
                      promedio={tutor.perfilTutor?.promedio ?? 4.5}
                      totalSesiones={tutor.perfilTutor?.totalResenas ?? 20}
                      modalidad={tutor.perfilTutor?.modalidad ?? "remota"}
                      fotoUrl={tutor.fotoUrl}
                    />
                  ))}
                </div>

                <Paginacion
                  pagina={paginaValida}
                  totalPaginas={totalPaginas}
                  totalResultados={tutoresActivos.length}
                  porPagina={POR_PAGINA}
                  onCambiar={setPagina}
                />
              </>
            )}
          </section>
        </div>
        ) : (
          <section className="directorio-ranking" aria-labelledby="titulo-ranking-directorio">
            <div className="directorio-ranking__encabezado">
              <div>
                <h1 id="titulo-ranking-directorio">Ranking de tutores</h1>
                <p>Ordenado por promedio recibido. Solo se listan tutores con 5 o más calificaciones.</p>
              </div>
              <div className="directorio-ranking__filtros">
                <label>
                  <span className="sr-only">Filtrar por curso</span>
                  <select
                    value={cursoRanking}
                    onChange={(event) => setCursoRanking(event.target.value)}
                  >
                    <option value="">Cursos: todos</option>
                    {opciones.cursos.map((curso) => (
                      <option key={curso.codigo} value={curso.codigo}>
                        {curso.codigo} {curso.nombre}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="sr-only">Filtrar por carrera</span>
                  <select
                    value={carreraRanking}
                    onChange={(event) => setCarreraRanking(event.target.value)}
                  >
                    <option value="">Carreras: todas</option>
                    {opciones.carreras.map((carrera) => (
                      <option key={carrera} value={carrera}>{carrera}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {cargando ? (
              <EsqueletoCarga cantidad={4} />
            ) : tutoresRanking.length > 0 ? (
              <ol className="directorio-ranking__lista">
                {tutoresRanking.map((tutor, index) => {
                  const perfil = tutor.perfilTutor ?? {};
                  const nombre = nombreCompleto(tutor);
                  const promedio = Number(perfil.promedio ?? 0);
                  const cursos = (perfil.cursos ?? [])
                    .map((curso) => curso.codigo)
                    .filter(Boolean)
                    .join(" · ");

                  return (
                    <li className="directorio-ranking__fila" key={tutor.id}>
                      <span className="directorio-ranking__puesto">{index + 1}</span>
                      <div className="directorio-ranking__avatar" aria-hidden="true">
                        {tutor.fotoUrl ? <img src={tutor.fotoUrl} alt="" /> : null}
                      </div>
                      <Link className="directorio-ranking__tutor" to={`/tutores/${tutor.id}`}>
                        <strong>{nombre}</strong>
                        <span>
                          {tutor.carrera} · {cursos} · {perfil.modalidad ?? "remota"}
                        </span>
                      </Link>
                      <EstrellasRating rating={Math.round(promedio)} readonly />
                      <strong className="directorio-ranking__promedio">{promedio.toFixed(1)}</strong>
                      <span className="directorio-ranking__total">
                        {perfil.totalResenas} calificaciones
                      </span>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="directorio-ranking__vacio">
                No hay tutores con 5 o más calificaciones para los filtros seleccionados.
              </p>
            )}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Directorio;
