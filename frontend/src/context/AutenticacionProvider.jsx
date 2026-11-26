import { useState } from 'react';
import { AutenticacionContext } from './AutenticacionContext';
import { usuariosDemo } from '../data/hu5-almacen';
import {
  CUENTAS_DEMO, CONTRASENA_DEMO, CLAVE_CUENTAS, normalizarCorreo,
  validarIngreso, validarRegistro, crearCredencial, comprobarCredencial,
  leerCuentas, leerIdentidad, guardarIdentidad,
} from '../utils/autenticacion';

function almacenes() {
  try { return { temporal: window.sessionStorage, permanente: window.localStorage }; }
  catch { return {}; }
}

function usuariosPublicos(cuentas) {
  const catalogo = usuariosDemo.map(persona => ({
    ...persona,
    correo: CUENTAS_DEMO.find(cuenta => cuenta.id === persona.id)?.correo ?? persona.correo,
  }));
  return [...catalogo, ...cuentas.map(cuenta => {
    const persona = { ...cuenta };
    delete persona.credencial;
    return { ...persona, nombreCompleto: `${persona.nombres} ${persona.apellidos}`, promedio: null };
  })];
}

export default function AutenticacionProvider({ children }) {
  const [cuentas, setCuentas] = useState(() => leerCuentas(almacenes().permanente));
  const usuarios = usuariosPublicos(cuentas);
  const [identidad, setIdentidad] = useState(() => {
    const { temporal, permanente } = almacenes();
    return leerIdentidad(usuarios, temporal, permanente);
  });
  const [aviso, setAviso] = useState('');
  const usuario = usuarios.find(persona => persona.id === identidad?.usuarioId) ?? null;

  function actualizarIdentidad(nueva) {
    const { temporal, permanente } = almacenes();
    if (!guardarIdentidad(nueva, temporal, permanente)) {
      setAviso('El navegador no permite conservar el acceso. Puede perderse al recargar.');
    } else setAviso('');
    setIdentidad(nueva);
  }

  async function ingresar(valores) {
    const errores = validarIngreso(valores);
    if (Object.keys(errores).length) return { ok: false, errores };
    const correo = normalizarCorreo(valores.correo);
    const demo = CUENTAS_DEMO.find(cuenta => cuenta.correo === correo);
    const cuenta = cuentas.find(cuenta => cuenta.correo === correo);
    const coincide = demo ? valores.contrasena === CONTRASENA_DEMO
      : cuenta && await comprobarCredencial(valores.contrasena, cuenta.credencial);
    if (!coincide) return { ok: false, errores: {}, mensaje: 'Correo o contraseña incorrectos.' };
    const persona = usuarios.find(persona => persona.id === (demo?.id ?? cuenta.id));
    const rol = persona.rol.includes('tutor') ? 'tutor' : 'estudiante';
    actualizarIdentidad({ usuarioId: persona.id, rol, recordar: Boolean(valores.recordar) });
    return { ok: true, rol };
  }

  async function registrar(valores) {
    const errores = validarRegistro(valores, [...CUENTAS_DEMO, ...cuentas].map(cuenta => cuenta.correo));
    if (Object.keys(errores).length) return { ok: false, errores };
    const nueva = {
      id: `usr-${crypto.randomUUID()}`,
      nombres: valores.nombres.trim(), apellidos: valores.apellidos.trim(),
      correo: normalizarCorreo(valores.correo), carrera: valores.carrera.trim(), ciclo: Number(valores.ciclo),
      rol: ['estudiante'], promedio: null, perfilTutor: null,
      credencial: await crearCredencial(valores.contrasena),
    };
    const actualizadas = [...cuentas, nueva];
    try {
      // Nunca guardamos la contraseña escrita. Solo la sal y su huella derivada.
      almacenes().permanente.setItem(CLAVE_CUENTAS, JSON.stringify({ version: 1, usuarios: actualizadas }));
    } catch {
      return { ok: false, errores: {}, mensaje: 'El navegador no permite guardar la cuenta. Habilita el almacenamiento para usar el registro local.' };
    }
    setCuentas(actualizadas);
    return { ok: true };
  }

  function cambiarRol(rol) {
    if (!usuario?.rol.includes(rol) || !['tutor', 'estudiante'].includes(rol)) return;
    actualizarIdentidad({ ...identidad, rol }); // Conserva el ID de la misma persona.
  }

  function salir() {
    actualizarIdentidad(null);
  }

  return <AutenticacionContext.Provider value={{
    usuario, usuarios, rol: identidad?.rol ?? null, ingresar, registrar, cambiarRol, salir, aviso,
  }}>{children}</AutenticacionContext.Provider>;
}
