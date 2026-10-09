import { Link } from 'react-router-dom';
import Header from "../components/Header";
import Footer from "../components/Footer";
import Presentacion from "../components/Presentacion";
import TutoresDestacados from '../components/TutoresDestacados';

export function Home() {
  return (
    <div>
      <Header/>     
      <main>
        <Presentacion/>
        <TutoresDestacados/>
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
      <Footer/>
    </div>
  );
}

export default Home;