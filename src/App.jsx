import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from "./pages/Home";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Directorio from "./pages/Directorio";
import DetalleTutor from "./pages/DetalleTutor";
import NoEncontrada from "./pages/NoEncontrada";
import MisCalificaciones from "./pages/MisCalificaciones";
import CalificarSesion from "./pages/CalificarSesion";
import FichaTutorReseñas from "./pages/FichaTutorReseñas";
import MisSesiones from "./pages/MisSesiones";
import Solicitudes from "./pages/Solicitudes";
import DetalleSesion from "./pages/DetalleSesion";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/tutores" element={<Directorio />} />
        <Route path="/tutores/:id" element={<DetalleTutor />} />
        <Route path="*" element={<NoEncontrada />} />
        <Route path="/ranking" element={<Navigate to="/tutores?vista=ranking" replace />} />
        <Route path="/mis-calificaciones" element={<MisCalificaciones />} />
        <Route path="/calificar" element={<CalificarSesion />} />
        <Route path="/tutor/:id" element={<FichaTutorReseñas />} />
        <Route path="/mis-sesiones" element={<MisSesiones />} />
        <Route path="/mis-sesiones/:codigo" element={<DetalleSesion />} />
        <Route path="/solicitudes" element={<Solicitudes />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;