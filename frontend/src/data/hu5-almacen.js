import semillaAnterior from './hu5-semilla.json' with { type: 'json' };
import sesionesBase from './sesiones.json' with { type: 'json' };
import tutores from './tutores.json' with { type: 'json' };
import estudiantes from './estudiantes.json' with { type: 'json' };

// HU-4 y HU-5 comparten esta copia. La clave anterior se conserva como respaldo.
export const CLAVE_ALMACEN = 'tutorias.sesiones.v2';
export const CLAVE_ALMACEN_ANTERIOR = 'tutorias.hu5.v1';
const FECHA_ANCLA = '2026-09-12';
const ESTADOS_VALIDOS = [
  'pendiente', 'horario-propuesto', 'programada', 'realizada',
  'no-asistio', 'cancelada', 'rechazada',
];

export const usuariosDemo = [...tutores, ...estudiantes].map(usuario => ({
  ...usuario,
  nombreCompleto: `${usuario.nombres} ${usuario.apellidos}`,
  nombreCorto: `${usuario.nombres.split(' ')[0]} ${usuario.apellidos.split(' ')[0]}`,
  iniciales: `${usuario.nombres[0]}${usuario.apellidos[0]}`.toUpperCase(),
  promedio: Number.isFinite(usuario.perfilTutor?.promedio) ? usuario.perfilTutor.promedio : null,
}));

function partesLima(fecha) {
  const formato = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  });
  const partes = {};

  for (const parte of formato.formatToParts(fecha)) {
    partes[parte.type] = parte.value;
  }

  return {
    fecha: `${partes.year}-${partes.month}-${partes.day}`,
    hora: `${partes.hour}:${partes.minute}`,
  };
}

function desplazarFecha(valor, diferencia) {
  if (!valor || typeof valor !== 'string') return valor;
  const fecha = new Date(`${valor.slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(fecha.getTime())) return valor;
  const nueva = new Date(fecha.getTime() + diferencia).toISOString().slice(0, 10);
  return nueva + valor.slice(10);
}

function completarSesion(sesion) {
  return {
    motivoRechazo: null,
    horarioAlternativo: null,
    canceladaPor: null,
    calificacion: null,
    enlaceSesion: null,
    trazabilidad: [],
    ...sesion,
  };
}

function crearCierreEjemplo(sesion) {
  const asistio = sesion.estado === 'realizada';
  const [horaInicio, minutoInicio] = sesion.horaInicio.split(':').map(Number);
  const [horaFin, minutoFin] = sesion.horaFin.split(':').map(Number);
  const minutos = horaFin * 60 + minutoFin - horaInicio * 60 - minutoInicio;

  return {
    sesionCodigo: sesion.codigo,
    asistenciaEstudiante: asistio,
    asistenciaTutor: true,
    duracionRealMin: asistio ? minutos : 0,
    notas: asistio ? `Trabajamos ${sesion.tema.toLowerCase()} con ejercicios guiados.` : '',
    temasPendientes: asistio ? 'Continuar con los ejercicios propuestos.' : '',
    finalizado: true,
    estadoFinal: sesion.estado,
    cerradoEn: `${sesion.fecha}T${sesion.horaFin}:00-05:00`,
    material: [],
  };
}

export function crearDatosDemo(ahora = new Date()) {
  // Solo se desplaza la semilla al crear una demo. Los datos guardados no cambian de fecha.
  const hoy = partesLima(ahora).fecha;
  const diferencia = Date.parse(`${hoy}T12:00:00Z`) - Date.parse(`${FECHA_ANCLA}T12:00:00Z`);
  const sesiones = sesionesBase.map(sesion => completarSesion({
    ...sesion,
    fecha: desplazarFecha(sesion.fecha, diferencia),
    horarioAlternativo: sesion.horarioAlternativo ? {
      ...sesion.horarioAlternativo,
      fecha: desplazarFecha(sesion.horarioAlternativo.fecha, diferencia),
    } : null,
    trazabilidad: sesion.trazabilidad.map(evento => ({
      ...evento,
      fecha: desplazarFecha(evento.fecha, diferencia),
    })),
  }));

  // Este ejemplo terminó hace media hora, para comprobar el cierre sin alterar el reloj.
  const inicio = partesLima(new Date(ahora.getTime() - 90 * 60000));
  const fin = partesLima(new Date(ahora.getTime() - 30 * 60000));
  const principal = sesiones.find(sesion => sesion.codigo === 'TU-2026-0184');
  Object.assign(principal, {
    fecha: inicio.fecha,
    horaInicio: inicio.fecha === fin.fecha ? inicio.hora : '22:00',
    horaFin: inicio.fecha === fin.fecha ? fin.hora : '23:00',
  });

  const cierres = {};
  for (const sesion of sesiones) {
    if (['realizada', 'no-asistio'].includes(sesion.estado)) {
      cierres[sesion.codigo] = crearCierreEjemplo(sesion);
    }
  }

  return { version: 2, sesiones, cierres };
}

function nombreNormalizado(usuario) {
  return `${usuario.nombres} ${usuario.apellidos}`
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

const equivalenciasUsuarios = new Map(semillaAnterior.usuarios.map(anterior => {
  const mismoUsuario = usuariosDemo.find(usuario => nombreNormalizado(usuario) === nombreNormalizado(anterior));
  return [anterior.id, mismoUsuario?.id ?? anterior.id];
}));

export function migrarDatosV1(datos, ahora = new Date()) {
  const nuevos = crearDatosDemo(ahora);
  // Los códigos antiguos pertenecen a sesiones ya usadas por el alumno: nunca se sustituyen.
  const codigosAnteriores = new Set([
    ...datos.sesiones.map(sesion => sesion.codigo),
    ...Object.keys(datos.cierres),
  ]);
  const sesionesConservadas = datos.sesiones.map(sesion => completarSesion({
    ...sesion,
    tutorId: equivalenciasUsuarios.get(sesion.tutorId) ?? sesion.tutorId,
    estudianteId: equivalenciasUsuarios.get(sesion.estudianteId) ?? sesion.estudianteId,
  }));
  const sesionesAgregadas = nuevos.sesiones.filter(sesion => !codigosAnteriores.has(sesion.codigo));
  const cierresAgregados = Object.fromEntries(Object.entries(nuevos.cierres)
    .filter(([codigo]) => !codigosAnteriores.has(codigo)));

  return {
    ...datos,
    version: 2,
    sesiones: [...sesionesConservadas, ...sesionesAgregadas],
    cierres: { ...cierresAgregados, ...datos.cierres },
  };
}

function esSesionValida(sesion) {
  if (!sesion || typeof sesion !== 'object') return false;
  const identificadores = ['codigo', 'tutorId', 'estudianteId']
    .every(campo => typeof sesion[campo] === 'string' && sesion[campo]);
  const horario = /^\d{4}-\d{2}-\d{2}$/.test(sesion.fecha)
    && /^([01]\d|2[0-3]):[0-5]\d$/.test(sesion.horaInicio)
    && /^([01]\d|2[0-3]):[0-5]\d$/.test(sesion.horaFin)
    && Number.isFinite(Date.parse(`${sesion.fecha}T${sesion.horaFin}:00-05:00`));

  return Boolean(identificadores && horario && ESTADOS_VALIDOS.includes(sesion.estado)
    && sesion.curso?.codigo && sesion.curso?.nombre);
}

function esCierreValido(cierre) {
  if (!cierre || !Array.isArray(cierre.material)) return false;
  const estadoValido = !cierre.finalizado || ['realizada', 'no-asistio'].includes(cierre.estadoFinal);
  const materialesValidos = cierre.material.every(material => material
    && typeof material.id === 'string'
    && typeof material.titulo === 'string'
    && typeof material.url === 'string');
  return estadoValido && materialesValidos;
}

export function sonDatosGuardadosValidos(datos, version = 2) {
  return Boolean(datos?.version === version
    && Array.isArray(datos.sesiones)
    && datos.cierres && typeof datos.cierres === 'object' && !Array.isArray(datos.cierres)
    && datos.sesiones.every(esSesionValida)
    && Object.values(datos.cierres).every(esCierreValido));
}

export function cargarDatosDemo(almacen, ahora = new Date()) {
  let almacenamiento = almacen;
  if (almacenamiento === undefined) {
    try {
      almacenamiento = globalThis.localStorage;
    } catch {
      // Algunos navegadores bloquean incluso el acceso a la propiedad localStorage.
    }
  }

  try {
    const guardados = JSON.parse(almacenamiento?.getItem(CLAVE_ALMACEN) ?? 'null');
    if (sonDatosGuardadosValidos(guardados)) return guardados;
  } catch {
    // Una clave dañada no impide intentar recuperar el respaldo anterior.
  }

  try {
    const anteriores = JSON.parse(almacenamiento?.getItem(CLAVE_ALMACEN_ANTERIOR) ?? 'null');
    if (sonDatosGuardadosValidos(anteriores, 1)) return migrarDatosV1(anteriores, ahora);
  } catch {
    // Si no se puede leer almacenamiento, la demo sigue funcionando en memoria.
  }

  return crearDatosDemo(ahora);
}
