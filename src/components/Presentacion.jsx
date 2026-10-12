function Presentacion() {
  return (
    <section className="presentacion">
      <h1>Encuentra apoyo académico con compañeros de tu carrera</h1>
      <p>Conéctate con tutores destacados que ya aprobaron los cursos que estás llevando.</p>
      
      <div className="buscador">
        <input 
          type="text" 
          placeholder="Busca por curso, tema o tutor..." 
        />
        <button type="button">Buscar</button>
      </div>
    </section>
  );
}

export default Presentacion;