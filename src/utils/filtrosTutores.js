import { normalizarTexto } from "./texto";

export const filtrosIniciales = {
  busqueda: "",
  curso: "",
  carrera: "",
  modalidad: "",
  dia: "",
};

const DIAS = [
  "domingo",
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
];

const FECHA_BASE = new Date(2026, 9, 19);

function fechaLocal(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function minutos(hora) {
  const [horas, minutos] = hora.split(":").map(Number);
  return horas * 60 + minutos;
}

function seSolapan(inicioA, finA, inicioB, finB) {
  return minutos(inicioA) < minutos(finB) &&
    minutos(inicioB) < minutos(finA);
}

function obtenerBloqueDelDia(tutor, fecha, inicio, fin) {
  const dia = DIAS[fecha.getDay()];
  const fechaTexto = fechaLocal(fecha);
  const bloques = tutor.disponibilidad ?? [];

  const excepciones = bloques.filter(
    (bloque) =>
      bloque.tipo === "excepcion" &&
      bloque.fecha === fechaTexto &&
      seSolapan(
        inicio,
        fin,
        bloque.horaInicio,
        bloque.horaFin
      )
  );

  if (excepciones.length > 0) {
    return excepciones.some((bloque) => bloque.estado === "libre")
      ? "libre"
      : "no-disponible";
  }

  const recurrentes = bloques.filter(
    (bloque) =>
      bloque.tipo === "recurrente" &&
      bloque.dia === dia &&
      seSolapan(
        inicio,
        fin,
        bloque.horaInicio,
        bloque.horaFin
      )
  );

  if (recurrentes.some((bloque) => bloque.estado !== "libre")) {
    return "no-disponible";
  }

  return recurrentes.some((bloque) => bloque.estado === "libre")
    ? "libre"
    : "sin-horario";
}

export function tieneDisponibilidadEnDia(tutor, dia) {
  const fecha = new Date(FECHA_BASE);

  for (let i = 0; i < 30; i += 1) {
    const fechaEvaluada = new Date(fecha);
    fechaEvaluada.setDate(fecha.getDate() + i);

    if (DIAS[fechaEvaluada.getDay()] !== dia) {
      continue;
    }

    const bloques = (tutor.disponibilidad ?? []).filter(
      (bloque) =>
        bloque.tipo === "recurrente" &&
        bloque.dia === dia &&
        bloque.estado === "libre"
    );

    for (const bloque of bloques) {
      if (
        obtenerBloqueDelDia(
          tutor,
          fechaEvaluada,
          bloque.horaInicio,
          bloque.horaFin
        ) === "libre"
      ) {
        return true;
      }
    }
  }

  return false;
}

export function obtenerProximaDisponibilidad(tutor) {
  const fechaInicial = new Date(FECHA_BASE);
  const bloquesRecurrentes = (tutor.disponibilidad ?? []).filter(
    (bloque) =>
      bloque.tipo === "recurrente" &&
      bloque.estado === "libre"
  );

  let proxima = Infinity;

  for (let i = 0; i < 30; i += 1) {
    const fecha = new Date(fechaInicial);
    fecha.setDate(fechaInicial.getDate() + i);

    const dia = DIAS[fecha.getDay()];

    for (const bloque of bloquesRecurrentes) {
      if (bloque.dia !== dia) {
        continue;
      }

      if (
        obtenerBloqueDelDia(
          tutor,
          fecha,
          bloque.horaInicio,
          bloque.horaFin
        ) !== "libre"
      ) {
        continue;
      }

      const instante =
        fecha.getTime() + minutos(bloque.horaInicio) * 60 * 1000;

      if (instante < proxima) {
        proxima = instante;
      }
    }
  }

  return proxima;
}

export function filtrarTutores(tutores, filtros) {
  const consulta = normalizarTexto(filtros.busqueda ?? "");

  return tutores.filter((tutor) => {
    const perfil = tutor.perfilTutor;

    if (!perfil?.activo || !tutor.rol?.includes("tutor")) {
      return false;
    }

    const cursos = perfil.cursos ?? [];

    const textoTutor = normalizarTexto(
      [
        tutor.nombres,
        tutor.apellidos,
        tutor.carrera,
        tutor.correo,
        ...cursos.flatMap((curso) => [
          curso.nombre,
          curso.codigo,
        ]),
      ]
        .filter(Boolean)
        .join(" ")
    );

    if (consulta && !textoTutor.includes(consulta)) {
      return false;
    }

    if (
      filtros.curso &&
      !cursos.some((curso) => curso.codigo === filtros.curso)
    ) {
      return false;
    }

    if (filtros.carrera && tutor.carrera !== filtros.carrera) {
      return false;
    }

    if (
      filtros.modalidad &&
      filtros.modalidad !== "ambas" &&
      perfil.modalidad !== filtros.modalidad &&
      perfil.modalidad !== "ambas"
    ) {
      return false;
    }

    if (
      filtros.dia &&
      !tieneDisponibilidadEnDia(tutor, filtros.dia)
    ) {
      return false;
    }

    return true;
  });
}

export function ordenarTutores(tutores, criterio) {
  const resultado = [...tutores];

  switch (criterio) {
    case "nombre":
      return resultado.sort((a, b) =>
        `${a.apellidos} ${a.nombres}`.localeCompare(
          `${b.apellidos} ${b.nombres}`,
          "es",
          { sensitivity: "base" }
        )
      );

    case "cursos":
      return resultado.sort(
        (a, b) =>
          (b.perfilTutor?.cursos?.length ?? 0) -
          (a.perfilTutor?.cursos?.length ?? 0)
      );

    case "promedio":
      return resultado.sort(
        (a, b) =>
          (b.perfilTutor?.promedio ?? 0) -
          (a.perfilTutor?.promedio ?? 0)
      );

    case "proximidad":
      return resultado.sort(
        (a, b) =>
          obtenerProximaDisponibilidad(a) -
          obtenerProximaDisponibilidad(b)
      );

    default:
      return resultado;
  }
}

export function obtenerOpcionesFiltros(tutores) {
  const activos = tutores.filter(
    (tutor) =>
      tutor.perfilTutor?.activo &&
      tutor.rol?.includes("tutor")
  );

  const cursosMap = new Map();

  activos.forEach((tutor) => {
    (tutor.perfilTutor.cursos ?? []).forEach((curso) => {
      cursosMap.set(curso.codigo, {
        codigo: curso.codigo,
        nombre: curso.nombre,
      });
    });
  });

  return {
    cursos: [...cursosMap.values()].sort((a, b) =>
      a.nombre.localeCompare(b.nombre, "es")
    ),
    carreras: [
      ...new Set(activos.map((tutor) => tutor.carrera).filter(Boolean)),
    ].sort((a, b) => a.localeCompare(b, "es")),
  };
}
