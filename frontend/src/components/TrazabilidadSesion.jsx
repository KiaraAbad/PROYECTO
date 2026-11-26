import { formatearFechaHora } from "../utils/reglasSesion";
import "./TrazabilidadSesion.css";

function colorDelEvento(evento) {
  if (evento.includes("propuesto") || evento.includes("Propuesta rechazada")) return "aviso";
  if (evento.includes("aceptad") || evento.includes("realizada")) return "exito";
  if (evento.includes("rechazad") || evento.includes("cancelad") || evento.includes("no asistió")) return "peligro";
  return "info";
}

function TrazabilidadSesion({ eventos }) {
  return (
    <ol className="trazabilidad">
      {eventos.map((item, indice) => (
        <li key={`${item.fecha}-${indice}`} className="trazabilidad__item">
          <span
            className={`trazabilidad__punto trazabilidad__punto--${colorDelEvento(item.evento)}`}
            aria-hidden="true"
          />
          <div>
            <p className="trazabilidad__evento">{item.evento}</p>
            <p className="trazabilidad__meta">
              {formatearFechaHora(item.fecha)} · {item.actor}
            </p>
            {item.detalle && <p className="trazabilidad__detalle">{item.detalle}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

export default TrazabilidadSesion;
