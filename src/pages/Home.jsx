import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div>
      <header>
        <h2 className="logo">Tutorías entre pares</h2>
        <nav>
          <Link to="/">Inicio</Link>
          <Link to="/tutores">Directorio</Link>
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#">Preguntas frecuentes</a>
          <Link to="/login" className="boton-secundario">Iniciar sesión</Link>
          <Link to="/registro" className="boton-principal">Crear cuenta</Link>
        </nav>
      </header>

      <main>
        <section className="presentacion">
          <h1>
            Refuerza tus cursos con estudiantes que ya los dominan
          </h1>
          <p>
            Busca por curso, revisa la ficha del tutor y reserva un bloque
            de su disponibilidad semanal.
          </p>
          <div className="buscador">
            <input
              type="text"
              placeholder="Busca un curso: «Cálculo I» o «MA101»"
            />
            <button>Buscar</button>
          </div>
        </section>

        <section className="tutores-destacados">
          <div className="titulo-seccion">
            <h2>Tutores destacados</h2>
            <Link to="/tutores">Ver todo el directorio →</Link>
          </div>
          <div className="lista-tutores">
            <div className="tarjeta-tutor">
              <div className="foto-tutor">Foto</div>
              <h3>Nombre del tutor</h3>
              <p>Ingeniería de Sistemas · 7.º ciclo</p>
              <div className="cursos">
                <span>SI401</span>
                <span>MA101</span>
              </div>
              <p>
                <strong>4.8</strong> · 20 sesiones · remota
              </p>
            </div>
            <div className="tarjeta-tutor">
              <div className="foto-tutor">Foto</div>
              <h3>Nombre del tutor</h3>
              <p>Ingeniería Industrial · 8.º ciclo</p>
              <div className="cursos">
                <span>MA101</span>
                <span>FI202</span>
              </div>
              <p>
                <strong>4.7</strong> · 15 sesiones · presencial
              </p>
            </div>
            <div className="tarjeta-tutor">
              <div className="foto-tutor">Foto</div>
              <h3>Nombre del tutor</h3>
              <p>Economía · 9.º ciclo</p>
              <div className="cursos">
                <span>EC201</span>
              </div>
              <p>
                <strong>4.6</strong> · 12 sesiones · remota
              </p>
            </div>
            <div className="tarjeta-tutor">
              <div className="foto-tutor">Foto</div>
              <h3>Nombre del tutor</h3>
              <p>Ingeniería Civil · 8.º ciclo</p>
              <div className="cursos">
                <span>MA101</span>
              </div>
              <p>
                <strong>4.9</strong> · 25 sesiones · ambas
              </p>
            </div>
          </div>
        </section>

        <section className="como-funciona" id="como-funciona">
          <div className="pasos">
            <div className="paso">
              <div className="numero">1</div>
              <h3>Busca tu curso</h3>
              <p>
                Filtra por curso, carrera, modalidad y día de atención.
              </p>
            </div>
            <div className="paso">
              <div className="numero">2</div>
              <h3>Elige un bloque</h3>
              <p>
                Revisa la disponibilidad semanal del tutor
                y solicita la sesión.
              </p>
            </div>
            <div className="paso">
              <div className="numero">3</div>
              <h3>Estudia y califica</h3>
              <p>
                Al cerrar la sesión recibes el material
                y calificas al tutor.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <p>
          Programa de Tutorías entre Pares · Universidad de Lima
        </p>
        <div>
          <Link to="/tutores">Directorio</Link>
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#">Términos del programa</a>
          <a href="mailto:tutorias@ulima.edu.pe">tutorias@ulima.edu.pe</a>
        </div>
      </footer>
    </div>
  );
}

export default Home;