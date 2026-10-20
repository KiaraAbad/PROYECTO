import { Link, useLocation } from "react-router-dom";
import "./Footer.css";

function Footer({ variante }) {
  const location = useLocation();
  const esHome = variante === "publico" || location.pathname === "/";

  return (
    <footer className="app-footer">
      <div className="app-footer__contenido">
        <p className="app-footer__copyright">
          Programa de Tutorías entre Pares · Universidad de Lima
        </p>
        <nav className="app-footer__enlaces" aria-label="Enlaces del pie de página">
          <Link to="/tutores" className="app-footer__link">
            Directorio
          </Link>
          {esHome ? (
            <a href="/#como-funciona" className="app-footer__link">
              Cómo funciona
            </a>
          ) : (
            <a href="#ayuda" className="app-footer__link">
              Ayuda
            </a>
          )}
          <a href="#terminos" className="app-footer__link">
            Términos del programa
          </a>
          <a
            href="mailto:tutorias@ulima.edu.pe"
            className="app-footer__link app-footer__link--correo"
          >
            tutorias@ulima.edu.pe
          </a>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;