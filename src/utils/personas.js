import datosTutores from "../data/tutores.json";
import datosEstudiantes from "../data/estudiantes.json";

export function buscarPersona(id) {
  const usuario =
    datosTutores.find((item) => item.id === id) ||
    datosEstudiantes.find((item) => item.id === id);

  if (!usuario) {
    return {
      id,
      nombreCompleto: "Usuario no disponible",
      nombreCorto: "Usuario",
      iniciales: "?",
      carrera: "",
      ciclo: null,
      promedio: null,
    };
  }

  return {
    id: usuario.id,
    nombreCompleto: `${usuario.nombres} ${usuario.apellidos}`,
    nombreCorto: `${usuario.nombres.split(" ")[0]} ${usuario.apellidos.split(" ")[0]}`,
    iniciales: `${usuario.nombres[0]}${usuario.apellidos[0]}`.toUpperCase(),
    carrera: usuario.carrera,
    ciclo: usuario.ciclo,
    promedio: usuario.perfilTutor ? usuario.perfilTutor.promedio : null,
  };
}
