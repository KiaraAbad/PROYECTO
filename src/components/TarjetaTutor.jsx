function TarjetaTutor({ nombre, carrera, cursos }) {
  return (
    <article className="tarjeta-tutor">
      <div className="foto-tutor">foto</div>
      <h3>{nombre}</h3>
      <p>{carrera}</p>
      <div className="cursos">
        {cursos.map((curso, index) => (
          <span key={index}>{curso}</span>
        ))}
      </div>
    </article>
  );
}

export default TarjetaTutor;