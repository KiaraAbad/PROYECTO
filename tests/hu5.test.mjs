import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ventanaCierre,
  validarCierre,
  validarMaterial,
  filtrarSesiones,
  resumirHoras,
} from '../src/utils/sesiones.js';

const sesion = (cambios = {}) => ({
  codigo: 'TU-2026-0184',
  tutorId: 'u-001',
  estudianteId: 'u-002',
  curso: { codigo: 'MA101', nombre: 'Cálculo I' },
  fecha: '2026-10-18',
  horaInicio: '16:00',
  horaFin: '17:00',
  estado: 'programada',
  ...cambios,
});

const cierre = (cambios = {}) => ({
  asistenciaEstudiante: true,
  asistenciaTutor: true,
  duracionRealMin: 60,
  notas: 'Resolvimos integrales y verificamos las respuestas.',
  temasPendientes: '',
  ...cambios,
});

test('el cierre usa la hora de Lima y se habilita al terminar la sesión', () => {
  const antes = ventanaCierre(sesion(), new Date('2026-10-18T21:59:59.999Z'));
  assert.equal(antes.habilitado, false);
  assert.ok(antes.motivo);

  const alFinalizar = ventanaCierre(sesion(), new Date('2026-10-18T22:00:00.000Z'));
  assert.equal(alFinalizar.habilitado, true);
  assert.ok(alFinalizar.limite instanceof Date);
  assert.equal(alFinalizar.limite.toISOString(), '2026-10-21T22:00:00.000Z');
});

test('el plazo permite exactamente 72 horas pero no un milisegundo más', () => {
  assert.equal(
    ventanaCierre(sesion(), new Date('2026-10-21T22:00:00.000Z')).habilitado,
    true,
  );
  const vencida = ventanaCierre(sesion(), new Date('2026-10-21T22:00:00.001Z'));
  assert.equal(vencida.habilitado, false);
  assert.ok(vencida.motivo);
});

test('sesiones canceladas o ya cerradas no se pueden volver a cerrar', () => {
  for (const estado of ['cancelada', 'realizada', 'no-asistio']) {
    const resultado = ventanaCierre(
      sesion({ estado }),
      new Date('2026-10-18T22:30:00.000Z'),
    );
    assert.equal(resultado.habilitado, false, estado);
    assert.ok(resultado.motivo, estado);
  }
});

test('el cierre final exige asistencia explícita y notas para una sesión realizada', () => {
  assert.deepEqual(validarCierre(cierre()), {});
  const errores = validarCierre(cierre({
    asistenciaEstudiante: undefined,
    asistenciaTutor: undefined,
  }));
  assert.ok(errores.asistenciaEstudiante);
  assert.ok(errores.asistenciaTutor);
  assert.ok(validarCierre(cierre({ notas: '   ' })).notas);
  assert.ok(validarCierre(cierre({ notas: 'a'.repeat(3001) })).notas);
  assert.ok(validarCierre(cierre({ temasPendientes: 'a'.repeat(2001) })).temasPendientes);
});

test('la duración realizada acepta los límites y rechaza valores fuera del contrato', () => {
  for (const duracionRealMin of [15, 60, 240]) {
    assert.deepEqual(validarCierre(cierre({ duracionRealMin })), {});
  }
  for (const duracionRealMin of [0, 14, 16, 245, -15, 30.5, NaN]) {
    assert.ok(
      validarCierre(cierre({ duracionRealMin })).duracionRealMin,
      `Duración inválida: ${duracionRealMin}`,
    );
  }
});

test('una inasistencia y un borrador no exigen notas ni duración', () => {
  for (const asistencias of [
    { asistenciaEstudiante: false, asistenciaTutor: true },
    { asistenciaEstudiante: true, asistenciaTutor: false },
    { asistenciaEstudiante: false, asistenciaTutor: false },
  ]) {
    const errores = validarCierre({ ...asistencias, notas: '', temasPendientes: '' });
    assert.deepEqual(errores, {});
  }
  assert.deepEqual(validarCierre({}, { borrador: true }), {});
  assert.ok(validarCierre({ notas: 'a'.repeat(3001) }, { borrador: true }).notas);
});

test('materiales aceptan enlaces web y rechazan protocolos ejecutables o URLs incompletas', () => {
  for (const url of ['https://example.org/apuntes?curso=web#tema', 'http://example.org/guia']) {
    assert.deepEqual(validarMaterial({ titulo: 'Guía de práctica', url, descripcion: '' }), {});
  }
  for (const url of ['javascript:alert(1)', 'data:text/html,hola', 'ftp://example.org/guia', '/guia', 'https://', '']) {
    assert.ok(validarMaterial({ titulo: 'Guía', url }).url, url || 'URL vacía');
  }
  assert.ok(validarMaterial({ titulo: ' ', url: 'https://example.org' }).titulo);
  assert.ok(validarMaterial({ titulo: 'a'.repeat(121), url: 'https://example.org' }).titulo);
  assert.ok(validarMaterial({ titulo: 'Guía', url: `https://example.org/${'a'.repeat(2048)}` }).url);
  assert.ok(validarMaterial({ titulo: 'Guía', url: 'https://example.org', descripcion: 'a'.repeat(501) }).descripcion);
});

test('los filtros incluyen ambos límites de fecha y combinan curso y estado', () => {
  const sesiones = [
    sesion({ codigo: 'inicio', fecha: '2026-10-01', estado: 'realizada' }),
    sesion({ codigo: 'fin', fecha: '2026-10-31', estado: 'realizada' }),
    sesion({ codigo: 'fuera', fecha: '2026-11-01', estado: 'realizada' }),
    sesion({ codigo: 'otro-curso', curso: { codigo: 'PW101', nombre: 'Programación Web' }, estado: 'realizada' }),
    sesion({ codigo: 'otro-estado', estado: 'cancelada' }),
  ];
  const resultado = filtrarSesiones(sesiones, {
    curso: 'MA101', desde: '2026-10-01', hasta: '2026-10-31', estado: 'realizada',
  });
  assert.deepEqual(resultado.map(item => item.codigo).sort(), ['fin', 'inicio']);
  assert.equal(sesiones.length, 5, 'Filtrar no debe quitar datos del origen');
  assert.equal(filtrarSesiones(sesiones, {}).length, 5);
});

test('las horas solo suman cierres finales realizados y se desglosan por curso y mes', () => {
  const sesiones = [
    sesion({ fecha: '2026-09-30', estado: 'realizada', cierre: { finalizado: true, duracionRealMin: 60 } }),
    sesion({ fecha: '2026-10-01', estado: 'realizada', cierre: { finalizado: true, duracionRealMin: 90 } }),
    sesion({ curso: { codigo: 'PW101', nombre: 'Programación Web' }, estado: 'realizada', cierre: { finalizado: true, duracionRealMin: 30 } }),
    sesion({ estado: 'cancelada', cierre: { finalizado: true, duracionRealMin: 60 } }),
    sesion({ estado: 'no-asistio', cierre: { finalizado: true, duracionRealMin: 60 } }),
    sesion({ estado: 'realizada', cierre: { finalizado: false, duracionRealMin: 60 } }),
    sesion({ estado: 'realizada' }),
    sesion({ estado: 'realizada', cierre: { finalizado: true, duracionRealMin: -60 } }),
    sesion({ estado: 'realizada', cierre: { finalizado: true, duracionRealMin: NaN } }),
  ];
  const resumen = resumirHoras(sesiones);
  assert.equal(resumen.minutos, 180);
  assert.equal(resumen.sesiones, 3);
  const calculo = resumen.porCurso.find(item => item.codigo === 'MA101');
  assert.equal(calculo.nombre, 'Cálculo I');
  assert.equal(calculo.minutos, 150);
  assert.equal(calculo.sesiones, 2);
  assert.equal(resumen.porCurso.find(item => item.codigo === 'PW101').minutos, 30);
  assert.equal(resumen.porMes.find(item => item.mes === '2026-09').minutos, 60);
  assert.equal(resumen.porMes.find(item => item.mes === '2026-10').minutos, 120);
  assert.deepEqual(resumirHoras([]), { minutos: 0, sesiones: 0, porCurso: [], porMes: [] });
});
