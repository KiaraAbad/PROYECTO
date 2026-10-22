import test from 'node:test';
import assert from 'node:assert/strict';
import { fechaCorta, fechaHoraCorta, mesCorto, resumirCierresPorMes } from '../src/utils/presentacionSesiones.js';

test('los formatos numéricos respetan Lima y conservan las fechas sin hora', () => {
  assert.equal(fechaCorta('2026-09-14'), '14/09/2026');
  assert.equal(fechaCorta('2026-10-22T02:00:00Z'), '21/10/2026');
  assert.equal(fechaHoraCorta('2026-10-22T02:00:00Z'), '21/10/2026 a las 21:00');
  assert.equal(mesCorto('2026-09'), 'Septiembre');
  assert.equal(fechaCorta('fecha inválida'), 'Fecha no disponible');
  assert.equal(fechaCorta(null), 'Fecha no disponible');
});

test('el gráfico cuenta cierres realizados e inasistencias, sin contar borradores ni cancelaciones', () => {
  const sesiones = [
    { fecha: '2026-10-21', estado: 'realizada', cierre: { finalizado: true } },
    { fecha: '2026-09-21', estado: 'no-asistio', cierre: { finalizado: true } },
    { fecha: '2026-09-22', estado: 'realizada', cierre: { finalizado: true } },
    { fecha: '2026-10-20', estado: 'programada', cierre: { finalizado: false } },
    { fecha: '2026-09-20', estado: 'cancelada', cierre: { finalizado: false } },
  ];
  const copia = structuredClone(sesiones);
  assert.deepEqual(resumirCierresPorMes(sesiones), [
    { mes: '2026-09', cantidad: 2 }, { mes: '2026-10', cantidad: 1 },
  ]);
  assert.deepEqual(sesiones, copia);
  assert.deepEqual(resumirCierresPorMes([]), []);
});
