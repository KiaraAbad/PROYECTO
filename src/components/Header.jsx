import { Link, useLocation } from 'react-router-dom';
import { useSesiones } from '../hooks/useSesiones';
import './Header.css';

function Header({ children, variante }) {
  const { usuario, rol, cambiarRol } = useSesiones();
  const { pathname } = useLocation();
  const esPublico = variante === 'publico' || pathname === '/';

  // HU-5 conserva su encabezado compacto; la identidad sigue siendo compartida.
  if (children) return <header className="hu5-header">{children}</header>;

  const enlaces = esPublico
    ? [{ texto: 'Inicio', ruta: '/' }, { texto: 'Directorio', ruta: '/tutores' }]
    : [
      { texto: 'Directorio', ruta: '/tutores' },
      ...(rol === 'tutor' ? [{ texto: 'Solicitudes', ruta: '/solicitudes' }] : []),
      { texto: 'Mis sesiones', ruta: '/mis-sesiones' },
      { texto: 'Historial', ruta: '/sesiones/historial' },
      ...(rol === 'tutor'
        ? [{ texto: 'Resumen de horas', ruta: '/sesiones/resumen' }]
        : [{ texto: 'Mis calificaciones', ruta: '/mis-calificaciones' }]),
    ];

  return (
    <header className={`app-header${esPublico ? ' app-header--publico' : ''}`}>
      <div className="app-header__izquierda">
        <Link to="/" className="app-header__logo">Tutorías entre pares</Link>
        <nav className="app-header__nav" aria-label="Navegación principal">
          {enlaces.map(enlace => {
            const activo = pathname === enlace.ruta
              || (enlace.ruta !== '/' && pathname.startsWith(`${enlace.ruta}/`));
            return (
              <Link key={enlace.ruta} to={enlace.ruta}
                className={`app-header__link${activo ? ' app-header__link--activo' : ''}`}
                aria-current={activo ? 'page' : undefined}>
                {enlace.texto}
              </Link>
            );
          })}
          {esPublico && <a href="/#como-funciona" className="app-header__link">Cómo funciona</a>}
        </nav>
      </div>
      {esPublico ? (
        <div className="app-header__acciones-publicas">
          <Link to="/login" className="app-header__btn-login">Iniciar sesión</Link>
          <Link to="/registro" className="app-header__btn-registro">Crear cuenta</Link>
          <Link to="/mis-sesiones" className="app-header__link">Mis sesiones</Link>
        </div>
      ) : (
        <div className="app-header__derecha">
          <div className="app-header__rol-switch" role="group" aria-label="Cambio de rol">
            {['estudiante', 'tutor'].map(opcion => (
              <button key={opcion} type="button" aria-pressed={rol === opcion}
                className={`app-header__rol-btn${rol === opcion ? ' app-header__rol-btn--activo' : ''}${rol === opcion && opcion === 'tutor' ? ' app-header__rol-btn--tutor' : ''}`}
                onClick={() => cambiarRol(opcion)}>
                {opcion === 'tutor' ? 'Tutor' : 'Estudiante'}
              </button>
            ))}
          </div>
          <div className="app-header__perfil" title={`${usuario.nombres} ${usuario.apellidos}`}>
            <div className="app-header__avatar" aria-hidden="true">{usuario.nombres[0]}{usuario.apellidos[0]}</div>
            <span className="app-header__usuario-nombre">{usuario.nombres.split(' ')[0]} {usuario.apellidos.split(' ')[0]}</span>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
