import TarjetaTutor from './TarjetaTutor';

function TutoresDestacados() {
  const tutores = [
    { id: 1, nombre: "Camila Andrea", carrera: "Ing. de Sistemas", cursos: ["Prog. Web", "BD"] },
    { id: 2, nombre: "Carlos José", carrera: "Ing. Industrial", cursos: ["Estadística", "Física I"] },
    { id: 3, nombre: "Johan Mariano", carrera: "Ing. de Sistemas", cursos: ["Algoritmos", "Estructuras"] },
    { id: 4, nombre: "Michael Alessandro", carrera: "Administración", cursos: ["Contabilidad", "Finanzas"] },
  ];

  return (
    <section className="tutores-destacados">
      <div className="titulo-seccion">
        <h2>Tutores destacados</h2>
        <a href="#directorio">Ver todos los tutores &rarr;</a>
      </div>

      <div className="lista-tutores">
        {tutores.map((tutor) => (
          <TarjetaTutor 
            key={tutor.id}
            nombre={tutor.nombre} 
            carrera={tutor.carrera} 
            cursos={tutor.cursos} 
          />
        ))}
      </div>
    </section>
  );
}

export default TutoresDestacados;