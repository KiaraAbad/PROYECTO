import { Outlet } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';
import { useSesiones } from '../../hooks/useSesiones';
import '../../styles/sesiones-comun.css';
import '../../styles/hu5.css';
import '../../styles/hu5-cierre-material.css';
import '../../styles/hu5-listados.css';

export default function SesionesLayout() {
  const { rol, notificacion, cerrarNotificacion } = useSesiones();

  return (
    <div className="agenda-page">
      <Header />
      <div className="hu5-app">
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
      </div>
      <Footer rol={rol} />
    </div>
  );
}
