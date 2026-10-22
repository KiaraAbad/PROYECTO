import { useEffect, useRef, useState } from 'react';
import { SesionesContext } from './SesionesContext';
import {
  cargarDatosDemo,
  crearDatosDemo,
  CLAVE_ALMACEN,
  usuariosDemo,
} from '../data/hu5-almacen';
import { validarCierre, validarMaterial, ventanaCierre } from '../utils/sesiones';
import { crearCierreVacio, enriquecerSesion, actualizarRegistro, aplicarResultadoAgenda } from '../utils/estadoCompartido';
import {
  crearSolicitud, aceptarSolicitud, rechazarSolicitud, proponerHorario,
  aceptarPropuesta, rechazarPropuesta, cancelarSesion,
} from '../utils/reglasSesion';

// La agenda y los cierres consultan una sola fuente, compartida por toda la app.
export default function SesionesProvider({ children }) {
  const [datos, setDatos] = useState(cargarDatosDemo);
  const [rol, setRol] = useState('tutor');
  const [usuarioId, setUsuarioId] = useState('u-003');
  const [notificacion, setNotificacion] = useState(null);

  // Un ref conserva el último valor sin esperar el siguiente render de React.
  // Así, dos operaciones seguidas no trabajan con una versión anterior del cierre.
  const datosActuales = useRef(datos);
  const avisoAlmacenamientoMostrado = useRef(false);
  const usuario = usuariosDemo.find(usuarioDemo => usuarioDemo.id === usuarioId);

  const sesiones = datos.sesiones.map(sesionBase => (
    enriquecerSesion(sesionBase, datos.cierres, usuariosDemo)
  ));

  const sesionesUsuario = sesiones.filter(sesion => {
    if (rol === 'tutor') {
      return sesion.tutorId === usuarioId;
    }

    return sesion.estudianteId === usuarioId;
  });

  // Cuando cambian los datos, guardamos una copia en este navegador.
  // JSON.stringify convierte el objeto a texto para localStorage.
  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_ALMACEN, JSON.stringify(datos));
    } catch {
      if (!avisoAlmacenamientoMostrado.current) {
        avisoAlmacenamientoMostrado.current = true;
        setNotificacion({
          id: 'storage',
          tipo: 'warning',
          mensaje: 'El navegador no permite guardar datos. Puedes usar la demo, pero los cambios se perderán al recargar.',
        });
      }
    }
  }, [datos]);

  function notificar(mensaje, tipo = 'success') {
    setNotificacion({ id: crypto.randomUUID(), mensaje, tipo });
  }

  function cerrarNotificacion() {
    setNotificacion(null);
  }

  function cambiarRol(nuevoRol) {
    if (!['tutor', 'estudiante'].includes(nuevoRol)) {
      return;
    }

    setRol(nuevoRol);
    setUsuarioId(nuevoRol === 'tutor' ? 'u-003' : 'u-101');
    setNotificacion(null);
  }

  function cambiarUsuario(id) {
    const usuarioPermitido = usuariosDemo.some(usuarioDemo => {
      return usuarioDemo.id === id && usuarioDemo.rol.includes(rol);
    });

    if (!usuarioPermitido) {
      return;
    }

    setUsuarioId(id);
    setNotificacion(null);
  }

  function reiniciarDemo() {
    const nuevosDatos = crearDatosDemo();
    datosActuales.current = nuevosDatos;
    setDatos(nuevosDatos);
    setRol('tutor');
    setUsuarioId('u-003');
    notificar('Datos de ejemplo restablecidos. Ya puedes probar otro cierre.');
  }

  // La pantalla oculta los botones que no corresponden al usuario.
  // También comprobamos el permiso aquí, antes de modificar cualquier registro.
  function comprobarAccesoTutor(codigo, { cierre = false } = {}) {
    const sesionBase = datosActuales.current.sesiones.find(sesion => sesion.codigo === codigo);

    if (!sesionBase || rol !== 'tutor' || sesionBase.tutorId !== usuarioId) {
      return {
        ok: false,
        errores: {},
        mensaje: 'Solo el tutor de esta sesión puede modificarla.',
      };
    }

    const registro = datosActuales.current.cierres[codigo] ?? crearCierreVacio(codigo);
    const sesion = {
      ...sesionBase,
      cierre: registro,
      estado: registro.finalizado ? registro.estadoFinal : sesionBase.estado,
    };

    if (sesion.estado === 'cancelada') {
      return {
        ok: false,
        errores: {},
        mensaje: 'Una sesión cancelada no admite cambios.',
      };
    }

    if (cierre) {
      const ventana = ventanaCierre(sesion);

      if (!ventana.habilitado) {
        return { ok: false, errores: {}, mensaje: ventana.motivo };
      }
    }

    return { ok: true, sesion };
  }

  function guardarRegistro(codigo, registro, mensaje) {
    const actor = `${usuario.nombres} ${usuario.apellidos}`;
    const nuevosDatos = actualizarRegistro(datosActuales.current, codigo, registro, actor);

    datosActuales.current = nuevosDatos;
    setDatos(nuevosDatos);
    notificar(mensaje);

    return { ok: true, errores: {}, mensaje };
  }

  function operarAgenda(accion, ...argumentos) {
    const operaciones = {
      solicitar: { rol: 'estudiante', ejecutar: crearSolicitud },
      aceptar: { rol: 'tutor', ejecutar: aceptarSolicitud },
      rechazar: { rol: 'tutor', ejecutar: rechazarSolicitud },
      proponer: { ejecutar: proponerHorario },
      aceptarNuevoHorario: { ejecutar: aceptarPropuesta },
      rechazarNuevoHorario: { ejecutar: rechazarPropuesta },
      cancelar: { ejecutar: cancelarSesion },
    };
    const operacion = operaciones[accion];
    if (!operacion || (operacion.rol && operacion.rol !== rol)) {
      return { ok: false, error: { codigo: 'PERMISO', mensaje: 'Tu rol no permite esta acción.', campos: {} } };
    }
    // Usamos el ref para comprobar siempre el estado más reciente, incluso tras otro evento.
    const actuales = datosActuales.current;
    const todas = actuales.sesiones.map(sesion => enriquecerSesion(sesion, actuales.cierres, usuariosDemo));
    if (accion !== 'solicitar') {
      const sesion = todas.find(actual => actual.codigo === argumentos[0]);
      const idParticipante = rol === 'tutor' ? sesion?.tutorId : sesion?.estudianteId;
      if (!sesion || idParticipante !== usuarioId) {
        return { ok: false, error: { codigo: 'PERMISO', mensaje: 'La sesión no pertenece a tu usuario y rol activos.', campos: {} } };
      }
    }
    const resultado = operacion.ejecutar(todas, ...argumentos, usuarioId);
    if (!resultado.ok) return resultado;
    const nuevosDatos = aplicarResultadoAgenda(actuales, resultado);
    datosActuales.current = nuevosDatos;
    setDatos(nuevosDatos);
    return { ok: true, sesion: enriquecerSesion(resultado.sesion, nuevosDatos.cierres, usuariosDemo) };
  }

  function guardarBorrador(codigo, valores) {
    const acceso = comprobarAccesoTutor(codigo, { cierre: true });

    if (!acceso.ok) {
      notificar(acceso.mensaje, 'error');
      return acceso;
    }

    const errores = validarCierre(valores, { borrador: true });

    if (Object.keys(errores).length > 0) {
      return { ok: false, errores, mensaje: 'Revisa los campos indicados.' };
    }

    const borrador = {
      ...acceso.sesion.cierre,
      asistenciaEstudiante: typeof valores.asistenciaEstudiante === 'boolean'
        ? valores.asistenciaEstudiante
        : null,
      asistenciaTutor: typeof valores.asistenciaTutor === 'boolean'
        ? valores.asistenciaTutor
        : null,
      duracionRealMin: Number(valores.duracionRealMin),
      notas: String(valores.notas ?? ''),
      temasPendientes: String(valores.temasPendientes ?? ''),
      actualizadoEn: new Date().toISOString(),
    };

    return guardarRegistro(codigo, borrador, 'Borrador guardado. La sesión sigue programada.');
  }

  function cerrarSesion(codigo, valores) {
    const acceso = comprobarAccesoTutor(codigo, { cierre: true });

    if (!acceso.ok) {
      notificar(acceso.mensaje, 'error');
      return acceso;
    }

    const errores = validarCierre(valores);

    if (Object.keys(errores).length > 0) {
      return { ok: false, errores, mensaje: 'Revisa los campos indicados.' };
    }

    const ambosAsistieron = valores.asistenciaEstudiante && valores.asistenciaTutor;
    const estadoFinal = ambosAsistieron ? 'realizada' : 'no-asistio';
    const cierreFinal = {
      ...acceso.sesion.cierre,
      asistenciaEstudiante: valores.asistenciaEstudiante,
      asistenciaTutor: valores.asistenciaTutor,
      duracionRealMin: ambosAsistieron ? Number(valores.duracionRealMin) : 0,
      notas: ambosAsistieron ? String(valores.notas).trim() : '',
      temasPendientes: ambosAsistieron ? String(valores.temasPendientes ?? '').trim() : '',
      finalizado: true,
      estadoFinal,
      cerradoEn: new Date().toISOString(),
    };
    const mensaje = ambosAsistieron
      ? 'Sesión cerrada como realizada. El historial y las horas se actualizaron.'
      : 'Sesión cerrada como no asistió. No se sumaron horas.';

    return guardarRegistro(codigo, cierreFinal, mensaje);
  }

  function guardarMaterial(codigo, material) {
    const acceso = comprobarAccesoTutor(codigo);

    if (!acceso.ok) {
      notificar(acceso.mensaje, 'error');
      return acceso;
    }

    const errores = validarMaterial(material);

    if (Object.keys(errores).length > 0) {
      return { ok: false, errores, mensaje: 'Revisa los campos indicados.' };
    }

    const materialesActuales = acceso.sesion.cierre.material;
    const existeMaterial = materialesActuales.some(recurso => recurso.id === material.id);

    if (material.id && !existeMaterial) {
      return { ok: false, errores: {}, mensaje: 'El enlace ya no existe.' };
    }

    const recurso = {
      id: material.id || crypto.randomUUID(),
      titulo: material.titulo.trim(),
      url: material.url.trim(),
      descripcion: String(material.descripcion ?? '').trim(),
    };
    let materialesActualizados;
    let mensaje;

    if (material.id) {
      // map devuelve otra lista: solo reemplazamos el recurso que se está editando.
      materialesActualizados = materialesActuales.map(materialActual => {
        if (materialActual.id === material.id) {
          return recurso;
        }

        return materialActual;
      });
      mensaje = 'Enlace actualizado.';
    } else {
      materialesActualizados = [...materialesActuales, recurso];
      mensaje = 'Enlace agregado. El estudiante ya puede consultarlo.';
    }

    const cierreActualizado = {
      ...acceso.sesion.cierre,
      material: materialesActualizados,
    };

    return guardarRegistro(codigo, cierreActualizado, mensaje);
  }

  function eliminarMaterial(codigo, id) {
    const acceso = comprobarAccesoTutor(codigo);

    if (!acceso.ok) {
      notificar(acceso.mensaje, 'error');
      return acceso;
    }

    const materialesActuales = acceso.sesion.cierre.material;
    const existeMaterial = materialesActuales.some(material => material.id === id);

    if (!existeMaterial) {
      return { ok: false, errores: {}, mensaje: 'El enlace ya no existe.' };
    }

    const cierreActualizado = {
      ...acceso.sesion.cierre,
      material: materialesActuales.filter(material => material.id !== id),
    };

    return guardarRegistro(codigo, cierreActualizado, 'Enlace eliminado.');
  }

  function obtenerUsuario(id) {
    return usuariosDemo.find(usuarioDemo => usuarioDemo.id === id);
  }

  function obtenerSesion(codigo) {
    return sesionesUsuario.find(sesion => sesion.codigo === codigo);
  }

  // Estas son las variables y funciones que las pantallas leen con useSesiones().
  const valorCompartido = {
    sesiones,
    sesionesUsuario,
    usuarios: usuariosDemo,
    usuario,
    rol,
    cambiarRol,
    cambiarUsuario,
    reiniciarDemo,
    obtenerUsuario,
    obtenerSesion,
    guardarBorrador,
    cerrarSesion,
    guardarMaterial,
    eliminarMaterial,
    operarAgenda,
    notificar,
    notificacion,
    cerrarNotificacion,
  };

  // Cambiar la key reinicia los formularios al cambiar de usuario o de rol.
  // Así no quedan visibles los campos que estaba completando otra persona.
  return (
    <SesionesContext.Provider value={valorCompartido}>
      <div key={`${rol}-${usuarioId}`}>{children}</div>
    </SesionesContext.Provider>
  );
}
