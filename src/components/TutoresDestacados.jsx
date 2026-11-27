import { Link } from "react-router-dom";
import { useTutores } from "../hooks/useTutores";
import TarjetaTutor from "./TarjetaTutor";

function TutoresDestacados() {
  const { tutores } = useTutores();

  const destacados = (tutores || [])
    .filter((t) => t.rol?.includes("tutor") && t.perfilTutor?.activo)
    .sort((a, b) => (b.perfilTutor?.promedio || 0) - (a.perfilTutor?.promedio || 0))
    .slice(0, 4);

  const lista = destacados.length > 0 ? destacados : (tutores || []).slice(0, 4);

  return (
    <section className="tutores-destacados">
      <div className="titulo-seccion">
        <h2>Tutores destacados</h2>
        <Link to="/tutores" className="titulo-seccion__enlace">
          Ver todo el directorio →
        </Link>
      </div>

      <div className="lista-tutores">
        {lista.map((tutor) => {
          const nombre = `${tutor.nombres} ${tutor.apellidos}`.trim();
          const perfil = tutor.perfilTutor || {};
          const cursos = (perfil.cursos || []).map((c) => c.codigo || c);
          return (
            <TarjetaTutor
              key={tutor.id}
              id={tutor.id}
              nombre={nombre}
              carrera={tutor.carrera}
              ciclo={tutor.ciclo}
              cursos={cursos}
              promedio={perfil.promedio ?? 4.8}
              totalSesiones={perfil.totalResenas ?? 25}
              modalidad={perfil.modalidad ?? "remota"}
              variante="destacado"
              mostrarBoton={true}
              fotoUrl={tutor.fotoUrl}
            />
          );
        })}
      </div>
    </section>
  );
}

export default TutoresDestacados;
