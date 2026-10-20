import { Link } from "react-router-dom";
import "../styles/detalle-tutor.css";

function NoEncontrada() {
  return (
    <main className="pagina-no-encontrada">
      <p>404</p>
      <h1>Página no encontrada</h1>
      <p>La página que buscas no existe o la dirección es incorrecta.</p>
      <Link to="/">Volver al inicio</Link>
    </main>
  );
}

export default NoEncontrada;