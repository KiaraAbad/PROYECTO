export function obtenerResumenFiltros(filtros, cursos = []) {
  const resumen = [];

  if (filtros.busqueda?.trim()) {
    resumen.push({
      clave: "busqueda",
      etiqueta: `Búsqueda: ${filtros.busqueda.trim()}`,
    });
  }

  if (filtros.curso) {
    const curso = cursos.find(
      (item) => item.codigo === filtros.curso
    );

    resumen.push({
      clave: "curso",
      etiqueta: `Curso: ${curso?.nombre ?? filtros.curso}`,
    });
  }

  if (filtros.carrera) {
    resumen.push({
      clave: "carrera",
      etiqueta: `Carrera: ${filtros.carrera}`,
    });
  }

  if (filtros.modalidad) {
    resumen.push({
      clave: "modalidad",
      etiqueta: `Modalidad: ${filtros.modalidad}`,
    });
  }

  if (filtros.dia) {
    resumen.push({
      clave: "dia",
      etiqueta: `Día: ${filtros.dia}`,
    });
  }

  return resumen;
}
