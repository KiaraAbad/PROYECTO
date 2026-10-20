import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Presentacion() {
  const [termino, setTermino] = useState("");
  const navigate = useNavigate();

  const handleBuscar = (e) => {
    e.preventDefault();
    navigate("/tutores");
  };

  return (
    <section className="presentacion">
      <h1>Refuerza tus cursos con estudiantes que ya los dominan</h1>
      <p>
        Busca por curso, revisa la ficha del tutor y reserva un bloque de su disponibilidad semanal.
      </p>

      <form className="buscador" onSubmit={handleBuscar}>
        <input
          type="text"
          placeholder="Busca un curso: «Cálculo I» o «MA101»"
          value={termino}
          onChange={(e) => setTermino(e.target.value)}
        />
        <button type="submit">Buscar</button>
      </form>
    </section>
  );
}

export default Presentacion;