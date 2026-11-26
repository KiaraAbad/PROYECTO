import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/detalle-tutor.css";

function NoEncontrada() {
  return (
    <div className="pagina-no-encontrada-wrapper">
      <Header />
      <main className="pagina-no-encontrada">
        <p>404</p>
        <h1>Página no encontrada</h1>
        <p>La página que buscas no existe o la dirección es incorrecta.</p>
        <Link to="/">Volver al inicio</Link>
      </main>
      <Footer />
    </div>
  );
}

export default NoEncontrada;
