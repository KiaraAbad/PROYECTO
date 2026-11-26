import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ErrorCampo from '../components/ErrorCampo';
import { useAutenticacion } from '../hooks/useAutenticacion';
import { CUENTAS_DEMO, CONTRASENA_DEMO, destinoTrasIngreso } from '../utils/autenticacion';
import '../styles/cuenta.css';

export function Login() {
  const { usuario, rol, ingresar, aviso } = useAutenticacion();
  const ubicacion = useLocation();
  const [datos, setDatos] = useState({ correo: ubicacion.state?.correo ?? '', contrasena: '', recordar: false });
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (usuario) return <Navigate to={destinoTrasIngreso(ubicacion.state?.desde, rol)} replace />;

  function cambiar(evento) {
    const { name, value, checked, type } = evento.target;
    setDatos(actual => ({ ...actual, [name]: type === 'checkbox' ? checked : value }));
  }

  async function enviar(evento) {
    evento.preventDefault();
    setMensaje('');
    setEnviando(true);
    try {
      const resultado = await ingresar(datos);
      setErrores(resultado.errores ?? {});
      if (!resultado.ok) setMensaje(resultado.mensaje ?? 'Revisa los campos indicados.');
    } catch {
      setMensaje('No se pudo iniciar el acceso local. Inténtalo de nuevo.');
    } finally { setEnviando(false); }
  }

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
              <Link to="/registro">Crear cuenta</Link>
            </p>
          </div>

          <div className="formulario-login">
            <h2>Inicia sesión</h2>
            <p className="cuenta-aviso">Demostración de la primera entrega. No uses tu contraseña real.</p>
            {ubicacion.state?.registroExitoso && <p role="status">Cuenta creada. Ya puedes ingresar.</p>}
            {aviso && <p className="cuenta-aviso" role="status">{aviso}</p>}
            {mensaje && <p className="cuenta-error" role="alert">{mensaje}</p>}
            <form onSubmit={enviar} noValidate>
              <label htmlFor="correo">
                CORREO INSTITUCIONAL
              </label>
              <input
                type="email"
                id="correo"
                name="correo"
                placeholder="tucorreo@aloe.ulima.edu.pe"
                autoComplete="username"
                value={datos.correo}
                onChange={cambiar}
                aria-invalid={Boolean(errores.correo)}
                aria-describedby={errores.correo ? 'error-correo' : undefined}
                required
              />
              <ErrorCampo id="error-correo" mensaje={errores.correo} />

              <label htmlFor="contrasena">
                CONTRASEÑA
              </label>
              <input
                type="password"
                id="contrasena"
                name="contrasena"
                placeholder="Ingresa tu contraseña"
                autoComplete="current-password"
                maxLength={128}
                value={datos.contrasena}
                onChange={cambiar}
                aria-invalid={Boolean(errores.contrasena)}
                aria-describedby={errores.contrasena ? 'error-contrasena' : undefined}
                required
              />
              <ErrorCampo id="error-contrasena" mensaje={errores.contrasena} />

              <div className="opciones-login">
                <div>
                  <input
                    type="checkbox"
                    id="recordar"
                    name="recordar"
                    checked={datos.recordar}
                    onChange={cambiar}
                  />
                  <label htmlFor="recordar">
                    Recordarme en este equipo
                  </label>
                </div>
                <button type="button" className="cuenta-enlace" onClick={() => setMensaje('El flujo de recuperación de contraseña está pendiente de HU-1. En esta demo usa una cuenta de prueba o recuerda la clave de tu registro local. No se envían correos.')}>
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button type="submit" className="boton-ingresar" disabled={enviando}>
                {enviando ? 'Ingresando…' : 'Ingresar'}
              </button>
            </form>
            <p className="mensaje-correo">
              Solo se admiten correos @aloe.ulima.edu.pe y @ulima.edu.pe.
            </p>
            <details className="cuenta-demo">
              <summary>Cuentas de prueba</summary>
              <p>Contraseña pública de ejemplo: <code>{CONTRASENA_DEMO}</code></p>
              {CUENTAS_DEMO.map(cuenta => <div key={cuenta.id}>
                <p>{cuenta.etiqueta}<br /><small>{cuenta.correo}</small></p>
                <button type="button" className="cuenta-enlace" onClick={() => {
                  setDatos(actual => ({ ...actual, correo: cuenta.correo, contrasena: CONTRASENA_DEMO }));
                  setErrores({}); setMensaje('');
                }}>Usar cuenta de {cuenta.etiqueta.split(' · ')[0]}</button>
              </div>)}
            </details>
          </div>
        </section>
      </main>

      <Footer variante="publico" />
    </div>
  );
}

export default Login;
