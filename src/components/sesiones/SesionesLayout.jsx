import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';
import { useSesiones } from '../../hooks/useSesiones';
import '../../styles/hu5.css';
import '../../styles/hu5-cierre-material.css';
import '../../styles/hu5-listados.css';

export default function SesionesLayout() {
  const {
    rol,
    usuario,
    cambiarRol,
    notificacion,
    cerrarNotificacion,
  } = useSesiones();
  const { pathname } = useLocation();

  // El detalle, cierre y material mantienen activa la opción «Mis sesiones».
  const enHistorial = pathname === '/sesiones/historial'
    || pathname.startsWith('/sesiones/historial/');
  const enResumen = pathname === '/sesiones/resumen'
    || pathname.startsWith('/sesiones/resumen/');
  const enSubrutaDeSesiones = pathname.startsWith('/sesiones/');
  const enPruebas = pathname === '/sesiones/pruebas';
  const enAyuda = ['/sesiones/guia', '/sesiones/ayuda'].includes(pathname);
  const enMisSesiones = pathname === '/sesiones'
    || (enSubrutaDeSesiones && !enHistorial && !enResumen && !enPruebas && !enAyuda);

  function seleccionarRol(nuevoRol) {
    if (nuevoRol !== rol) {
      cambiarRol(nuevoRol);
    }
  }

  return (
    <div className="hu5-app">
      <Header>
        <Link to="/" className="hu5-brand">Tutorías entre pares</Link>
        <nav className="hu5-nav" aria-label="Navegación de sesiones">
          <NavLink to="/mis-sesiones">Agenda</NavLink>
          {rol === 'tutor' && <NavLink to="/solicitudes">Solicitudes</NavLink>}
          <Link
            to="/sesiones"
            className={enMisSesiones ? 'active' : undefined}
            aria-current={enMisSesiones ? 'page' : undefined}
          >
            Mis sesiones
          </Link>
          <NavLink to="/sesiones/historial">Historial</NavLink>
          {rol === 'tutor' && <NavLink to="/sesiones/resumen">Resumen de horas</NavLink>}
        </nav>
        <div className="hu5-role-switch" role="group" aria-label="Cambiar rol">
          {['estudiante', 'tutor'].map((rolDePrueba) => (
            <button
              type="button"
              key={rolDePrueba}
              aria-pressed={rol === rolDePrueba}
              onClick={() => seleccionarRol(rolDePrueba)}
            >
              {rolDePrueba === 'tutor' ? 'Tutor' : 'Estudiante'}
            </button>
          ))}
        </div>
        <span className="hu5-avatar" title={`${usuario.nombres} ${usuario.apellidos}`}>
          {usuario.nombres[0]}{usuario.apellidos[0]}
        </span>
      </Header>
      {notificacion && (
        <div
          className={`hu5-notification hu5-notification--${notificacion.tipo}`}
          role={notificacion.tipo === 'error' ? 'alert' : 'status'}
        >
          <span>{notificacion.mensaje}</span>
          <button type="button" aria-label="Cerrar aviso" onClick={cerrarNotificacion}>
            ×
          </button>
        </div>
      )}
      <main className="hu5-main">
        <Outlet />
      </main>
      <Footer sesiones />
    </div>
  );
}
