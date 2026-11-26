// Funciones de reglas y cálculos: no dependen de React ni cambian los datos recibidos.
const ZONA_HORARIA = 'America/Lima';
const MILISEGUNDOS_POR_HORA = 60 * 60 * 1000;
const PLAZO_CIERRE_HORAS = 72;

const formatoFecha = new Intl.DateTimeFormat('es-PE', {
  dateStyle: 'medium',
  timeZone: ZONA_HORARIA,
});
const formatoHoras = new Intl.NumberFormat('es-PE', {
  maximumFractionDigits: 2,
});

export function fechaSesion(sesion, fin = false) {
  const hora = fin ? sesion.horaFin : sesion.horaInicio;

  // -05:00 indica la hora de Lima, aunque el equipo esté en otra zona horaria.
  return new Date(`${sesion.fecha}T${hora}:00-05:00`);
}

export function formatearFecha(fecha) {
  let valor = fecha;

  if (!(fecha instanceof Date)) {
    valor = new Date(`${fecha}T12:00:00-05:00`);
  }

  if (Number.isNaN(valor.getTime())) {
    return 'Fecha no disponible';
  }

  return formatoFecha.format(valor);
}

export function formatearFechaHora(fecha) {
  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    return 'Fecha no disponible';
  }

  const formatoFechaHora = new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: ZONA_HORARIA,
  });

  return formatoFechaHora.format(valor);
}

export function formatearHoras(minutos) {
  return formatoHoras.format(minutos / 60);
}

export function ventanaCierre(sesion, ahora = new Date()) {
  const fin = fechaSesion(sesion, true);
  const limite = new Date(fin.getTime() + PLAZO_CIERRE_HORAS * MILISEGUNDOS_POR_HORA);
  let motivo = '';

  if (Number.isNaN(fin.getTime())) {
    motivo = 'La sesión no tiene una fecha válida.';
  } else if (sesion.estado !== 'programada') {
    motivo = 'Esta sesión ya está cerrada o cancelada.';
  } else if (ahora < fin) {
    motivo = 'Podrás cerrar la sesión cuando termine el bloque horario.';
  } else if (ahora > limite) {
    motivo = 'Venció el plazo de 72 horas para cerrar esta sesión.';
  }

  return { habilitado: !motivo, motivo, limite };
}

export function validarCierre(datos, { borrador = false } = {}) {
  const errores = {};

  // El borrador puede estar incompleto. El cierre final exige ambas respuestas.
  if (!borrador) {
    if (typeof datos.asistenciaEstudiante !== 'boolean') {
      errores.asistenciaEstudiante = 'Indica si asistió el estudiante.';
    }

    if (typeof datos.asistenciaTutor !== 'boolean') {
      errores.asistenciaTutor = 'Indica si asististe como tutor.';
    }

    const ambosAsistieron = datos.asistenciaEstudiante === true && datos.asistenciaTutor === true;

    if (ambosAsistieron) {
      const minutos = Number(datos.duracionRealMin);
      const duracionValida = Number.isInteger(minutos)
        && minutos >= 15
        && minutos <= 240
        && minutos % 15 === 0;

      if (!duracionValida) {
        errores.duracionRealMin = 'Selecciona una duración de 15 a 240 minutos, en intervalos de 15.';
      }

      if (!String(datos.notas ?? '').trim()) {
        errores.notas = 'Describe lo trabajado durante la sesión.';
      }
    }
  }

  if (String(datos.notas ?? '').length > 3000) {
    errores.notas = 'Usa como máximo 3000 caracteres.';
  }

  if (String(datos.temasPendientes ?? '').length > 2000) {
    errores.temasPendientes = 'Usa como máximo 2000 caracteres.';
  }

  // Un objeto vacío significa que no encontramos errores en los campos.
  return errores;
}

export function validarMaterial(material) {
  const errores = {};

  if (!String(material.titulo ?? '').trim()) {
    errores.titulo = 'Escribe un título para el material.';
  } else if (material.titulo.length > 120) {
    errores.titulo = 'Usa como máximo 120 caracteres.';
  }

  if (String(material.descripcion ?? '').length > 500) {
    errores.descripcion = 'Usa como máximo 500 caracteres.';
  }

  try {
    const url = new URL(String(material.url ?? '').trim());
    const protocoloPermitido = ['http:', 'https:'].includes(url.protocol);
    const tieneCredenciales = url.username || url.password;

    if (!protocoloPermitido || !url.hostname || tieneCredenciales || material.url.length > 2048) {
      throw new Error('URL inválida');
    }
  } catch {
    errores.url = 'Ingresa un enlace válido que empiece con https:// o http://.';
  }

  return errores;
}

export function filtrarSesiones(sesiones, { curso = '', desde = '', hasta = '', estado = '' } = {}) {
  // filter devuelve otra lista. Un filtro vacío no restringe los resultados.
  return sesiones.filter(sesion => {
    const coincideCurso = !curso || sesion.curso.codigo === curso;
    const coincideDesde = !desde || sesion.fecha >= desde;
    const coincideHasta = !hasta || sesion.fecha <= hasta;
    const coincideEstado = !estado || sesion.estado === estado;

    return coincideCurso && coincideDesde && coincideHasta && coincideEstado;
  });
}

export function resumirHoras(sesiones) {
  const resumen = { minutos: 0, sesiones: 0, porCurso: [], porMes: [] };

  // Cada Map reúne los acumulados por una clave: código del curso o año-mes.
  const cursos = new Map();
  const meses = new Map();

  sesiones.forEach(sesion => {
    const minutos = Number(sesion.cierre?.duracionRealMin);
    const sumaHoras = sesion.estado === 'realizada'
      && sesion.cierre?.finalizado
      && Number.isFinite(minutos)
      && minutos > 0;

    if (!sumaHoras) {
      return;
    }

    resumen.minutos += minutos;
    resumen.sesiones += 1;

    let curso = cursos.get(sesion.curso.codigo);

    if (curso === undefined) {
      curso = { ...sesion.curso, minutos: 0, sesiones: 0 };
    }

    curso.minutos += minutos;
    curso.sesiones += 1;
    cursos.set(curso.codigo, curso);

    const mes = sesion.fecha.slice(0, 7);
    let grupoMensual = meses.get(mes);

    if (grupoMensual === undefined) {
      const formatoMes = new Intl.DateTimeFormat('es-PE', {
        month: 'long',
        year: 'numeric',
        timeZone: ZONA_HORARIA,
      });
      const etiqueta = formatoMes.format(new Date(`${mes}-01T12:00:00-05:00`));

      grupoMensual = { mes, etiqueta, minutos: 0, sesiones: 0 };
    }

    grupoMensual.minutos += minutos;
    grupoMensual.sesiones += 1;
    meses.set(mes, grupoMensual);
  });

  resumen.porCurso = [...cursos.values()].sort((primerCurso, segundoCurso) => {
    return segundoCurso.minutos - primerCurso.minutos;
  });
  resumen.porMes = [...meses.values()].sort((primerMes, segundoMes) => {
    return primerMes.mes.localeCompare(segundoMes.mes);
  });

  return resumen;
}
