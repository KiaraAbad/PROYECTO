import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAutenticacion } from '../hooks/useAutenticacion';
import Header from './Header';

export default function RutaPrivada({ roles, integrada = false }) {
  const { usuario, rol } = useAutenticacion();
  const ubicacion = useLocation();
  if (!usuario) return <Navigate to="/login" replace state={{ desde: ubicacion.pathname + ubicacion.search }} />;
  if (roles && !roles.includes(rol)) {
    return <>{!integrada && <Header />}<section className="acceso-denegado">
      <h1>Acceso denegado</h1><p>Tu rol activo no permite abrir esta pantalla.</p>
      <Link to="/mis-sesiones">Volver a mis sesiones</Link>
    </section></>;
  }
  return <Outlet />;
}
