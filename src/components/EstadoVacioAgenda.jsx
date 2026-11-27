import { Link } from "react-router-dom";
import "../styles/sesiones-comun.css";
import "./EstadoVacioAgenda.css";

function EstadoVacioAgenda({
  icono = "i",
  exito = false,
  titulo,
  mensaje,
  textoAccion,
  destino,
  onAccion,
  contorno = false,
}) {
  const claseBoton = `sesion-btn ${contorno ? "sesion-btn--contorno" : "sesion-btn--primario"}`;

  return (
    <section className="estado-vacio-agenda" aria-live="polite">
      <div
        className={`estado-vacio-agenda__icono ${exito ? "estado-vacio-agenda__icono--exito" : ""}`}
        aria-hidden="true"
      >
        {icono}
      </div>
      <h2 className="estado-vacio-agenda__titulo">{titulo}</h2>
      <p className="estado-vacio-agenda__mensaje">{mensaje}</p>
      {textoAccion && destino && (
        <Link to={destino} className={claseBoton}>
          {textoAccion}
        </Link>
      )}
      {textoAccion && onAccion && (
        <button type="button" className={claseBoton} onClick={onAccion}>
          {textoAccion}
        </button>
      )}
    </section>
  );
}

export default EstadoVacioAgenda;
