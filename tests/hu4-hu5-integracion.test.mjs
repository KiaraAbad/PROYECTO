import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  crearCierreVacio, enriquecerSesion, actualizarRegistro, aplicarResultadoAgenda,
} from '../src/utils/estadoCompartido.js';
import { resumirHoras, validarCierre, ventanaCierre } from '../src/utils/sesiones.js';

// Node no resuelve los imports sin extensión de Vite. Resolvemos ese import aquí,
// sin cambiar las funciones de agenda ni instalar herramientas de pruebas.
const tutores = await readFile(new URL('../src/data/tutores.json', import.meta.url), 'utf8');
const estudiantes = await readFile(new URL('../src/data/estudiantes.json', import.meta.url), 'utf8');
const fuentePersonas = (await readFile(new URL('../src/utils/personas.js', import.meta.url), 'utf8'))
  .replace('import datosTutores from "../data/tutores.json";', `const datosTutores = ${tutores};`)
  .replace('import datosEstudiantes from "../data/estudiantes.json";', `const datosEstudiantes = ${estudiantes};`);
const moduloPersonas = `data:text/javascript;base64,${Buffer.from(fuentePersonas).toString('base64')}`;
const fuenteReglas = (await readFile(new URL('../src/utils/reglasSesion.js', import.meta.url), 'utf8'))
  .replace('"./personas"', JSON.stringify(moduloPersonas));
const { aceptarSolicitud, cancelarSesion, crearSolicitud } = await import(
  `data:text/javascript;base64,${Buffer.from(fuenteReglas).toString('base64')}`
);

const usuarios = [
  { id: 'u-003', nombres: 'Sebastián', apellidos: 'Rojas Mendoza', rol: ['estudiante', 'tutor'] },
  { id: 'u-101', nombres: 'Joaquín', apellidos: 'Medina Talledo', rol: ['estudiante'] },
];

function sesion(cambios = {}) {
  return {
    codigo: 'TU-2026-0184', tutorId: 'u-003', estudianteId: 'u-101',
    curso: { codigo: 'MA101', nombre: 'Cálculo I' }, tema: 'Repaso de integrales definidas',
    fecha: '2090-10-18', horaInicio: '16:00', horaFin: '17:00',
    estado: 'pendiente', modalidad: 'remota', horarioAlternativo: null,
    trazabilidad: [], ...cambios,
  };
}

function cierre(cambios = {}) {
  return {
    ...crearCierreVacio('TU-2026-0184'),
    asistenciaEstudiante: true, asistenciaTutor: true, duracionRealMin: 75,
    notas: 'Trabajamos integrales por partes con ejercicios guiados.',
    temasPendientes: 'Repasar sustitución trigonométrica.',
    finalizado: true, estadoFinal: 'realizada', cerradoEn: '2090-10-18T22:30:00Z',
    ...cambios,
  };
}

function enriquecerDatos(datos) {
  return datos.sesiones.map(base => enriquecerSesion(base, datos.cierres, usuarios));
}

function congelar(valor) {
  for (const hijo of Object.values(valor)) {
    if (hijo && typeof hijo === 'object') congelar(hijo);
  }
  return Object.freeze(valor);
}

test('aceptar en HU4 y cerrar en HU5 actualiza la misma sesión, identidad, historial y horas', () => {
  const originales = congelar({ version: 2, sesiones: [sesion()], cierres: {} });
  const aceptacion = aceptarSolicitud(originales.sesiones, 'TU-2026-0184', 'u-003');
  assert.equal(aceptacion.ok, true);
  const programadas = aplicarResultadoAgenda(originales, aceptacion);
  assert.equal(programadas.sesiones.length, 1);
  assert.equal(programadas.sesiones[0].estado, 'programada');
  assert.equal(originales.sesiones[0].estado, 'pendiente');
  assert.deepEqual(validarCierre(cierre()), {});
  assert.equal(ventanaCierre(programadas.sesiones[0], new Date('2090-10-18T22:30:00Z')).habilitado, true);

  const cerradas = actualizarRegistro(programadas, 'TU-2026-0184', cierre(), 'Sebastián Rojas Mendoza');
  const agenda = enriquecerDatos(cerradas);
  assert.equal(agenda[0].estado, 'realizada');
  assert.equal(agenda[0].tutor.nombres, 'Sebastián');
  assert.equal(agenda[0].estudiante.nombres, 'Joaquín');
  assert.equal(agenda[0].cierre.notas, cierre().notas);
  assert.equal(agenda[0].trazabilidad.length, 3);
  assert.equal(agenda[0].trazabilidad[2].actor, 'Sebastián Rojas Mendoza');
  const resumen = resumirHoras(agenda);
  assert.equal(resumen.minutos, 75);
  assert.equal(resumen.sesiones, 1);
  assert.equal(resumen.porCurso[0].codigo, 'MA101');
  assert.equal(resumen.porCurso[0].minutos, 75);
  assert.equal(resumirHoras(enriquecerDatos(programadas)).minutos, 0);
});

test('un borrador conserva la sesión programada y no suma horas', () => {
  const originales = congelar({ version: 2, sesiones: [sesion({ estado: 'programada' })], cierres: {} });
  const borrador = cierre({ finalizado: false });
  const datos = actualizarRegistro(originales, 'TU-2026-0184', borrador, 'Sebastián');
  const [agenda] = enriquecerDatos(datos);
  assert.equal(agenda.estado, 'programada');
  assert.equal(agenda.cierre.notas, borrador.notas);
  assert.equal(agenda.trazabilidad.length, 0);
  assert.equal(resumirHoras([agenda]).minutos, 0);
  assert.equal(originales.cierres['TU-2026-0184'], undefined);
});

test('la ausencia se publica en la agenda sin sumar horas ni sesiones realizadas', () => {
  const datos = { version: 2, sesiones: [sesion({ estado: 'programada' })], cierres: {} };
  const inasistencia = cierre({
    asistenciaEstudiante: false, estadoFinal: 'no-asistio', duracionRealMin: 0,
    notas: '', temasPendientes: '',
  });
  assert.deepEqual(validarCierre(inasistencia), {});
  const final = actualizarRegistro(datos, 'TU-2026-0184', inasistencia, 'Sebastián');
  const [agenda] = enriquecerDatos(final);
  assert.equal(agenda.estado, 'no-asistio');
  assert.equal(resumirHoras([agenda]).minutos, 0);
  assert.equal(resumirHoras([agenda]).sesiones, 0);
  assert.match(agenda.trazabilidad[0].evento, /No asistió/);
  assert.equal(cancelarSesion([agenda], agenda.codigo, 'u-003').ok, false);
});

test('una cancelación de HU4 bloquea el cierre de HU5 aunque exista un borrador', () => {
  const datos = congelar({
    version: 2, sesiones: [sesion({ estado: 'programada' })],
    cierres: { 'TU-2026-0184': cierre({ finalizado: false }) },
  });
  const cancelacion = cancelarSesion(enriquecerDatos(datos), 'TU-2026-0184', 'u-101');
  assert.equal(cancelacion.ok, true);
  const canceladas = aplicarResultadoAgenda(datos, cancelacion);
  const [agenda] = enriquecerDatos(canceladas);
  assert.equal(agenda.estado, 'cancelada');
  assert.equal(ventanaCierre(agenda, new Date('2090-10-18T22:30:00Z')).habilitado, false);
  assert.equal(resumirHoras([agenda]).minutos, 0);
  assert.equal(canceladas.cierres['TU-2026-0184'].notas, cierre().notas);
  assert.equal(datos.sesiones[0].estado, 'programada');
});

test('un cierre ya finalizado no se reabre desde agenda ni duplica trazabilidad u horas', () => {
  const datos = { version: 2, sesiones: [sesion({ estado: 'programada' })], cierres: {} };
  const cerrado = actualizarRegistro(datos, 'TU-2026-0184', cierre(), 'Sebastián');
  const mismoCierre = actualizarRegistro(cerrado, 'TU-2026-0184', cierre(), 'Sebastián');
  const [agenda] = enriquecerDatos(mismoCierre);
  assert.equal(agenda.trazabilidad.length, 1);
  assert.equal(resumirHoras([agenda]).minutos, 75);
  assert.equal(resumirHoras([agenda]).sesiones, 1);
  assert.equal(ventanaCierre(agenda, new Date('2090-10-18T22:30:00Z')).habilitado, false);
  assert.equal(cancelarSesion([agenda], agenda.codigo, 'u-003').ok, false);
  assert.equal(aceptarSolicitud([agenda], agenda.codigo, 'u-003').ok, false);
});

test('guardar otra edición de material no agrega un segundo evento de cierre', () => {
  const datos = { version: 2, sesiones: [sesion({ estado: 'programada' })], cierres: {} };
  const cerrado = actualizarRegistro(datos, 'TU-2026-0184', cierre(), 'Sebastián');
  const material = { id: 'm-1', titulo: 'Guía', url: 'https://example.com/guia', descripcion: '' };
  const actualizado = actualizarRegistro(cerrado, 'TU-2026-0184', cierre({ material: [material] }), 'Sebastián');
  const [agenda] = enriquecerDatos(actualizado);
  assert.equal(agenda.trazabilidad.length, 1);
  assert.equal(agenda.cierre.material.length, 1);
  assert.equal(resumirHoras([agenda]).minutos, 75);
  assert.equal(cerrado.cierres['TU-2026-0184'].material.length, 0);
});

test('el resultado de agenda no guarda copias enriquecidas ni altera cierres de otras sesiones', () => {
  const previa = cierre({ sesionCodigo: 'TU-2026-0183' });
  const datos = congelar({
    version: 2, sesiones: [sesion()], cierres: { 'TU-2026-0183': previa },
  });
  const resultado = aceptarSolicitud(enriquecerDatos(datos), 'TU-2026-0184', 'u-003');
  const actualizado = aplicarResultadoAgenda(datos, resultado);
  assert.equal(actualizado.sesiones[0].tutor, undefined);
  assert.equal(actualizado.sesiones[0].estudiante, undefined);
  assert.equal(actualizado.sesiones[0].cierre, undefined);
  assert.equal(actualizado.cierres, datos.cierres);
  assert.equal(actualizado.cierres['TU-2026-0183'].notas, previa.notas);
  const fallo = { ok: false, error: { mensaje: 'Sin permiso' } };
  assert.equal(aplicarResultadoAgenda(datos, fallo), datos);
});

test('solicitar agrega una sola sesión y los cierres permanecen unidos a su código', () => {
  const datos = congelar({ version: 2, sesiones: [sesion()], cierres: {} });
  const solicitud = crearSolicitud(enriquecerDatos(datos), sesion({ fecha: '2090-10-19' }), 'u-101');
  assert.equal(solicitud.ok, true);
  const actualizado = aplicarResultadoAgenda(datos, solicitud);
  assert.equal(actualizado.sesiones.length, 2);
  assert.equal(actualizado.sesiones[0].codigo, 'TU-2026-0184');
  assert.equal(actualizado.sesiones[1].codigo, 'TU-2026-0185');
  assert.equal(datos.sesiones.length, 1);
  const repetido = aplicarResultadoAgenda(actualizado, solicitud);
  assert.equal(repetido.sesiones.length, 2);
  assert.deepEqual(repetido.cierres, {});
});
