import { ETIQUETAS_ESTADO } from "../utils/reglasSesion";
import "./BadgeEstadoSesion.css";

function BadgeEstadoSesion({ estado }) {
  return (
    <span className={`badge-sesion badge-sesion--${estado}`}>
      {ETIQUETAS_ESTADO[estado] ?? estado}
    </span>
  );
}

export default BadgeEstadoSesion;
