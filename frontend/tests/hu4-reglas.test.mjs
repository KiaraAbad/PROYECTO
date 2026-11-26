import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Solo resolvemos los imports JSON y la extensión que Vite resuelve en la app.
// Las funciones probadas son las mismas del archivo original, sin dependencias nuevas.
const datosTutores = await readFile(new URL('../src/data/tutores.json', import.meta.url), 'utf8');
const datosEstudiantes = await readFile(new URL('../src/data/estudiantes.json', import.meta.url), 'utf8');
const personas = (await readFile(new URL('../src/utils/personas.js', import.meta.url), 'utf8'))
  .replace('import datosTutores from "../data/tutores.json";', `const datosTutores = ${datosTutores};`)
  .replace('import datosEstudiantes from "../data/estudiantes.json";', `const datosEstudiantes = ${datosEstudiantes};`);
const moduloPersonas = `data:text/javascript;base64,${Buffer.from(personas).toString('base64')}`;
const fuente = (await readFile(new URL('../src/utils/reglasSesion.js', import.meta.url), 'utf8'))
  .replace('"./personas"', JSON.stringify(moduloPersonas));
const reglas = await import(`data:text/javascript;base64,${Buffer.from(fuente).toString('base64')}`);

function sesion(cambios = {}) {
  return {
    codigo: 'TU-2026-0184', tutorId: 'u-003', estudianteId: 'u-101',
    curso: { codigo: 'MA101', nombre: 'Cálculo I' }, tema: 'Repaso de integrales definidas',
    fecha: '2090-10-18', horaInicio: '16:00', horaFin: '17:00',
    estado: 'programada', modalidad: 'remota', horarioAlternativo: null,
    trazabilidad: [], ...cambios,
  };
}

test('HU4 interpreta bloques, días y trazabilidad en Lima sin depender de la zona del equipo', () => {
  assert.equal(reglas.aFecha('2026-10-18', '17:00').toISOString(), '2026-10-18T22:00:00.000Z');
  assert.equal(reglas.nombreDia('2026-10-18'), 'domingo');
  assert.equal(reglas.formatearFechaCorta('2026-10-18'), 'Dom 18/10/2026');
  assert.equal(reglas.formatearFechaHora('2026-10-18T02:00:00.000Z'), '17/10/2026 · 21:00');
  assert.equal(reglas.formatearFechaHora('2026-10-17T21:00:00'), '17/10/2026 · 21:00');
  assert.equal(reglas.horasDesdeSolicitud(sesion({ trazabilidad: [] }), new Date('2090-10-18T22:00:00Z')), 1);
});

test('HU4 y HU5 comparten la ventana de cierre: fin incluido y 72 horas incluidas', () => {
  const datos = sesion({ fecha: '2026-10-18' });
  assert.equal(reglas.evaluarCierre(datos, new Date('2026-10-18T21:59:59.999Z')).permitido, false);
  assert.equal(reglas.evaluarCierre(datos, new Date('2026-10-18T22:00:00.000Z')).permitido, true);
  assert.equal(reglas.evaluarCierre(datos, new Date('2026-10-21T22:00:00.000Z')).permitido, true);
  assert.equal(reglas.evaluarCierre(datos, new Date('2026-10-21T22:00:00.001Z')).permitido, false);
  assert.equal(reglas.evaluarCierre(sesion({ horaFin: 'inválida' })).permitido, false);
});

test('el reloj se consulta en cada operación, no queda detenido al importar el módulo', () => {
  const FechaReal = Date;
  let instante = '2026-10-18T22:00:00.000Z';
  globalThis.Date = class extends FechaReal {
    constructor(...argumentos) {
      super(...(argumentos.length ? argumentos : [instante]));
    }
  };
  try {
    assert.equal(reglas.evaluarCierre(sesion({ fecha: '2026-10-18' })).permitido, true);
    instante = '2026-10-21T22:00:00.001Z';
    assert.equal(reglas.evaluarCierre(sesion({ fecha: '2026-10-18' })).permitido, false);
    assert.ok(Math.abs(reglas.horasHastaInicio(sesion({ fecha: '2026-10-22' })) - 23) < 0.000001);
  } finally {
    globalThis.Date = FechaReal;
  }
});

test('cancelar respeta las 12 horas y solo permite actuar a participantes', () => {
  const datos = sesion({ fecha: '2026-10-18' });
  assert.equal(reglas.evaluarCancelacion(datos, new Date('2026-10-18T09:00:00.000Z')).permitido, true);
  assert.equal(reglas.evaluarCancelacion(datos, new Date('2026-10-18T09:00:00.001Z')).permitido, false);
  const otraPersona = reglas.cancelarSesion([sesion()], 'TU-2026-0184', 'u-ajeno');
  assert.equal(otraPersona.ok, false);
  assert.equal(otraPersona.error.codigo, 'SIN_PERMISO');
  const original = sesion();
  const resultado = reglas.cancelarSesion([original], original.codigo, original.estudianteId);
  assert.equal(resultado.ok, true);
  assert.equal(resultado.sesion.estado, 'cancelada');
  assert.equal(original.estado, 'programada');
  assert.equal(original.trazabilidad.length, 0);
});

test('una sesión realizada, ausente o cancelada no se reabre desde las operaciones de HU4', () => {
  for (const estado of ['realizada', 'no-asistio', 'cancelada', 'rechazada']) {
    const datos = sesion({ estado });
    assert.equal(reglas.cancelarSesion([datos], datos.codigo, datos.tutorId).ok, false, estado);
    assert.equal(reglas.aceptarSolicitud([datos], datos.codigo, datos.tutorId).ok, false, estado);
    assert.equal(reglas.rechazarSolicitud([datos], datos.codigo, 'No puedo atender este horario.', datos.tutorId).ok, false, estado);
    assert.equal(reglas.proponerHorario([datos], datos.codigo, datos, '', datos.tutorId).ok, false, estado);
    assert.equal(reglas.aceptarPropuesta([datos], datos.codigo, datos.estudianteId).ok, false, estado);
    assert.equal(reglas.rechazarPropuesta([datos], datos.codigo, datos.estudianteId).ok, false, estado);
    assert.equal(reglas.evaluarCierre(datos).permitido, false, estado);
  }
});

test('solicitar y aceptar guarda el instante real y no modifica las sesiones originales', () => {
  const antes = Date.now();
  const solicitud = reglas.crearSolicitud([], sesion(), 'u-101');
  assert.equal(solicitud.ok, true);
  assert.equal(solicitud.sesion.estado, 'pendiente');
  const registrada = Date.parse(solicitud.sesion.trazabilidad[0].fecha);
  assert.ok(registrada >= antes && registrada <= Date.now());
  const aceptada = reglas.aceptarSolicitud(solicitud.sesiones, solicitud.sesion.codigo, 'u-003');
  assert.equal(aceptada.ok, true);
  assert.equal(aceptada.sesion.estado, 'programada');
  assert.equal(solicitud.sesion.estado, 'pendiente');
  assert.equal(aceptada.sesion.trazabilidad.length, 3);
});

test('una solicitud o propuesta vencida no se convierte en programada', () => {
  const vencida = sesion({ estado: 'pendiente', fecha: '2000-01-01' });
  assert.equal(reglas.aceptarSolicitud([vencida], vencida.codigo, vencida.tutorId).error.codigo, 'BLOQUE_VENCIDO');
  assert.equal(reglas.crearSolicitud([], vencida, vencida.estudianteId).error.codigo, 'BLOQUE_VENCIDO');
  const propuesta = sesion({
    estado: 'horario-propuesto',
    horarioAlternativo: { fecha: '2000-01-01', horaInicio: '16:00', horaFin: '17:00', propuestoPor: 'tutor' },
  });
  assert.equal(reglas.aceptarPropuesta([propuesta], propuesta.codigo, propuesta.estudianteId).error.codigo, 'BLOQUE_VENCIDO');
});

test('aceptar una solicitud con cruce no reemplaza otra sesión programada', () => {
  const ocupada = sesion();
  const pendiente = sesion({ codigo: 'TU-2026-0185', estado: 'pendiente', estudianteId: 'u-102' });
  const resultado = reglas.aceptarSolicitud([ocupada, pendiente], pendiente.codigo, pendiente.tutorId);
  assert.equal(resultado.ok, false);
  assert.equal(resultado.error.codigo, 'SOLAPAMIENTO_TUTOR');
  assert.equal(pendiente.estado, 'pendiente');
});
