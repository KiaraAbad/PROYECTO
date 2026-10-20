import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from "./pages/Home";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Directorio from "./pages/Directorio";
import DetalleTutor from "./pages/DetalleTutor";
import NoEncontrada from "./pages/NoEncontrada";

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;