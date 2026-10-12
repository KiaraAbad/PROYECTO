import { Link } from 'react-router-dom';
import Header from '../components/Header';

export function Login() {
  return (
    <div className="login-container">
      <Header/> 

      <main className="main-login">
        <section className="contenedor-login">
          <div className="informacion-login">
            <h1>Vuelve a tus sesiones de tutoría</h1>
            <p>
              Ingresa con tu correo institucional para solicitar sesiones,
              revisar tu agenda y calificar a tus tutores.
            </p>
            <p>
              <strong>¿Aún no tienes cuenta?</strong>{' '}
              <Link to="/Registro">Crear cuenta</Link>
            </p>
          </div>

          <div className="formulario-login">
            <h2>Inicia sesión</h2>
            <form>
              <label htmlFor="correo">
                CORREO INSTITUCIONAL
              </label>
              <input
                type="email"
                id="correo"
                name="correo"
                placeholder="tucorreo@aloe.ulima.edu.pe"
                required
              />

              <label htmlFor="contrasena">
                CONTRASEÑA
              </label>
              <input
                type="password"
                id="contrasena"
                name="contrasena"
                placeholder="Ingresa tu contraseña"
                required
              />

              <div className="opciones-login">
                <div>
                  <input
                    type="checkbox"
                    id="recordar"
                    name="recordar"
                  />
                  <label htmlFor="recordar">
                    Recordarme en este equipo
                  </label>
                </div>
                <Link to="/recuperar">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <button type="submit" className="boton-ingresar">
                Ingresar
              </button>
            </form>
            <p className="mensaje-correo">
              Solo se admiten correos @aloe.ulima.edu.pe y @ulima.edu.pe.
            </p>
          </div>
        </section>
      </main>

      <footer>
        <p>
          Programa de Tutorías entre Pares · Universidad de Lima
        </p>
        <div>
          <a href="#">Términos del programa</a>
          <a href="mailto:tutorias@ulima.edu.pe">tutorias@ulima.edu.pe</a>
        </div>
      </footer>
    </div>
  );
}

export default Login;