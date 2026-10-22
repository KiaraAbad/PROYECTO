import { Link, useLocation } from 'react-router-dom';
import './Footer.css';

function Footer({ sesiones = false, variante, rol }) {
  const { pathname } = useLocation();
  const esPublico = variante === 'publico' || pathname === '/';

  if (sesiones) return (
    <footer>
      <p>Programa de Tutorías entre Pares · Universidad de Lima</p>
      <div>
        <Link to="/sesiones/guia">Guía del tutor</Link>
        <Link to="/sesiones/ayuda">Ayuda</Link>
        <a href="mailto:tutorias@ulima.edu.pe">tutorias@ulima.edu.pe</a>
      </div>
    </footer>
  );

  return (
    <footer className="app-footer">
      <div className="app-footer__contenido">
        <p className="app-footer__copyright">Programa de Tutorías entre Pares · Universidad de Lima</p>
        <nav className="app-footer__enlaces" aria-label="Enlaces del pie de página">
          <Link to={rol === 'tutor' ? '/sesiones/guia' : '/tutores'} className="app-footer__link">
            {rol === 'tutor' ? 'Guía del tutor' : 'Directorio'}
          </Link>
          {esPublico
            ? <a href="/#como-funciona" className="app-footer__link">Cómo funciona</a>
            : <Link to="/sesiones/ayuda" className="app-footer__link">Ayuda</Link>}
          <a href="mailto:tutorias@ulima.edu.pe" className="app-footer__link app-footer__link--correo">tutorias@ulima.edu.pe</a>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
