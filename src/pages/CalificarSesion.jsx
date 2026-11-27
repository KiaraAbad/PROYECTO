import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAutenticacion } from '../hooks/useAutenticacion';
import valoracionesIniciales from '../data/ValoracionMock.json';
import '../styles/calificaciones.css';

export default function CalificarSesion() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { usuario } = useAutenticacion();
  const tutorId = params.get('tutorId') || 'u-001';
  const nombreTutor = params.get('tutorNombre') || 'Tutor';
  const curso = params.get('curso') || 'General';

  const [puntajeGeneral, setPuntajeGeneral] = useState(5);
  const [claridad, setClaridad] = useState(5);
  const [puntualidad, setPuntualidad] = useState(5);
  const [dominio, setDominio] = useState(5);
  const [comentario, setComentario] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const nuevaResena = {
      idCalificacion: Date.now(),
      idTutor: tutorId,
      nombreTutor,
      estudianteId: usuario?.id || 'u-101',
      curso,
      fecha: new Date().toISOString().slice(0, 10),
      puntajeGeneral,
      aspectos: { claridad, puntualidad, dominio },
      comentario: comentario.trim(),
    };

    try {
      const guardadas = localStorage.getItem('tutorias_calificaciones');
      const lista = guardadas ? JSON.parse(guardadas) : [...valoracionesIniciales];
      lista.unshift(nuevaResena);
      localStorage.setItem('tutorias_calificaciones', JSON.stringify(lista));
    } catch (err) {
      console.error('Error al guardar calificación:', err);
    }

    alert('¡Calificación guardada con éxito!');
    navigate('/mis-calificaciones');
  };

  return (
    <>
      <Header />
      <main className="main-calificacion">
        <section className="contenedor-formulario-calificacion">
          <h2>Califica tu Sesión de Tutoría</h2>
          <p>Ayuda a otros estudiantes compartiendo tu experiencia con el tutor.</p>
          
          <form onSubmit={handleSubmit} className="formulario-reseña">
                      
            <div className="campo">
              <label htmlFor="puntajeGeneral">Puntaje General (1 a 5):</label>
              <select 
                id="puntajeGeneral" 
                value={puntajeGeneral} 
                onChange={(e) => setPuntajeGeneral(Number(e.target.value))}
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5 - Excelente)</option>
                <option value={4}>⭐⭐⭐⭐ (4 - Muy bueno)</option>
                <option value={3}>⭐⭐⭐ (3 - Bueno)</option>
                <option value={2}>⭐⭐ (2 - Regular)</option>
                <option value={1}>⭐ (1 - Malo)</option>
              </select>
            </div>

            <fieldset className="aspectos-fieldset">
              <legend>Calificación por aspectos</legend>
              
              <div className="campo-aspecto">
                <label>Claridad en la explicación:</label>
                <input 
                  type="number" min="1" max="5" 
                  value={claridad} 
                  onChange={(e) => setClaridad(Number(e.target.value))} 
                />
              </div>

              <div className="campo-aspecto">
                <label>Puntualidad:</label>
                <input 
                  type="number" min="1" max="5" 
                  value={puntualidad} 
                  onChange={(e) => setPuntualidad(Number(e.target.value))} 
                />
              </div>

              <div className="campo-aspecto">
                <label>Dominio del tema:</label>
                <input 
                  type="number" min="1" max="5" 
                  value={dominio} 
                  onChange={(e) => setDominio(Number(e.target.value))} 
                />
              </div>
            </fieldset>

            <div className="campo">
              <label htmlFor="comentario">Comentario:</label>
              <textarea 
                id="comentario" 
                rows="4"
                placeholder="Escribe detalles sobre cómo te ayudó el tutor..."
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="boton-principal">
              Enviar Calificación
            </button>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
}
