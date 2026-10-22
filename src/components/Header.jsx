import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Header.css";

const ENLACES_ESTUDIANTE = [
  { texto: "Directorio", ruta: "/tutores" },
  { texto: "Mis sesiones", ruta: "/mis-sesiones" },
  { texto: "Mis calificaciones", ruta: "/mis-calificaciones" },
];

const ENLACES_TUTOR = [
  { texto: "Mi perfil de tutor", ruta: "/perfil-tutor" },
  { texto: "Mis cursos", ruta: "/mis-cursos" },
  { texto: "Disponibilidad", ruta: "/disponibilidad" },
  { texto: "Solicitudes", ruta: "/solicitudes" },
  { texto: "Mis sesiones", ruta: "/mis-sesiones" },
];

function Header({
  variante,
  usuario = { iniciales: "JM", nombre: "Joaquín M." },
  rolInicial = "estudiante",
}) {
  const [rol, setRol] = useState(rolInicial);
  const location = useLocation();

  const esHome = variante === "publico" || location.pathname === "/";
  const enlaces = rol === "tutor" ? ENLACES_TUTOR : ENLACES_ESTUDIANTE;
  const estaActivo = (ruta) =>
    location.pathname === ruta || location.pathname.startsWith(`${ruta}/`);

  // Encabezado público (Visitante / Landing Page)
  if (esHome) {
    return (
      <header className="app-header app-header--publico">
        <div className="app-header__izquierda">
          <Link to="/" className="app-header__logo">
            Tutorías entre pares
          </Link>
        </div>

        <nav className="app-header__nav app-header__nav--publico" aria-label="Navegación pública">
          <Link to="/" className="app-header__link app-header__link--activo">
            Inicio
          </Link>
          <Link to="/tutores" className="app-header__link">
            Directorio
          </Link>
          <a href="/#como-funciona" className="app-header__link">
            Cómo funciona
          </a>
          <a href="#preguntas-frecuentes" className="app-header__link">
            Preguntas frecuentes
          </a>
        </nav>

        <div className="app-header__acciones-publicas">
          <Link to="/login" className="app-header__btn-login">
            Iniciar sesión
          </Link>
          <Link to="/registro" className="app-header__btn-registro">
            Crear cuenta
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="app-header">
      <div className="app-header__izquierda">
        <Link to="/" className="app-header__logo">
          Tutorías entre pares
        </Link>

        <nav className="app-header__nav" aria-label="Navegación principal">
          {enlaces.map((enlace) => {
            const activo = estaActivo(enlace.ruta);
            return (
              <Link
                key={enlace.ruta}
                to={enlace.ruta}
                className={`app-header__link ${activo ? "app-header__link--activo" : ""}`}
                aria-current={activo ? "page" : undefined}
              >
                {enlace.texto}
                {activo && <span className="app-header__indicador" />}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="app-header__derecha">
        <div className="app-header__rol-switch" role="group" aria-label="Cambio de rol">
          <button
            type="button"
            className={`app-header__rol-btn ${rol === "estudiante" ? "app-header__rol-btn--activo" : ""}`}
            onClick={() => setRol("estudiante")}
          >
            Estudiante
          </button>
          <button
            type="button"
            className={`app-header__rol-btn ${rol === "tutor" ? "app-header__rol-btn--activo app-header__rol-btn--tutor" : ""}`}
            onClick={() => setRol("tutor")}
          >
            Tutor
          </button>
        </div>

        <div className="app-header__perfil">
          <div className="app-header__avatar" aria-hidden="true">
            {usuario.iniciales}
          </div>
          <button
            type="button"
            className="app-header__usuario-btn"
            aria-haspopup="menu"
            aria-expanded="false"
          >
            <span className="app-header__usuario-nombre">{usuario.nombre}</span>
            <span className="app-header__flecha" aria-hidden="true">▾</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;