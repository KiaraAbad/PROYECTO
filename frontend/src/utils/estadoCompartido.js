// HU-4 cambia la agenda; HU-5 guarda el desarrollo aparte, unido por el código.
export function crearCierreVacio(codigo) {
  return {
    sesionCodigo: codigo,
    asistenciaEstudiante: null,
    asistenciaTutor: null,
    duracionRealMin: 60,
    notas: '',
    temasPendientes: '',
    material: [],
    finalizado: false,
  };
}

export function enriquecerSesion(sesionBase, cierres, usuarios) {
  const cierre = cierres[sesionBase.codigo] ?? crearCierreVacio(sesionBase.codigo);
  return {
    ...sesionBase,
    cierre,
    tutor: usuarios.find(persona => persona.id === sesionBase.tutorId),
    estudiante: usuarios.find(persona => persona.id === sesionBase.estudianteId),
    estado: cierre.finalizado ? cierre.estadoFinal : sesionBase.estado,
    calificacion: sesionBase.calificacion ?? null,
  };
}

export function actualizarRegistro(datos, codigo, registro, actor) {
  const esNuevoCierre = registro.finalizado && !datos.cierres[codigo]?.finalizado;
  const sesiones = datos.sesiones.map(sesion => {
    if (sesion.codigo !== codigo || !esNuevoCierre) return sesion;
    const evento = {
      fecha: registro.cerradoEn,
      evento: `Cierre registrado · ${registro.estadoFinal === 'realizada' ? 'Realizada' : 'No asistió'}`,
      actor,
    };
    return { ...sesion, trazabilidad: [...(sesion.trazabilidad ?? []), evento] };
  });
  return { ...datos, sesiones, cierres: { ...datos.cierres, [codigo]: registro } };
}

export function aplicarResultadoAgenda(datos, resultado) {
  if (!resultado.ok) return datos;
  // Solo guardamos la sesión modificada, no las copias enriquecidas de la pantalla.
  const sesion = { ...resultado.sesion };
  delete sesion.cierre;
  delete sesion.tutor;
  delete sesion.estudiante;
  const existe = datos.sesiones.some(actual => actual.codigo === sesion.codigo);
  const sesiones = existe
    ? datos.sesiones.map(actual => actual.codigo === sesion.codigo ? sesion : actual)
    : [...datos.sesiones, sesion];
  return { ...datos, sesiones };
}
