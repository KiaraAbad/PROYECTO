import { Link } from "react-router-dom";
import TarjetaTutor from "./TarjetaTutor";

function TutoresDestacados() {
  const tutores = [
    {
      id: "u-002",
      nombre: "Camila Quispe Andrade",
      carrera: "Ing. Industrial",
      ciclo: 8,
      cursos: ["MA101", "ES210"],
      promedio: 4.8,
      totalSesiones: 31,
      modalidad: "ambas",
    },
    {
      id: "u-rodrigo",
      nombre: "Rodrigo Salazar Ferro",
      carrera: "Economía",
      ciclo: 9,
      cursos: ["EC201"],
      promedio: 4.6,
      totalSesiones: 24,
      modalidad: "remota",
    },
    {
      id: "u-001",
      nombre: "Ariana Flores Bustamante",
      carrera: "Ing. de Sistemas",
      ciclo: 7,
      cursos: ["SI401", "MA101"],
      promedio: 4.9,
      totalSesiones: 40,
      modalidad: "presencial",
    },
    {
      id: "u-003",
      nombre: "Sebastián Rojas Mendoza",
      carrera: "Ing. Civil",
      ciclo: 9,
      cursos: ["MA101", "FI202"],
      promedio: 4.7,
      totalSesiones: 28,
      modalidad: "remota",
    },
  ];

  return (
    <section className="tutores-destacados">
      <div className="titulo-seccion">
        <h2>Tutores destacados</h2>
        <Link to="/tutores" className="titulo-seccion__enlace">
          Ver todo el directorio →
        </Link>
      </div>

      <div className="lista-tutores">
        {tutores.map((tutor) => (
          <TarjetaTutor
            key={tutor.id}
            id={tutor.id}
            nombre={tutor.nombre}
            carrera={tutor.carrera}
            ciclo={tutor.ciclo}
            cursos={tutor.cursos}
            promedio={tutor.promedio}
            totalSesiones={tutor.totalSesiones}
            modalidad={tutor.modalidad}
            variante="destacado"
            mostrarBoton={false}
          />
        ))}
      </div>
    </section>
  );
}

export default TutoresDestacados;