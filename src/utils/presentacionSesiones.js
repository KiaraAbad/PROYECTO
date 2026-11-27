// Formatos de las pantallas: las fechas y horas siempre se muestran en Lima.
const ZONA_HORARIA = 'America/Lima';

function convertirFecha(valor) {
  if (!valor) return null;
  const texto = typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor)
    ? `${valor}T12:00:00-05:00`
    : valor;
  const fecha = new Date(texto);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

export function fechaCorta(valor) {
  const fecha = convertirFecha(valor);
  if (!fecha) return 'Fecha no disponible';
  return new Intl.DateTimeFormat('es-PE', {
    timeZone: ZONA_HORARIA, day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(fecha);
}

export function fechaHoraCorta(valor) {
  const fecha = convertirFecha(valor);
  if (!fecha) return 'Fecha no disponible';
  const hora = new Intl.DateTimeFormat('es-PE', {
    timeZone: ZONA_HORARIA, hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).format(fecha);
  return `${fechaCorta(fecha)} a las ${hora}`;
}

export function mesCorto(codigoMes) {
  const fecha = convertirFecha(`${codigoMes}-15`);
  if (!fecha) return 'Mes no disponible';
  const nombre = new Intl.DateTimeFormat('es', {
    timeZone: ZONA_HORARIA, month: 'long',
  }).format(fecha);
  return nombre[0].toUpperCase() + nombre.slice(1);
}

// El gráfico cuenta cierres; las horas se siguen calculando por separado.
// Una inasistencia cuenta como cierre, pero nunca suma horas realizadas.
export function resumirCierresPorMes(sesiones) {
  const meses = new Map();
  for (const sesion of sesiones) {
    const estaCerrada = sesion.cierre?.finalizado
      && ['realizada', 'no-asistio'].includes(sesion.estado);
    if (!estaCerrada) continue;
    const mes = sesion.fecha.slice(0, 7);
    meses.set(mes, (meses.get(mes) ?? 0) + 1);
  }
  return Array.from(meses, ([mes, cantidad]) => ({ mes, cantidad }))
    .sort((primero, segundo) => primero.mes.localeCompare(segundo.mes));
}
