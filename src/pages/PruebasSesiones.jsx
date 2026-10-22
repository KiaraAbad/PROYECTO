import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSesiones } from '../hooks/useSesiones';
import { ModalConfirmacion } from '../components/sesiones/ElementosSesion';

// App permite esta ruta solo en desarrollo. No se enlaza desde la interfaz normal.
export default function PruebasSesiones() {
  const { rol, usuario, cambiarRol, reiniciarDemo, salir } = useSesiones();
  const [confirmando, setConfirmando] = useState(false);

  function confirmarRestablecimiento() {
    reiniciarDemo();
    setConfirmando(false);
  }

  return (
    <div className="hu5-page">
      <header className="hu5-page-header">
        <div>
          <p className="hu5-eyebrow">Solo desarrollo</p>
          <h1>Pruebas de HU-5</h1>
          <p className="hu5-lead">Herramientas separadas de las pantallas de entrega.</p>
        </div>
        <Link className="hu5-button hu5-button--secondary" to="/sesiones">
          Volver a mis sesiones
        </Link>
      </header>

      <section className="hu5-card" aria-labelledby="pruebas-identidad">
        <h2 id="pruebas-identidad">Cuenta activa</h2>
        <p className="hu5-help">
          Cambiar de rol conserva tu identidad y solo permite los roles de tu cuenta.
          Para probar con otra persona, sal de tu cuenta e ingresa desde el login.
        </p>
        <div className="hu5-pruebas-grid">
          <label className="hu5-field">
            <span>Rol activo</span>
            <select value={rol} onChange={evento => cambiarRol(evento.target.value)}>
              {usuario.rol.map(opcion => <option key={opcion} value={opcion}>{opcion}</option>)}
            </select>
          </label>
          <div><p>{usuario.nombres} {usuario.apellidos} · {usuario.id}</p>
            <button type="button" className="hu5-button hu5-button--secondary" onClick={salir}>Cambiar de cuenta</button>
          </div>
        </div>
      </section>

      <section className="hu5-card" aria-labelledby="pruebas-datos">
        <h2 id="pruebas-datos">Datos de ejemplo</h2>
        <p>
          El reinicio permite volver a probar cierres y materiales. Reemplaza los
          registros de agenda y cierre únicamente en este navegador y dirección.
        </p>
        <p className="hu5-alert hu5-alert--warning">
          No restablezcas el ejemplo si quieres conservar tus cierres, borradores y enlaces actuales.
        </p>
        <button className="hu5-button hu5-button--danger" type="button" onClick={() => setConfirmando(true)}>
          Restablecer ejemplo
        </button>
      </section>

      {confirmando && (
        <ModalConfirmacion
          titulo="¿Restablecer los datos de ejemplo?"
          confirmarTexto="Restablecer ejemplo"
          peligroso
          onCancelar={() => setConfirmando(false)}
          onConfirmar={confirmarRestablecimiento}
        >
          <p>
            Se reemplazarán las solicitudes, sesiones, cierres, borradores y enlaces de esta
            demo en este navegador por los datos iniciales. El respaldo anterior de HU-5
            se conserva; no se modifica ningún archivo ni el repositorio del grupo.
          </p>
        </ModalConfirmacion>
      )}
    </div>
  );
}
