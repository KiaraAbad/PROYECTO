import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import EstrellasRating from '../components/EstrellasRating';
import '../styles/calificaciones.css';

export default function RankingTutores() {

  const [tutoresRanked] = useState([
    { id: 1, nombre: "Carlos Mendoza", curso: "Cálculo II", carrera: "Ingeniería de Sistemas", promedio: 4.9, totalReseñas: 15 },
    { id: 2, nombre: "Ana Torres", curso: "Programación Web", carrera: "Ingeniería de Sistemas", promedio: 4.8, totalReseñas: 12 },
    { id: 3, nombre: "Luis Silva", curso: "Estadística I", carrera: "Administración", promedio: 4.6, totalReseñas: 10 }
  ]);

  const [filtroCurso, setFiltroCurso] = useState('');

  const tutoresFiltrados = tutoresRanked.filter(tutor => 
    tutor.curso.toLowerCase().includes(filtroCurso.toLowerCase())
  );

  return (
    <>
      <Header />
      <main className="main-ranking">
        <section className="contenedor-ranking">
          <h2>Ranking de Tutores</h2>
          <p>Consulta los tutores mejor valorados por la comunidad de la Universidad de Lima.</p>

          <div className="filtros-busqueda">
            <input 
              type="text" 
              placeholder="Filtrar por curso (ej. Cálculo)..." 
              value={filtroCurso}
              onChange={(e) => setFiltroCurso(e.target.value)}
            />
          </div>

          <div className="tabla-ranking">
            {tutoresFiltrados.map((tutor, index) => (
              <div key={tutor.id} className="tarjeta-ranking-item">
                <span className="posicion">#{index + 1}</span>
                <div className="info-tutor-ranking">
                  <h3>{tutor.nombre}</h3>
                  <p><strong>Curso:</strong> {tutor.curso} | <strong>Carrera:</strong> {tutor.carrera}</p>
                </div>
                <div className="calificacion-ranking">
                  <EstrellasRating rating={Math.round(tutor.promedio)} readonly={true} />
                  <span>{tutor.promedio} ({tutor.totalReseñas} reseñas)</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
