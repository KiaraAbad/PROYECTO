import { useState, useEffect } from "react";
import datosSesiones from "../data/sesiones.json";
import { buscarPersona } from "../utils/personas";
import {
  crearSolicitud,
  aceptarSolicitud,
  rechazarSolicitud,
  proponerHorario,
  aceptarPropuesta,
  rechazarPropuesta,
  cancelarSesion,
} from "../utils/reglasSesion";


let almacen = null;

function enriquecer(sesion) {
  return {
    ...sesion,
    tutor: buscarPersona(sesion.tutorId),
    estudiante: buscarPersona(sesion.estudianteId),
    calificacion: sesion.calificacion ?? null,
  };
}

export function useSesiones(usuarioId) {
  const [todas, setTodas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTodas(almacen ?? datosSesiones);
      setCargando(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  function aplicar(resultado) {
    if (!resultado.ok) return resultado;
    almacen = resultado.sesiones;
    setTodas(resultado.sesiones);
    return { ok: true, sesion: enriquecer(resultado.sesion) };
  }

  const sesiones = todas
    .filter((sesion) => sesion.tutorId === usuarioId || sesion.estudianteId === usuarioId)
    .map(enriquecer);

  return {
    todas,
    sesiones,
    cargando,
    solicitar: (datos) => aplicar(crearSolicitud(todas, datos, usuarioId)),
    aceptar: (codigo) => aplicar(aceptarSolicitud(todas, codigo, usuarioId)),
    rechazar: (codigo, motivo) => aplicar(rechazarSolicitud(todas, codigo, motivo, usuarioId)),
    proponer: (codigo, horario, mensaje) =>
      aplicar(proponerHorario(todas, codigo, horario, mensaje, usuarioId)),
    aceptarNuevoHorario: (codigo) => aplicar(aceptarPropuesta(todas, codigo, usuarioId)),
    rechazarNuevoHorario: (codigo) => aplicar(rechazarPropuesta(todas, codigo, usuarioId)),
    cancelar: (codigo) => aplicar(cancelarSesion(todas, codigo, usuarioId)),
  };
}
