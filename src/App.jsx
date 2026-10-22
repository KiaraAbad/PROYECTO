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
import MiPerfilTutor from "./pages/MiPerfilTutor";
import MisCursosTutor from "./pages/MisCursosTutor.jsx";
import DisponibilidadTutor from "./pages/DisponibilidadTutor.jsx";

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
        <Route path="/mi-perfil-tutor/:id?" element={<MiPerfilTutor />} />
        <Route path="/mis-cursos-tutor/:id?" element={<MisCursosTutor />} />
        <Route path="/disponibilidad-tutor/:id?" element={<DisponibilidadTutor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;