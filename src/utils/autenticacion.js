// Primera entrega: acceso simulado en este navegador, sin servidor ni correo real.
export const CLAVE_CUENTAS = 'tutorias.cuentas.v1';
export const CLAVE_IDENTIDAD = 'tutorias.identidad.v1';
export const CONTRASENA_DEMO = 'Tutorias2026!'; // Pública y solo para las cuentas de ejemplo.
export const CUENTAS_DEMO = [
  { id: 'u-003', correo: 'sebastian.rojas@aloe.ulima.edu.pe', etiqueta: 'Sebastián · tutor' },
  { id: 'u-101', correo: 'joaquin.medina@aloe.ulima.edu.pe', etiqueta: 'Joaquín · estudiante' },
];

export function normalizarCorreo(correo) {
  return String(correo ?? '').trim().toLowerCase();
}

export function validarIngreso({ correo, contrasena }) {
  const errores = {};
  if (!/^[^\s@]+@(aloe\.)?ulima\.edu\.pe$/i.test(normalizarCorreo(correo))) {
    errores.correo = 'Ingresa un correo @aloe.ulima.edu.pe o @ulima.edu.pe.';
  }
  if (!contrasena) errores.contrasena = 'Ingresa tu contraseña.';
  return errores;
}

export function validarRegistro(datos, correosExistentes = []) {
  const errores = validarIngreso(datos);
  for (const campo of ['nombres', 'apellidos', 'carrera']) {
    const valor = String(datos[campo] ?? '').trim();
    if (valor.length < 2 || valor.length > 100) errores[campo] = 'Escribe entre 2 y 100 caracteres.';
  }
  const ciclo = Number(datos.ciclo);
  if (!Number.isInteger(ciclo) || ciclo < 1 || ciclo > 12) errores.ciclo = 'Selecciona un ciclo del 1 al 12.';
  if (String(datos.contrasena ?? '').length < 8 || datos.contrasena.length > 128) {
    errores.contrasena = 'Usa entre 8 y 128 caracteres. No uses tu contraseña real en esta demo.';
  }
  if (!datos.confirmacion || datos.confirmacion !== datos.contrasena) errores.confirmacion = 'Las contraseñas no coinciden.';
  if (correosExistentes.some(correo => normalizarCorreo(correo) === normalizarCorreo(datos.correo))) {
    errores.correo = 'Este correo ya tiene una cuenta en la demo.';
  }
  return errores;
}

function bytesAHex(bytes) {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

async function calcularHuella(contrasena, sal) {
  const clave = await crypto.subtle.importKey('raw', new TextEncoder().encode(contrasena), 'PBKDF2', false, ['deriveBits']);
  const huella = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: sal, iterations: 100000, hash: 'SHA-256' }, clave, 256);
  return bytesAHex(new Uint8Array(huella));
}

export async function crearCredencial(contrasena) {
  const sal = crypto.getRandomValues(new Uint8Array(16));
  return { sal: bytesAHex(sal), huella: await calcularHuella(contrasena, sal) };
}

export async function comprobarCredencial(contrasena, credencial) {
  if (!/^[a-f0-9]{32}$/.test(credencial?.sal) || !/^[a-f0-9]{64}$/.test(credencial?.huella)) return false;
  const sal = Uint8Array.from(credencial.sal.match(/../g), byte => parseInt(byte, 16));
  return await calcularHuella(contrasena, sal) === credencial.huella;
}

export function leerCuentas(almacen) {
  try {
    const datos = JSON.parse(almacen.getItem(CLAVE_CUENTAS));
    if (datos?.version !== 1 || !Array.isArray(datos.usuarios)) return [];
    return datos.usuarios.filter(persona => typeof persona.id === 'string'
      && persona.id.startsWith('usr-') && typeof persona.nombres === 'string'
      && typeof persona.apellidos === 'string' && typeof persona.correo === 'string'
      && /^[a-f0-9]{32}$/.test(persona.credencial?.sal)
      && /^[a-f0-9]{64}$/.test(persona.credencial?.huella))
      .map(persona => ({ ...persona, rol: ['estudiante'], perfilTutor: null, promedio: null }));
  } catch {
    return [];
  }
}

export function identidadValida(identidad, usuarios) {
  const usuario = usuarios.find(persona => persona.id === identidad?.usuarioId);
  return Boolean(usuario && ['estudiante', 'tutor'].includes(identidad.rol)
    && usuario.rol.includes(identidad.rol));
}

export function leerIdentidad(usuarios, temporal, permanente) {
  for (const almacen of [temporal, permanente]) {
    try {
      const identidad = JSON.parse(almacen.getItem(CLAVE_IDENTIDAD));
      if (identidadValida(identidad, usuarios)) {
        return { ...identidad, recordar: almacen === permanente };
      }
    } catch { /* Si no hay almacenamiento disponible, se inicia como visitante. */ }
  }
  return null;
}

export function guardarIdentidad(identidad, temporal, permanente) {
  let guardado = true;
  // Intentamos limpiar ambos almacenes aunque uno esté bloqueado.
  for (const almacen of [temporal, permanente]) {
    try { almacen.removeItem(CLAVE_IDENTIDAD); } catch { guardado = false; }
  }
  try {
    if (identidad) {
      const destino = identidad.recordar ? permanente : temporal;
      destino.setItem(CLAVE_IDENTIDAD, JSON.stringify({ usuarioId: identidad.usuarioId, rol: identidad.rol }));
    }
    return guardado;
  } catch {
    return false;
  }
}

export function destinoTrasIngreso(desde, rol) {
  if (typeof desde === 'string' && /^\/(sesiones|mis-sesiones|solicitudes|mis-calificaciones|calificar)(\/|\?|$)/.test(desde)
    && (rol === 'tutor' || !/^\/(solicitudes|sesiones\/resumen)(\/|\?|$)/.test(desde))) return desde;
  return rol === 'tutor' ? '/sesiones' : '/mis-sesiones';
}
