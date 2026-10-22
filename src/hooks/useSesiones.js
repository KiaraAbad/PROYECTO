import { useContext } from 'react';
import { SesionesContext } from '../context/SesionesContext';

export function useSesiones(usuarioId) {
  // Este hook permite leer el estado y las funciones compartidas por el Provider.
  const contexto = useContext(SesionesContext);

  if (!contexto) {
    throw new Error('useSesiones necesita SesionesProvider.');
  }

  // Sin argumento: API de HU-5. Con identificador: API de agenda de HU-4.
  // Ambas leen el mismo Context; ya no existe un almacén de agenda separado.
  if (usuarioId === undefined) return contexto;
  const esUsuarioActivo = usuarioId === contexto.usuario.id;
  function operar(accion, ...argumentos) {
    if (!esUsuarioActivo) {
      return { ok: false, error: { codigo: 'PERMISO', mensaje: 'Selecciona tu usuario activo.', campos: {} } };
    }
    return contexto.operarAgenda(accion, ...argumentos);
  }
  return {
    todas: contexto.sesiones,
    sesiones: esUsuarioActivo ? contexto.sesionesUsuario : [],
    cargando: false,
    solicitar: datos => operar('solicitar', datos),
    aceptar: codigo => operar('aceptar', codigo),
    rechazar: (codigo, motivo) => operar('rechazar', codigo, motivo),
    proponer: (codigo, horario, mensaje) => operar('proponer', codigo, horario, mensaje),
    aceptarNuevoHorario: codigo => operar('aceptarNuevoHorario', codigo),
    rechazarNuevoHorario: codigo => operar('rechazarNuevoHorario', codigo),
    cancelar: codigo => operar('cancelar', codigo),
  };
}
