import { buscarPersona } from "./personas";

export const ESTADOS = {
  PENDIENTE: "pendiente",
  PROPUESTO: "horario-propuesto",
  PROGRAMADA: "programada",
  REALIZADA: "realizada",
  NO_ASISTIO: "no-asistio",
  CANCELADA: "cancelada",
  RECHAZADA: "rechazada",
};

export const ETIQUETAS_ESTADO = {
  pendiente: "Pendiente",
  "horario-propuesto": "Horario propuesto",
  programada: "Programada",
  realizada: "Realizada",
  "no-asistio": "No asistió",
  cancelada: "Cancelada",
  rechazada: "Rechazada",
};

const ESTADOS_ACTIVOS = ["pendiente", "horario-propuesto", "programada"];

export const HORAS_LIMITE_CANCELACION = 12;
export const HORAS_RESPUESTA_TUTOR = 48;
export const HORAS_VENTANA_CIERRE = 72;

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const DIAS_CORTOS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export function aFecha(fecha, hora = "00:00") {
  // Los bloques del grupo se interpretan siempre en Lima, no en la zona del equipo.
  return new Date(`${fecha}T${hora}:00-05:00`);
}

export function aMinutos(hora) {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

export function sumarMinutos(hora, minutos) {
  const total = aMinutos(hora) + minutos;
  const h = String(Math.floor(total / 60)).padStart(2, "0");
  const m = String(total % 60).padStart(2, "0");
  return `${h}:${m}`;
}

export function formatearFecha(fecha) {
  const [anio, mes, dia] = fecha.split("-");
  return `${dia}/${mes}/${anio}`;
}

export function nombreDia(fecha) {
  return DIAS[aFecha(fecha).getUTCDay()];
}

export function formatearFechaLarga(fecha) {
  return `${nombreDia(fecha)} ${formatearFecha(fecha)}`;
}

export function formatearFechaCorta(fecha) {
  return `${DIAS_CORTOS[aFecha(fecha).getUTCDay()]} ${formatearFecha(fecha)}`;
}

export function abreviarCarrera(carrera) {
  return carrera.replace(/^Ingeniería\b/, "Ing.");
}

export function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function formatearFechaHora(fechaHora) {
  const partes = {};
  const formato = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  });
  for (const parte of formato.formatToParts(fechaRegistro(fechaHora))) {
    partes[parte.type] = parte.value;
  }
  return `${partes.day}/${partes.month}/${partes.year} · ${partes.hour}:${partes.minute}`;
}

function fechaRegistro(fechaHora) {
  // La semilla antigua no traía zona; los registros nuevos sí usan ISO UTC.
  const tieneZona = /(?:Z|[+-]\d{2}:\d{2})$/i.test(fechaHora);
  return new Date(tieneZona ? fechaHora : `${fechaHora}-05:00`);
}

function horasEntre(desde, hasta) {
  return (hasta.getTime() - desde.getTime()) / 3600000;
}

export function hace(fechaHora, referencia = new Date()) {
  const horas = horasEntre(fechaRegistro(fechaHora), referencia);
  if (horas < 1) return "hace menos de 1 hora";
  if (horas < 24) {
    const n = Math.floor(horas);
    return `hace ${n} ${n === 1 ? "hora" : "horas"}`;
  }
  const dias = Math.floor(horas / 24);
  return `hace ${dias} ${dias === 1 ? "día" : "días"}`;
}

export function fechaSolicitud(sesion) {
  return sesion.trazabilidad?.[0]?.fecha ?? `${sesion.fecha}T${sesion.horaInicio}:00-05:00`;
}

export function horasDesdeSolicitud(sesion, referencia = new Date()) {
  return horasEntre(fechaRegistro(fechaSolicitud(sesion)), referencia);
}

export function horasHastaInicio(sesion, referencia = new Date()) {
  return horasEntre(referencia, aFecha(sesion.fecha, sesion.horaInicio));
}

export function esActiva(sesion) {
  return ESTADOS_ACTIVOS.includes(sesion.estado);
}

function claveOrden(sesion) {
  return `${sesion.fecha}T${sesion.horaInicio}`;
}

export function separarProximasHistorial(sesiones) {
  const proximas = sesiones
    .filter(esActiva)
    .sort((a, b) => claveOrden(a).localeCompare(claveOrden(b)));
  const historial = sesiones
    .filter((sesion) => !esActiva(sesion))
    .sort((a, b) => claveOrden(b).localeCompare(claveOrden(a)));
  return { proximas, historial };
}

export function filtrarSesiones(sesiones, { estado = "", desde = "", hasta = "" }) {
  return sesiones.filter(
    (sesion) =>
      (!estado || sesion.estado === estado) &&
      (!desde || sesion.fecha >= desde) &&
      (!hasta || sesion.fecha <= hasta)
  );
}

export function contarSolicitudes(sesionesDelTutor) {
  const contar = (estados) =>
    sesionesDelTutor.filter((sesion) => estados.includes(sesion.estado)).length;
  return {
    pendientes: contar(["pendiente", "horario-propuesto"]),
    aceptadas: contar(["programada"]),
    rechazadas: contar(["rechazada"]),
  };
}

export function solicitudesPendientes(sesionesDelTutor) {
  return sesionesDelTutor
    .filter((sesion) => ["pendiente", "horario-propuesto"].includes(sesion.estado))
    .sort((a, b) => fechaSolicitud(a).localeCompare(fechaSolicitud(b)));
}

function huboCruce(a, b) {
  return (
    a.fecha === b.fecha &&
    aMinutos(a.horaInicio) < aMinutos(b.horaFin) &&
    aMinutos(b.horaInicio) < aMinutos(a.horaFin)
  );
}

function cruceDeUsuario(sesiones, usuarioId, bloque, estados, excluirCodigo) {
  return (
    sesiones.find(
      (sesion) =>
        sesion.codigo !== excluirCodigo &&
        estados.includes(sesion.estado) &&
        (sesion.tutorId === usuarioId || sesion.estudianteId === usuarioId) &&
        huboCruce(sesion, bloque)
    ) || null
  );
}

export function buscarSolapamiento(
  sesiones,
  bloque,
  { tutorId, estudianteId, excluirCodigo = null, incluirPendientes = false }
) {
  const estadosEstudiante = incluirPendientes ? ["programada", "pendiente"] : ["programada"];

  const delEstudiante = cruceDeUsuario(sesiones, estudianteId, bloque, estadosEstudiante, excluirCodigo);
  if (delEstudiante) return { tipo: "estudiante", usuarioId: estudianteId, sesion: delEstudiante };

  const delTutor = cruceDeUsuario(sesiones, tutorId, bloque, ["programada"], excluirCodigo);
  if (delTutor) return { tipo: "tutor", usuarioId: tutorId, sesion: delTutor };

  return null;
}

function describirSesion(sesion, usuarioId) {
  const otroId = sesion.tutorId === usuarioId ? sesion.estudianteId : sesion.tutorId;
  const otro = buscarPersona(otroId);
  return `el ${formatearFechaLarga(sesion.fecha)} de ${sesion.horaInicio} a ${sesion.horaFin} con ${otro.nombreCompleto} (${sesion.curso.codigo})`;
}

export function mensajeSolapamiento(cruce, rolActor, sufijo) {
  const { tipo, usuarioId, sesion } = cruce;
  if (tipo === rolActor) {
    const que = sesion.estado === ESTADOS.PENDIENTE ? "una solicitud pendiente" : "una sesión programada";
    return `Ya tienes ${que} ${describirSesion(sesion, usuarioId)}. ${sufijo}`;
  }
  if (rolActor === "estudiante") {
    return "Este bloque ya no está disponible: el tutor tiene otra sesión programada en ese horario. Elige otro bloque.";
  }
  return `El estudiante ya tiene una sesión programada ${describirSesion(sesion, usuarioId)}. ${sufijo}`;
}

export function evaluarCancelacion(sesion, referencia = new Date()) {
  if (!esActiva(sesion)) return { permitido: false, motivo: "La sesión ya no está activa." };
  if (!Number.isFinite(aFecha(sesion.fecha, sesion.horaInicio).getTime())) {
    return { permitido: false, motivo: "La sesión no tiene un horario válido." };
  }
  if (sesion.estado === ESTADOS.PROGRAMADA && horasHastaInicio(sesion, referencia) < HORAS_LIMITE_CANCELACION) {
    return {
      permitido: false,
      motivo: `Solo se puede cancelar hasta ${HORAS_LIMITE_CANCELACION} horas antes del inicio.`,
    };
  }
  return { permitido: true, motivo: null };
}

export function evaluarCierre(sesion, referencia = new Date()) {
  const fin = aFecha(sesion.fecha, sesion.horaFin);
  if (sesion.estado !== ESTADOS.PROGRAMADA) {
    return { permitido: false, motivo: "Solo se cierran las sesiones programadas." };
  }
  if (!Number.isFinite(fin.getTime()) || !Number.isFinite(referencia.getTime())) {
    return { permitido: false, motivo: "La sesión no tiene un horario válido." };
  }
  if (referencia < fin) return { permitido: false, motivo: "El cierre se habilita al terminar el bloque." };
  if (referencia > new Date(fin.getTime() + HORAS_VENTANA_CIERRE * 3600000)) {
    return { permitido: false, motivo: "El plazo de 72 horas para cerrar la sesión venció." };
  }
  return { permitido: true, motivo: null };
}

export function generarCodigo(sesiones) {
  const mayor = sesiones.reduce((max, sesion) => Math.max(max, Number(sesion.codigo.split("-")[2])), 0);
  return `TU-2026-${String(mayor + 1).padStart(4, "0")}`;
}

function falla(codigo, mensaje, campos = {}) {
  return { ok: false, error: { codigo, mensaje, campos } };
}

function exito(sesiones, sesion) {
  return { ok: true, sesiones, sesion };
}

function conEventos(sesion, cambios, eventos) {
  const iso = new Date().toISOString();
  const nuevos = eventos.map(([texto, actorId, detalle]) => {
    const registro = {
      fecha: iso,
      evento: texto,
      actor: actorId === "sistema" ? "sistema" : buscarPersona(actorId).nombreCorto,
    };
    if (detalle) registro.detalle = detalle;
    return registro;
  });
  return { ...sesion, ...cambios, trazabilidad: [...(sesion.trazabilidad ?? []), ...nuevos] };
}

function reemplazar(sesiones, codigo, nueva) {
  return sesiones.map((sesion) => (sesion.codigo === codigo ? nueva : sesion));
}

function rolEn(sesion, actorId) {
  if (sesion.tutorId === actorId) return "tutor";
  if (sesion.estudianteId === actorId) return "estudiante";
  return null;
}

function programar(sesion) {
  const enlace =
    sesion.modalidad === "remota" && !sesion.enlaceSesion
      ? `meet.ulima.edu.pe/tu-${sesion.codigo.split("-")[2]}`
      : sesion.enlaceSesion;
  return { estado: ESTADOS.PROGRAMADA, enlaceSesion: enlace };
}

function bloqueVigente(bloque) {
  return aFecha(bloque.fecha, bloque.horaInicio) > new Date();
}

export function crearSolicitud(sesiones, datos, estudianteId) {
  const campos = {};
  if (!datos.curso || !datos.curso.codigo) campos.curso = "Selecciona el curso.";
  if ((datos.tema || "").trim().length < 10) campos.tema = "Describe el tema en al menos 10 caracteres.";
  if ((datos.tema || "").trim().length > 200) campos.tema = "El tema admite máximo 200 caracteres.";
  if (!["presencial", "remota"].includes(datos.modalidad)) campos.modalidad = "Selecciona la modalidad.";
  if (Object.keys(campos).length > 0) return falla("VALIDACION", "Revisa los datos ingresados.", campos);

  if (!bloqueVigente(datos)) return falla("BLOQUE_VENCIDO", "Elige un horario posterior al momento actual.");
  if (datos.tutorId === estudianteId) return falla("VALIDACION", "No puedes solicitar una sesión contigo mismo.");

  const cruce = buscarSolapamiento(sesiones, datos, {
    tutorId: datos.tutorId,
    estudianteId,
    incluirPendientes: true,
  });
  if (cruce) {
    return falla(
      cruce.tipo === "tutor" ? "SOLAPAMIENTO_TUTOR" : "SOLAPAMIENTO_ESTUDIANTE",
      mensajeSolapamiento(cruce, "estudiante", "Elige otro bloque o cancela la sesión anterior.")
    );
  }

  const base = {
    codigo: generarCodigo(sesiones),
    tutorId: datos.tutorId,
    estudianteId,
    curso: { codigo: datos.curso.codigo, nombre: datos.curso.nombre },
    tema: datos.tema.trim(),
    fecha: datos.fecha,
    horaInicio: datos.horaInicio,
    horaFin: datos.horaFin,
    modalidad: datos.modalidad,
    enlaceSesion: null,
    estado: ESTADOS.PENDIENTE,
    motivoRechazo: null,
    horarioAlternativo: null,
    canceladaPor: null,
    trazabilidad: [],
  };
  const nueva = conEventos(base, {}, [["Solicitud enviada", estudianteId]]);
  return exito([...sesiones, nueva], nueva);
}

export function aceptarSolicitud(sesiones, codigo, actorId) {
  const sesion = sesiones.find((item) => item.codigo === codigo);
  if (!sesion) return falla("NO_ENCONTRADA", "No encontramos la sesión indicada.");
  if (rolEn(sesion, actorId) !== "tutor") return falla("SIN_PERMISO", "Solo el tutor puede aceptar la solicitud.");
  if (sesion.estado !== ESTADOS.PENDIENTE) return falla("TRANSICION_INVALIDA", "Solo se pueden aceptar solicitudes pendientes.");
  if (!bloqueVigente(sesion)) return falla("BLOQUE_VENCIDO", "El bloque solicitado ya pasó. Rechaza la solicitud o propón otro horario.");

  const cruce = buscarSolapamiento(sesiones, sesion, {
    tutorId: sesion.tutorId,
    estudianteId: sesion.estudianteId,
    excluirCodigo: codigo,
  });
  if (cruce) {
    return falla(
      cruce.tipo === "tutor" ? "SOLAPAMIENTO_TUTOR" : "SOLAPAMIENTO_ESTUDIANTE",
      mensajeSolapamiento(cruce, "tutor", "Rechaza la solicitud o propón otro horario.")
    );
  }

  const nueva = conEventos(sesion, programar(sesion), [
    ["Solicitud aceptada", actorId],
    ["Sesión programada", "sistema"],
  ]);
  return exito(reemplazar(sesiones, codigo, nueva), nueva);
}

export function rechazarSolicitud(sesiones, codigo, motivo, actorId) {
  const sesion = sesiones.find((item) => item.codigo === codigo);
  if (!sesion) return falla("NO_ENCONTRADA", "No encontramos la sesión indicada.");
  if (rolEn(sesion, actorId) !== "tutor") return falla("SIN_PERMISO", "Solo el tutor puede rechazar la solicitud.");
  if (sesion.estado !== ESTADOS.PENDIENTE) return falla("TRANSICION_INVALIDA", "Solo se pueden rechazar solicitudes pendientes.");

  const texto = (motivo || "").trim();
  if (texto.length < 10 || texto.length > 200) {
    return falla("VALIDACION", "Revisa los datos ingresados.", {
      motivo: "Indica el motivo del rechazo (entre 10 y 200 caracteres).",
    });
  }

  const nueva = conEventos(sesion, { estado: ESTADOS.RECHAZADA, motivoRechazo: texto }, [
    ["Solicitud rechazada", actorId, texto],
  ]);
  return exito(reemplazar(sesiones, codigo, nueva), nueva);
}

export function proponerHorario(sesiones, codigo, horario, mensaje, actorId) {
  const sesion = sesiones.find((item) => item.codigo === codigo);
  if (!sesion) return falla("NO_ENCONTRADA", "No encontramos la sesión indicada.");
  const rol = rolEn(sesion, actorId);
  if (!rol) return falla("SIN_PERMISO", "No tienes permiso sobre esta sesión.");

  const permitidos = rol === "tutor" ? [ESTADOS.PENDIENTE, ESTADOS.PROGRAMADA] : [ESTADOS.PROGRAMADA];
  if (!permitidos.includes(sesion.estado)) {
    return falla("TRANSICION_INVALIDA", "No se puede proponer un nuevo horario en el estado actual de la sesión.");
  }
  if (sesion.estado === ESTADOS.PROGRAMADA && !evaluarCancelacion(sesion).permitido) {
    return falla("FUERA_DE_VENTANA", `Solo se puede reprogramar hasta ${HORAS_LIMITE_CANCELACION} horas antes del inicio.`);
  }
  if (!horario || !horario.fecha || !horario.horaInicio) {
    return falla("VALIDACION", "Elige un bloque de reemplazo.", { bloque: "Elige un bloque de reemplazo." });
  }
  if (!bloqueVigente(horario)) return falla("BLOQUE_VENCIDO", "Elige un horario posterior al momento actual.");

  const cruce = buscarSolapamiento(sesiones, horario, {
    tutorId: sesion.tutorId,
    estudianteId: sesion.estudianteId,
    excluirCodigo: codigo,
  });
  if (cruce) {
    return falla(
      cruce.tipo === "tutor" ? "SOLAPAMIENTO_TUTOR" : "SOLAPAMIENTO_ESTUDIANTE",
      mensajeSolapamiento(cruce, rol, "Elige otro bloque o cancela la sesión anterior.")
    );
  }

  const alternativo = {
    fecha: horario.fecha,
    horaInicio: horario.horaInicio,
    horaFin: horario.horaFin,
    propuestoPor: rol,
    estadoPrevio: sesion.estado,
    mensaje: (mensaje || "").trim(),
  };
  const nueva = conEventos(sesion, { estado: ESTADOS.PROPUESTO, horarioAlternativo: alternativo }, [
    [
      "Horario alternativo propuesto",
      actorId,
      `Propone ${formatearFechaLarga(horario.fecha)}, ${horario.horaInicio} a ${horario.horaFin}`,
    ],
  ]);
  return exito(reemplazar(sesiones, codigo, nueva), nueva);
}

function validarRespuestaPropuesta(sesiones, codigo, actorId) {
  const sesion = sesiones.find((item) => item.codigo === codigo);
  if (!sesion) return { error: falla("NO_ENCONTRADA", "No encontramos la sesión indicada.") };
  const rol = rolEn(sesion, actorId);
  if (!rol) return { error: falla("SIN_PERMISO", "No tienes permiso sobre esta sesión.") };
  if (sesion.estado !== ESTADOS.PROPUESTO) {
    return { error: falla("TRANSICION_INVALIDA", "No hay una propuesta de horario pendiente de respuesta.") };
  }
  if (sesion.horarioAlternativo.propuestoPor === rol) {
    return { error: falla("SIN_PERMISO", "No puedes responder tu propia propuesta.") };
  }
  return { sesion, rol };
}

export function aceptarPropuesta(sesiones, codigo, actorId) {
  const { sesion, rol, error } = validarRespuestaPropuesta(sesiones, codigo, actorId);
  if (error) return error;

  const propuesta = sesion.horarioAlternativo;
  if (!bloqueVigente(propuesta)) return falla("BLOQUE_VENCIDO", "El horario propuesto ya pasó. Cancela la sesión o pide otra propuesta.");

  const cruce = buscarSolapamiento(sesiones, propuesta, {
    tutorId: sesion.tutorId,
    estudianteId: sesion.estudianteId,
    excluirCodigo: codigo,
  });
  if (cruce) {
    return falla(
      cruce.tipo === "tutor" ? "SOLAPAMIENTO_TUTOR" : "SOLAPAMIENTO_ESTUDIANTE",
      mensajeSolapamiento(cruce, rol, "Rechaza la propuesta o cancela la sesión anterior.")
    );
  }

  const nueva = conEventos(
    sesion,
    {
      fecha: propuesta.fecha,
      horaInicio: propuesta.horaInicio,
      horaFin: propuesta.horaFin,
      horarioAlternativo: null,
      ...programar(sesion),
    },
    [
      ["Propuesta aceptada", actorId],
      ["Sesión programada", "sistema"],
    ]
  );
  return exito(reemplazar(sesiones, codigo, nueva), nueva);
}

export function rechazarPropuesta(sesiones, codigo, actorId) {
  const { sesion, rol, error } = validarRespuestaPropuesta(sesiones, codigo, actorId);
  if (error) return error;

  if (sesion.horarioAlternativo.estadoPrevio === ESTADOS.PROGRAMADA) {
    const nueva = conEventos(sesion, { estado: ESTADOS.PROGRAMADA, horarioAlternativo: null }, [
      ["Propuesta rechazada", actorId, "La sesión mantiene su horario original."],
    ]);
    return exito(reemplazar(sesiones, codigo, nueva), nueva);
  }

  const nueva = conEventos(sesion, { estado: ESTADOS.CANCELADA, canceladaPor: rol, horarioAlternativo: null }, [
    ["Propuesta rechazada", actorId],
    ["Solicitud cancelada", "sistema"],
  ]);
  return exito(reemplazar(sesiones, codigo, nueva), nueva);
}

export function cancelarSesion(sesiones, codigo, actorId) {
  const sesion = sesiones.find((item) => item.codigo === codigo);
  if (!sesion) return falla("NO_ENCONTRADA", "No encontramos la sesión indicada.");
  const rol = rolEn(sesion, actorId);
  if (!rol) return falla("SIN_PERMISO", "No tienes permiso sobre esta sesión.");
  if (!esActiva(sesion)) return falla("TRANSICION_INVALIDA", "La sesión ya no se puede cancelar.");
  if (rol === "tutor" && sesion.estado === ESTADOS.PENDIENTE) {
    return falla("TRANSICION_INVALIDA", "Responde la solicitud: acéptala, recházala con motivo o propón otro horario.");
  }
  const evaluacion = evaluarCancelacion(sesion);
  if (!evaluacion.permitido) return falla("FUERA_DE_VENTANA", evaluacion.motivo);

  const nueva = conEventos(sesion, { estado: ESTADOS.CANCELADA, canceladaPor: rol, horarioAlternativo: null }, [
    ["Sesión cancelada", actorId, `Cancelada por el ${rol}`],
  ]);
  return exito(reemplazar(sesiones, codigo, nueva), nueva);
}
