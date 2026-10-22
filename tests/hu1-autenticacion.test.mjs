import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CLAVE_CUENTAS, CLAVE_IDENTIDAD, normalizarCorreo, validarIngreso, validarRegistro,
  crearCredencial, comprobarCredencial, leerCuentas, identidadValida,
  leerIdentidad, guardarIdentidad, destinoTrasIngreso,
} from '../src/utils/autenticacion.js';

const usuarios = [
  { id: 'u-003', rol: ['estudiante', 'tutor'] },
  { id: 'u-101', rol: ['estudiante'] },
];
const valores = {
  nombres: 'Alumno', apellidos: 'De prueba', correo: 'alumno@aloe.ulima.edu.pe',
  contrasena: 'SoloPrueba2026!', confirmacion: 'SoloPrueba2026!', carrera: 'Ingeniería', ciclo: '5',
};
function almacen() {
  const datos = new Map();
  return { getItem: clave => datos.get(clave) ?? null, setItem: (clave, valor) => datos.set(clave, valor), removeItem: clave => datos.delete(clave) };
}

test('el ingreso normaliza el correo y admite solo dominios institucionales exactos', () => {
  assert.equal(normalizarCorreo('  ALUMNO@ULIMA.EDU.PE '), 'alumno@ulima.edu.pe');
  assert.deepEqual(validarIngreso(valores), {});
  for (const correo of ['x@gmail.com', 'x@ulima.edu.pe.evil.com', 'x@@ulima.edu.pe', 'x@otra.ulima.edu.pe']) {
    assert.ok(validarIngreso({ ...valores, correo }).correo);
  }
  assert.ok(validarIngreso({ ...valores, contrasena: '' }).contrasena);
});

test('el registro exige nombres, carrera, ciclo, clave válida y confirmación', () => {
  assert.deepEqual(validarRegistro(valores), {});
  for (const campo of ['nombres', 'apellidos', 'carrera']) assert.ok(validarRegistro({ ...valores, [campo]: '' })[campo]);
  for (const ciclo of ['', 0, 13, 1.5, 'otro']) assert.ok(validarRegistro({ ...valores, ciclo }).ciclo);
  assert.ok(validarRegistro({ ...valores, contrasena: 'corta' }).contrasena);
  assert.ok(validarRegistro({ ...valores, confirmacion: 'distinta' }).confirmacion);
  assert.ok(validarRegistro(valores, ['ALUMNO@ALOE.ULIMA.EDU.PE']).correo);
});

test('las credenciales locales usan sal distinta y no contienen la contraseña escrita', async () => {
  const primera = await crearCredencial(valores.contrasena);
  const segunda = await crearCredencial(valores.contrasena);
  assert.notEqual(primera.sal, segunda.sal);
  assert.notEqual(primera.huella, segunda.huella);
  assert.equal(JSON.stringify(primera).includes(valores.contrasena), false);
  assert.equal(await comprobarCredencial(valores.contrasena, primera), true);
  assert.equal(await comprobarCredencial('incorrecta', primera), false);
  assert.equal(await comprobarCredencial('incorrecta', { sal: 'inválida', huella: '' }), false);
});

test('una identidad solo puede usar roles que pertenezcan a su propia cuenta', () => {
  assert.equal(identidadValida({ usuarioId: 'u-003', rol: 'tutor' }, usuarios), true);
  assert.equal(identidadValida({ usuarioId: 'u-003', rol: 'estudiante' }, usuarios), true);
  assert.equal(identidadValida({ usuarioId: 'u-101', rol: 'tutor' }, usuarios), false);
  assert.equal(identidadValida({ usuarioId: 'u-101', rol: 'coordinador' }, usuarios), false);
  assert.equal(identidadValida({ usuarioId: 'otro', rol: 'estudiante' }, usuarios), false);
  assert.equal(identidadValida(null, usuarios), false);
});

test('sin recordarme la identidad se conserva solo en sessionStorage', () => {
  const temporal = almacen(); const permanente = almacen();
  assert.equal(guardarIdentidad({ usuarioId: 'u-101', rol: 'estudiante', recordar: false }, temporal, permanente), true);
  assert.equal(permanente.getItem(CLAVE_IDENTIDAD), null);
  assert.deepEqual(leerIdentidad(usuarios, temporal, permanente), { usuarioId: 'u-101', rol: 'estudiante', recordar: false });
});

test('recordarme conserva la cuenta y cambiar de rol mantiene el mismo identificador', () => {
  const temporal = almacen(); const permanente = almacen();
  guardarIdentidad({ usuarioId: 'u-003', rol: 'tutor', recordar: true }, temporal, permanente);
  guardarIdentidad({ usuarioId: 'u-003', rol: 'estudiante', recordar: true }, temporal, permanente);
  assert.equal(temporal.getItem(CLAVE_IDENTIDAD), null);
  assert.deepEqual(leerIdentidad(usuarios, temporal, permanente), { usuarioId: 'u-003', rol: 'estudiante', recordar: true });
});

test('salir limpia ambas identidades y no elimina cuentas ni sesiones guardadas', () => {
  const temporal = almacen(); const permanente = almacen();
  temporal.setItem(CLAVE_IDENTIDAD, '{"usuarioId":"u-003","rol":"tutor"}');
  permanente.setItem(CLAVE_IDENTIDAD, '{"usuarioId":"u-003","rol":"tutor"}');
  permanente.setItem('tutorias.sesiones.v2', 'avance de HU5');
  permanente.setItem(CLAVE_CUENTAS, 'cuentas');
  guardarIdentidad(null, temporal, permanente);
  assert.equal(leerIdentidad(usuarios, temporal, permanente), null);
  assert.equal(permanente.getItem('tutorias.sesiones.v2'), 'avance de HU5');
  assert.equal(permanente.getItem(CLAVE_CUENTAS), 'cuentas');
});

test('no se restaura una cuenta o un rol inexistente del navegador', () => {
  const temporal = almacen(); const permanente = almacen();
  temporal.setItem(CLAVE_IDENTIDAD, 'JSON roto');
  permanente.setItem(CLAVE_IDENTIDAD, '{"usuarioId":"u-101","rol":"tutor"}');
  assert.equal(leerIdentidad(usuarios, temporal, permanente), null);
});

test('el almacenamiento bloqueado no deja una identidad inventada', () => {
  const bloqueado = { getItem() { throw new Error('bloqueado'); }, removeItem() { throw new Error('bloqueado'); } };
  assert.equal(leerIdentidad(usuarios, bloqueado, bloqueado), null);
  assert.equal(guardarIdentidad(null, bloqueado, bloqueado), false);
  assert.deepEqual(leerCuentas(bloqueado), []);
});

test('salir intenta limpiar el almacenamiento permanente aunque el temporal falle', () => {
  const temporal = { removeItem() { throw new Error('bloqueado'); } };
  const permanente = almacen();
  permanente.setItem(CLAVE_IDENTIDAD, '{"usuarioId":"u-003","rol":"tutor"}');
  assert.equal(guardarIdentidad(null, temporal, permanente), false);
  assert.equal(permanente.getItem(CLAVE_IDENTIDAD), null);
});

test('el registro local siempre crea estudiantes y no activa el rol de tutor', () => {
  const permanente = almacen();
  permanente.setItem(CLAVE_CUENTAS, JSON.stringify({ version: 1, usuarios: [{
    id: 'usr-prueba', nombres: 'Alumno', apellidos: 'Prueba', correo: valores.correo,
    rol: ['tutor', 'coordinador'], perfilTutor: { activo: true },
    credencial: { sal: 'a'.repeat(32), huella: 'b'.repeat(64) },
  }] }));
  const cuentas = leerCuentas(permanente);
  assert.deepEqual(cuentas[0].rol, ['estudiante']);
  assert.equal(cuentas[0].perfilTutor, null);
});

test('la redirección posterior al login solo utiliza rutas privadas internas permitidas', () => {
  assert.equal(destinoTrasIngreso('/sesiones/TU-2026-0184/cerrar', 'tutor'), '/sesiones/TU-2026-0184/cerrar');
  assert.equal(destinoTrasIngreso('https://otro.example', 'tutor'), '/sesiones');
  assert.equal(destinoTrasIngreso('//otro.example', 'estudiante'), '/mis-sesiones');
  assert.equal(destinoTrasIngreso('/solicitudes', 'estudiante'), '/mis-sesiones');
  assert.equal(destinoTrasIngreso('/sesiones/resumen', 'estudiante'), '/mis-sesiones');
  assert.equal(destinoTrasIngreso('/login', 'tutor'), '/sesiones');
});
