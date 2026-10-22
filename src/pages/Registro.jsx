import { useState } from 'react';
import { Link, Navigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ErrorCampo from '../components/ErrorCampo';
import { useAutenticacion } from '../hooks/useAutenticacion';
import '../styles/cuenta.css';

export default function Registro() {
  const { usuario, registrar } = useAutenticacion();
  const [datos, setDatos] = useState({ nombres: '', apellidos: '', correo: '', contrasena: '', confirmacion: '', carrera: '', ciclo: '' });
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [registrado, setRegistrado] = useState(false);
  if (usuario) return <Navigate to="/mis-sesiones" replace />;
  if (registrado) return <Navigate to="/login" state={{ correo: datos.correo, registroExitoso: true }} replace />;

  function cambiar(evento) {
    setDatos(actual => ({ ...actual, [evento.target.name]: evento.target.value }));
  }
  async function enviar(evento) {
    evento.preventDefault(); setEnviando(true); setMensaje('');
    try {
      const resultado = await registrar(datos);
      setErrores(resultado.errores ?? {});
      if (resultado.ok) setRegistrado(true);
      else setMensaje(resultado.mensaje ?? 'Revisa los campos indicados.');
    } catch {
      setMensaje('No se pudo crear la cuenta local. Inténtalo en un navegador con almacenamiento disponible.');
    } finally { setEnviando(false); }
  }

  return (
    <>
      <Header />
      <main className="main-registro">
        <section className="contenedor-registro">
          <div className="formulario-registro">
            <h2>Crea tu cuenta</h2>
            <p className="cuenta-aviso">Registro local de estudiante. No uses una contraseña real; esta demo no tiene servidor ni envía correos.</p>
            {mensaje && <p className="cuenta-error" role="alert">{mensaje}</p>}
            <form onSubmit={enviar} noValidate>
              <div className="fila-nombres">
                <div className="campo">
                  <label htmlFor="nombres">NOMBRES</label>
                  <input
                    type="text"
                    id="nombres"
                    name="nombres"
                    placeholder="Camila Andrea"
                    value={datos.nombres} onChange={cambiar} maxLength={100}
                    aria-invalid={Boolean(errores.nombres)} aria-describedby={errores.nombres ? 'error-nombres' : undefined}
                    required
                  />
                  <ErrorCampo id="error-nombres" mensaje={errores.nombres} />
                </div>
                <div className="campo">
                  <label htmlFor="apellidos">APELLIDOS</label>
                  <input
                    type="text"
                    id="apellidos"
                    name="apellidos"
                    placeholder="Quispe Andrade"
                    value={datos.apellidos} onChange={cambiar} maxLength={100}
                    aria-invalid={Boolean(errores.apellidos)} aria-describedby={errores.apellidos ? 'error-apellidos' : undefined}
                    required
                  />
                  <ErrorCampo id="error-apellidos" mensaje={errores.apellidos} />
                </div>
              </div>

              <div className="campo">
                <label htmlFor="correo">CORREO INSTITUCIONAL</label>
                <input
                  type="email"
                  id="correo"
                  name="correo"
                  placeholder="tucorreo@aloe.ulima.edu.pe"
                  value={datos.correo} onChange={cambiar} autoComplete="username"
                  aria-invalid={Boolean(errores.correo)} aria-describedby={errores.correo ? 'error-correo' : undefined}
                  required
                />
                <ErrorCampo id="error-correo" mensaje={errores.correo} />
              </div>

              <div className="fila-nombres">
                <div className="campo">
                  <label htmlFor="contrasena">CONTRASEÑA</label>
                  <input
                    type="password"
                    id="contrasena"
                    name="contrasena"
                    placeholder="Ingresa tu contraseña"
                    value={datos.contrasena} onChange={cambiar} maxLength={128} autoComplete="new-password"
                    aria-invalid={Boolean(errores.contrasena)} aria-describedby={errores.contrasena ? 'error-contrasena' : undefined}
                    required
                  />
                  <ErrorCampo id="error-contrasena" mensaje={errores.contrasena} />
                </div>
                <div className="campo">
                  <label htmlFor="conf-contrasena">CONFIRMA CONTRASEÑA</label>
                  <input
                    type="password"
                    id="conf-contrasena"
                    name="confirmacion"
                    placeholder="Ingresa tu contraseña"
                    value={datos.confirmacion} onChange={cambiar} maxLength={128} autoComplete="new-password"
                    aria-invalid={Boolean(errores.confirmacion)} aria-describedby={errores.confirmacion ? 'error-confirmacion' : undefined}
                    required
                  />
                  <ErrorCampo id="error-confirmacion" mensaje={errores.confirmacion} />
                </div>
              </div>

              <div className="fila-nombres">
                <div className="campo">
                  <label htmlFor="carrera">CARRERA</label>
                  <input id="carrera" name="carrera" value={datos.carrera} onChange={cambiar} maxLength={100} required
                    aria-invalid={Boolean(errores.carrera)} aria-describedby={errores.carrera ? 'error-carrera' : undefined} />
                  <ErrorCampo id="error-carrera" mensaje={errores.carrera} />
                </div>
                <div className="campo">
                  <label htmlFor="ciclo">CICLO</label>
                  <select id="ciclo" name="ciclo" value={datos.ciclo} onChange={cambiar} required
                    aria-invalid={Boolean(errores.ciclo)} aria-describedby={errores.ciclo ? 'error-ciclo' : undefined}>
                    <option value="">Selecciona tu ciclo</option>
                    {Array.from({ length: 12 }, (_, indice) => <option key={indice + 1} value={indice + 1}>{indice + 1}</option>)}
                  </select>
                  <ErrorCampo id="error-ciclo" mensaje={errores.ciclo} />
                </div>
              </div>
              <button type="submit" className="boton-ingresar" disabled={enviando}>
                {enviando ? 'Creando cuenta…' : 'Registrarse'}
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
