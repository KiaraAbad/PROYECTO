import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Registro from './pages/Registro';
import SesionesProvider from './context/SesionesProvider';
import SesionesLayout from './components/sesiones/SesionesLayout';
import HistorialSesiones from './pages/HistorialSesiones';
import ResumenHoras from './pages/ResumenHoras';
import CerrarSesion from './pages/CerrarSesion';
import MaterialCompartido from './pages/MaterialCompartido';
import DetalleCierreSesion from './pages/DetalleCierreSesion';
import PruebasSesiones from './pages/PruebasSesiones';
import AyudaSesiones from './pages/AyudaSesiones';
import Directorio from './pages/Directorio';
import DetalleTutor from './pages/DetalleTutor';
import NoEncontrada from './pages/NoEncontrada';
import MisCalificaciones from './pages/MisCalificaciones';
import CalificarSesion from './pages/CalificarSesion';
import FichaTutorReseñas from './pages/FichaTutorReseñas';
import MisSesiones from './pages/MisSesiones';
import Solicitudes from './pages/Solicitudes';
import DetalleSesion from './pages/DetalleSesion';

function App() {
  return (
    <BrowserRouter>
      <SesionesProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/tutores" element={<Directorio />} />
        <Route path="/tutores/:id" element={<DetalleTutor />} />
        <Route path="/ranking" element={<Navigate to="/tutores?vista=ranking" replace />} />
        <Route path="/mis-calificaciones" element={<MisCalificaciones />} />
        <Route path="/calificar" element={<CalificarSesion />} />
        <Route path="/tutor/:id" element={<FichaTutorReseñas />} />
        <Route path="/mis-sesiones" element={<MisSesiones />} />
        <Route path="/mis-sesiones/:codigo" element={<DetalleSesion />} />
        <Route path="/solicitudes" element={<Solicitudes />} />
        <Route path="/hu5" element={<Navigate to="/sesiones" replace />} />
        <Route path="/sesiones" element={<SesionesLayout />}>
          <Route index element={<HistorialSesiones />} />
          <Route path="historial" element={<HistorialSesiones historial />} />
          <Route path="resumen" element={<ResumenHoras />} />
          <Route path="guia" element={<AyudaSesiones guia />} />
          <Route path="ayuda" element={<AyudaSesiones />} />
          <Route
            path="pruebas"
            element={import.meta.env.DEV
              ? <PruebasSesiones />
              : <Navigate to="/sesiones" replace />}
          />
          <Route path=":codigo" element={<DetalleCierreSesion />} />
          <Route path=":codigo/cerrar" element={<CerrarSesion />} />
          <Route path=":codigo/material" element={<MaterialCompartido />} />
          <Route path="*" element={<Navigate to="/sesiones" replace />} />
        </Route>
        <Route path="*" element={<NoEncontrada />} />
      </Routes>
      </SesionesProvider>
    </BrowserRouter>
  );
}

export default App;
