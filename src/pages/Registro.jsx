import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Registro() {
  return (
    <>
      <Header />
      <main className="main-registro">
        <section className="contenedor-registro">
          <div className="formulario-registro">
            <h2>Crea tu cuenta</h2>
            <form>
              <div className="fila-nombres">
                <div className="campo">
                  <label htmlFor="nombres">NOMBRES</label>
                  <input
                    type="text"
                    id="nombres"
                    name="nombres"
                    placeholder="Camila Andrea"
                    required
                  />
                </div>
                <div className="campo">
                  <label htmlFor="apellidos">APELLIDOS</label>
                  <input
                    type="text"
                    id="apellidos"
                    name="apellidos"
                    placeholder="Quispe Andrade"
                    required
                  />
                </div>
              </div>

              <div className="campo">
                <label htmlFor="correo">CORREO INSTITUCIONAL</label>
                <input
                  type="email"
                  id="correo"
                  name="correo"
                  placeholder="tucorreo@aloe.ulima.edu.pe"
                  required
                />
              </div>

              <div className="fila-nombres">
                <div className="campo">
                  <label htmlFor="contrasena">CONTRASEÑA</label>
                  <input
                    type="password"
                    id="contrasena"
                    name="contrasena"
                    placeholder="Ingresa tu contraseña"
                    required
                  />
                </div>
                <div className="campo">
                  <label htmlFor="conf-contrasena">CONFIRMA CONTRASEÑA</label>
                  <input
                    type="password"
                    id="conf-contrasena"
                    name="conf-contrasena"
                    placeholder="Ingresa tu contraseña"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="boton-ingresar">
                Registrarse
              </button>
            </form>

            <p className="mensaje-correo">
              Solo se admiten correos @aloe.ulima.edu.pe y @ulima.edu.pe.
            </p>

            <p>
              ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}