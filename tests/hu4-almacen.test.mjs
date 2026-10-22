import test from 'node:test';
import assert from 'node:assert/strict';
import semillaAnterior from '../src/data/hu5-semilla.json' with { type: 'json' };
import {
  CLAVE_ALMACEN,
  CLAVE_ALMACEN_ANTERIOR,
  cargarDatosDemo,
  crearDatosDemo,
  migrarDatosV1,
  sonDatosGuardadosValidos,
  usuariosDemo,
} from '../src/data/hu5-almacen.js';
import { ventanaCierre, resumirHoras } from '../src/utils/sesiones.js';

const ahora = new Date('2026-10-21T20:00:00.000Z');
const almacenFalso = valores => ({ getItem: clave => valores[clave] ?? null });

function datosAnteriores() {
  const sesiones = structuredClone(semillaAnterior.sesiones);
  const cierres = {};
  for (const sesion of sesiones) {
    if (!['realizada', 'no-asistio'].includes(sesion.estado)) continue;
    cierres[sesion.codigo] = {
      finalizado: true,
      estadoFinal: sesion.estado,
      duracionRealMin: sesion.estado === 'realizada' ? 60 : 0,
      notas: 'Notas que el usuario ya guardó.',
      material: [{ id: 'm1', titulo: 'Guía propia', url: 'https://example.com/guia' }],
    };
  }
  cierres['TU-2026-0184'] = {
    finalizado: true,
    estadoFinal: 'realizada',
    duracionRealMin: 90,
    notas: 'Fecha del examen: 25 de octubre',
    temasPendientes: 'Continuar estudiando',
    material: [],
  };
  return { version: 1, sesiones, cierres };
}

test('la semilla compartida acepta todos los estados HU4 y tiene un cierre disponible hoy', () => {
  const datos = crearDatosDemo(ahora);
  assert.equal(sonDatosGuardadosValidos(datos), true);
  assert.equal(datos.version, 2);
  // El detalle de HU-4 usa este campo; un estudiante sin promedio debe recibir null.
  for (const persona of usuariosDemo) {
    assert.ok(persona.nombreCompleto);
    assert.ok(persona.promedio === null || Number.isFinite(persona.promedio));
  }
  assert.equal(ventanaCierre(datos.sesiones.find(s => s.codigo === 'TU-2026-0184'), ahora).habilitado, true);
  for (const estado of ['pendiente', 'horario-propuesto', 'programada', 'realizada', 'no-asistio', 'cancelada', 'rechazada']) {
    assert.ok(datos.sesiones.some(sesion => sesion.estado === estado), estado);
  }
});

test('la semilla permite cierre cerca de medianoche de Lima sin bloques cruzados', () => {
  for (const instante of ['2026-10-22T05:10:00Z', '2026-10-22T05:45:00Z', '2026-10-22T06:00:00Z']) {
    const referencia = new Date(instante);
    const principal = crearDatosDemo(referencia).sesiones.find(s => s.codigo === 'TU-2026-0184');
    assert.ok(principal.horaInicio < principal.horaFin);
    assert.equal(ventanaCierre(principal, referencia).habilitado, true);
  }
});

test('migra identidades por nombre: nunca confunde a Sebastián con Anita o a Camila con Sebastián', () => {
  const migrados = migrarDatosV1(datosAnteriores(), ahora);
  assert.equal(migrados.sesiones.find(s => s.codigo === 'TU-2026-0184').tutorId, 'u-003');
  assert.equal(migrados.sesiones.find(s => s.codigo === 'TU-2026-0184').estudianteId, 'u-101');
  assert.equal(migrados.sesiones.find(s => s.codigo === 'TU-2026-0182').tutorId, 'u-002');
  assert.equal(migrados.sesiones.find(s => s.codigo === 'TU-2026-0185').estudianteId, 'u-102');
  assert.equal(usuariosDemo.find(u => u.id === 'u-003').nombres, 'Sebastián');
});

test('conserva sesiones, fechas, notas, materiales y horas anteriores ante colisiones de código', () => {
  const anteriores = datosAnteriores();
  const copia = structuredClone(anteriores);
  const migrados = migrarDatosV1(anteriores, ahora);
  assert.deepEqual(anteriores, copia, 'No modifica el objeto anterior');
  for (const original of anteriores.sesiones) {
    const conservada = migrados.sesiones.find(s => s.codigo === original.codigo);
    assert.equal(conservada.fecha, original.fecha);
    assert.equal(conservada.horaInicio, original.horaInicio);
    assert.equal(conservada.tema, original.tema);
    assert.deepEqual(conservada.curso, original.curso);
  }
  for (const [codigo, cierre] of Object.entries(anteriores.cierres)) {
    assert.deepEqual(migrados.cierres[codigo], cierre);
  }
  const conCierres = datos => datos.sesiones.map(s => ({
    ...s, cierre: datos.cierres[s.codigo],
    estado: datos.cierres[s.codigo]?.estadoFinal ?? s.estado,
  }));
  const originales = new Set(anteriores.sesiones.map(s => s.codigo));
  assert.deepEqual(
    resumirHoras(conCierres(migrados).filter(s => originales.has(s.codigo))),
    resumirHoras(conCierres(anteriores)),
  );
  assert.ok(migrados.sesiones.length > anteriores.sesiones.length);
  assert.equal(new Set(migrados.sesiones.map(s => s.codigo)).size, migrados.sesiones.length);
});

test('cargar v1 no escribe ni modifica su respaldo; v2 prevalece y no desplaza fechas otra vez', () => {
  const respaldo = JSON.stringify(datosAnteriores());
  const valores = { [CLAVE_ALMACEN_ANTERIOR]: respaldo };
  const datos = cargarDatosDemo(almacenFalso(valores), ahora);
  assert.equal(valores[CLAVE_ALMACEN_ANTERIOR], respaldo);
  assert.equal(valores[CLAVE_ALMACEN], undefined);
  valores[CLAVE_ALMACEN] = JSON.stringify(datos);
  const siguienteDia = cargarDatosDemo(almacenFalso(valores), new Date('2026-10-25T20:00:00Z'));
  assert.deepEqual(siguienteDia, datos);
});

test('pendientes, propuestas y rechazos guardados no provocan que se reinicien los datos', () => {
  const datos = crearDatosDemo(ahora);
  datos.cierres['TU-2026-0184'] = { material: [], finalizado: false, notas: 'Mi borrador' };
  const guardados = cargarDatosDemo(almacenFalso({ [CLAVE_ALMACEN]: JSON.stringify(datos) }), ahora);
  assert.deepEqual(guardados, datos);
  assert.equal(guardados.cierres['TU-2026-0184'].notas, 'Mi borrador');
});

test('un cierre anterior huérfano no se asocia por accidente a una sesión nueva de igual código', () => {
  const anteriores = datosAnteriores();
  anteriores.cierres['TU-2026-0198'] = { material: [], finalizado: false, notas: 'Conservar sin reasignar' };
  const migrados = migrarDatosV1(anteriores, ahora);
  assert.equal(migrados.sesiones.some(s => s.codigo === 'TU-2026-0198'), false);
  assert.deepEqual(migrados.cierres['TU-2026-0198'], anteriores.cierres['TU-2026-0198']);
});

test('si v2 está dañado recupera v1 y si no hay almacenamiento crea una demo utilizable', () => {
  const datos = cargarDatosDemo(almacenFalso({
    [CLAVE_ALMACEN]: '{json roto',
    [CLAVE_ALMACEN_ANTERIOR]: JSON.stringify(datosAnteriores()),
  }), ahora);
  assert.equal(datos.cierres['TU-2026-0184'].notas, 'Fecha del examen: 25 de octubre');
  assert.equal(sonDatosGuardadosValidos(cargarDatosDemo(undefined, ahora)), true);
});

test('la demo puede iniciar aunque el navegador lance un error al acceder a localStorage', () => {
  const descriptorAnterior = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get() { throw new Error('Almacenamiento bloqueado'); },
  });
  try {
    assert.equal(sonDatosGuardadosValidos(cargarDatosDemo(undefined, ahora)), true);
  } finally {
    if (descriptorAnterior) Object.defineProperty(globalThis, 'localStorage', descriptorAnterior);
    else delete globalThis.localStorage;
  }
});
