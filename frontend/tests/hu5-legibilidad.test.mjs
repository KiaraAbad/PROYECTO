import test from 'node:test';
import assert from 'node:assert/strict';
import {
  fechaSesion,
  formatearFecha,
  formatearFechaHora,
  ventanaCierre,
  validarCierre,
  validarMaterial,
  filtrarSesiones,
  resumirHoras,
} from '../src/utils/sesiones.js';

function crearSesion(cambios = {}) {
  return {
    codigo: 'TU-2026-0184',
    tutorId: 'u-001',
    estudianteId: 'u-002',
    curso: { codigo: 'MA101', nombre: 'Cálculo I' },
    fecha: '2026-10-18',
    horaInicio: '16:00',
    horaFin: '17:00',
    estado: 'programada',
    ...cambios,
  };
}

function congelarDatos(valor) {
  Object.values(valor).forEach(elemento => {
    if (elemento && typeof elemento === 'object') congelarDatos(elemento);
  });
  return Object.freeze(valor);
}

test('los formatos de fecha usan Lima aunque el instante UTC corresponda al día siguiente', () => {
  const instante = new Date('2026-10-18T02:00:00.000Z');
  assert.equal(formatearFecha(instante), formatearFecha('2026-10-17'));
  assert.equal(
    formatearFechaHora('2026-10-18T02:00:00.000Z'),
    formatearFechaHora('2026-10-17T21:00:00-05:00'),
  );
  assert.equal(fechaSesion(crearSesion()).toISOString(), '2026-10-18T21:00:00.000Z');
  assert.equal(fechaSesion(crearSesion(), true).toISOString(), '2026-10-18T22:00:00.000Z');
});

test('las fechas inválidas muestran una alternativa y no habilitan el cierre', () => {
  assert.equal(formatearFecha('fecha-inexistente'), 'Fecha no disponible');
  assert.equal(formatearFecha(new Date('fecha-inexistente')), 'Fecha no disponible');
  assert.equal(formatearFechaHora('fecha-inexistente'), 'Fecha no disponible');

  const resultado = ventanaCierre(
    crearSesion({ fecha: 'fecha-inexistente' }),
    new Date('2026-10-18T22:30:00.000Z'),
  );
  assert.equal(resultado.habilitado, false);
  assert.equal(resultado.motivo, 'La sesión no tiene una fecha válida.');
  assert.ok(Number.isNaN(resultado.limite.getTime()));
});

test('buscar un curso inexistente o consultar una lista vacía no genera resultados', () => {
  assert.deepEqual(filtrarSesiones([crearSesion()], { curso: 'NO-EXISTE' }), []);
  assert.deepEqual(filtrarSesiones([], { desde: '2026-01-01', hasta: '2026-12-31' }), []);
  assert.deepEqual(filtrarSesiones([]), []);
});

test('filtrar conserva el orden y los objetos de entrada sin mutarlos', () => {
  const sesiones = congelarDatos([
    crearSesion({ codigo: 'primera', fecha: '2026-10-20' }),
    crearSesion({ codigo: 'excluida', fecha: '2026-09-01' }),
    crearSesion({ codigo: 'tercera', fecha: '2026-10-01' }),
  ]);
  const antes = structuredClone(sesiones);
  const resultado = filtrarSesiones(sesiones, { desde: '2026-10-01' });

  assert.deepEqual(resultado.map(sesion => sesion.codigo), ['primera', 'tercera']);
  assert.equal(resultado[0], sesiones[0]);
  assert.equal(resultado[1], sesiones[2]);
  assert.notEqual(filtrarSesiones(sesiones), sesiones);
  assert.deepEqual(sesiones, antes);
});

test('un borrador permite datos parciales pero respeta los límites exactos de texto', () => {
  assert.deepEqual(validarCierre({ notas: null, temasPendientes: undefined }, { borrador: true }), {});
  assert.deepEqual(validarCierre({
    notas: 'n'.repeat(3000),
    temasPendientes: 'p'.repeat(2000),
  }, { borrador: true }), {});

  const errores = validarCierre({
    notas: 'n'.repeat(3001),
    temasPendientes: 'p'.repeat(2001),
  }, { borrador: true });
  assert.deepEqual(Object.keys(errores).sort(), ['notas', 'temasPendientes']);
});

test('los pendientes son opcionales y una inasistencia no exige notas', () => {
  assert.deepEqual(validarCierre({
    asistenciaEstudiante: true,
    asistenciaTutor: true,
    duracionRealMin: '60',
    notas: 'Practicamos derivadas.',
  }), {});
  assert.deepEqual(validarCierre({
    asistenciaEstudiante: false,
    asistenciaTutor: true,
  }), {});
});

test('material admite los límites de título y descripción pero rechaza credenciales en URLs', () => {
  assert.deepEqual(validarMaterial({
    titulo: 't'.repeat(120),
    url: 'https://example.org/guia',
    descripcion: 'd'.repeat(500),
  }), {});
  assert.deepEqual(validarMaterial({ titulo: 'Guía', url: 'https://example.org' }), {});

  for (const url of ['https://usuario@example.org/guia', 'https://usuario:clave@example.org/guia']) {
    const errores = validarMaterial({ titulo: 'Guía', url });
    assert.deepEqual(Object.keys(errores), ['url']);
  }
  assert.ok(validarMaterial({
    titulo: 'Guía',
    url: 'https://example.org',
    descripcion: 'd'.repeat(501),
  }).descripcion);
});

test('el resumen ordena cursos por minutos y meses cronológicamente sin alterar las sesiones', () => {
  const sesiones = congelarDatos([
    crearSesion({
      codigo: 'web-enero', fecha: '2027-01-02', estado: 'realizada',
      curso: { codigo: 'PW101', nombre: 'Programación Web' },
      cierre: { finalizado: true, duracionRealMin: 30 },
    }),
    crearSesion({
      codigo: 'calculo-diciembre', fecha: '2026-12-31', estado: 'realizada',
      cierre: { finalizado: true, duracionRealMin: 120 },
    }),
    crearSesion({
      codigo: 'web-octubre', fecha: '2026-10-01', estado: 'realizada',
      curso: { codigo: 'PW101', nombre: 'Programación Web' },
      cierre: { finalizado: true, duracionRealMin: 30 },
    }),
  ]);
  const antes = structuredClone(sesiones);
  const resumen = resumirHoras(sesiones);

  assert.deepEqual(resumen.porCurso.map(curso => curso.codigo), ['MA101', 'PW101']);
  assert.deepEqual(resumen.porCurso.map(curso => curso.minutos), [120, 60]);
  assert.deepEqual(resumen.porMes.map(mes => mes.mes), ['2026-10', '2026-12', '2027-01']);
  assert.equal(resumen.minutos, 180);
  assert.equal(resumen.sesiones, 3);
  assert.deepEqual(sesiones, antes);
});
