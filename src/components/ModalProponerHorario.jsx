import { useState } from "react";
import Modal from "./Modal";
import { capitalizar, formatearFechaLarga, sumarMinutos, aMinutos } from "../utils/reglasSesion";
import "../styles/sesiones-comun.css";
import "./ModalProponerHorario.css";

const DIAS = [
  { etiqueta: "Lun 16", fecha: "2026-11-16" },
  { etiqueta: "Mar 17", fecha: "2026-11-17" },
  { etiqueta: "Mié 18", fecha: "2026-11-18" },
  { etiqueta: "Jue 19", fecha: "2026-11-19" },
  { etiqueta: "Vie 20", fecha: "2026-11-20" },
  { etiqueta: "Sáb 21", fecha: "2026-11-21" },
];

const DISPONIBILIDAD = {
  "08:00": ["l", "l", "-", "o", "l", "-"],
  "09:00": ["o", "l", "l", "-", "l", "l"],
  "16:00": ["l", "l", "l", "-", "l", "-"],
  "17:00": ["l", "l", "-", "-", "o", "-"],
  "18:00": ["l", "-", "l", "l", "-", "-"],
};

const HORAS = Object.keys(DISPONIBILIDAD);

function ModalProponerHorario({ sesion, rol, sesionesTutor, onProponer, onCerrar }) {
  const [elegido, setElegido] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const esReprogramacion = sesion.estado === "programada";
  const contraparte = rol === "tutor" ? sesion.estudiante : sesion.tutor;
  const duracion = aMinutos(sesion.horaFin) - aMinutos(sesion.horaInicio);

  function estadoDeCelda(hora, dia, indice) {
    if (sesion.fecha === dia.fecha && sesion.horaInicio === hora) return "solicitado";
    if (elegido && elegido.fecha === dia.fecha && elegido.horaInicio === hora) return "propuesto";
    const ocupadoPorSesion = sesionesTutor.some(
      (otra) =>
        otra.codigo !== sesion.codigo &&
        otra.estado === "programada" &&
        otra.fecha === dia.fecha &&
        otra.horaInicio === hora
    );
    if (ocupadoPorSesion) return "ocupado";
    const base = DISPONIBILIDAD[hora][indice];
    if (base === "l") return "libre";
    if (base === "o") return "ocupado";
    return "no-disponible";
  }

  function elegir(hora, dia) {
    setElegido({ fecha: dia.fecha, horaInicio: hora, horaFin: sumarMinutos(hora, duracion) });
    setError("");
  }

  function enviar() {
    if (!elegido) {
      setError("Elige un bloque libre de la grilla.");
      return;
    }
    const resultado = onProponer(elegido, mensaje);
    if (resultado.ok) {
      onCerrar();
    } else {
      setError(resultado.error.mensaje);
    }
  }

  const etiquetas = {
    solicitado: "Solicitado",
    propuesto: "Propuesto",
    libre: "",
    ocupado: "",
    "no-disponible": "",
  };

  return (
    <Modal
      titulo={esReprogramacion ? "Reprogramar sesión" : "Proponer otro horario"}
      subtitulo={`${contraparte.nombreCompleto} · ${sesion.curso.codigo} ${sesion.curso.nombre}`}
      tamano="ancho"
      onCerrar={onCerrar}
    >
      <div className="proponer-horario">
        <div>
          <p className="proponer-horario__etiqueta">
            {esReprogramacion ? "Horario actual" : "Bloque solicitado"}
          </p>
          <div className="proponer-horario__bloque">
            <p className="proponer-horario__bloque-dia">{capitalizar(formatearFechaLarga(sesion.fecha))}</p>
            <p className="proponer-horario__bloque-hora">
              {sesion.horaInicio} a {sesion.horaFin} · {sesion.modalidad}
            </p>
            <p className="proponer-horario__bloque-tema">Tema: «{sesion.tema}»</p>
          </div>

          <label className="proponer-horario__etiqueta" htmlFor="mensaje-propuesta">
            Mensaje al {rol === "tutor" ? "estudiante" : "tutor"} (opcional)
          </label>
          <textarea
            id="mensaje-propuesta"
            className="modal-campo__control"
            rows="4"
            maxLength="200"
            placeholder="Ej. Ese día tengo laboratorio hasta las 18:00. ¿Te sirve el martes a la misma hora?"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
          />

          <p
            className={`proponer-horario__nuevo proponer-horario__nuevo--separado ${elegido ? "" : "proponer-horario__nuevo--vacio"
              }`}
          >
            {elegido
              ? `Nuevo bloque: ${formatearFechaLarga(elegido.fecha)}, ${elegido.horaInicio} a ${elegido.horaFin}`
              : "Elige un bloque libre en la grilla."}
          </p>
        </div>

        <div>
          <p className="proponer-horario__etiqueta">
            {rol === "tutor"
              ? "Elige el reemplazo en tu disponibilidad"
              : "Elige el reemplazo en la disponibilidad del tutor"}
          </p>

          <div className="grilla-reemplazo" role="group" aria-label="Disponibilidad de la semana">
            <span />
            {DIAS.map((dia) => (
              <span key={dia.fecha} className="grilla-reemplazo__dia">
                {dia.etiqueta}
              </span>
            ))}

            {HORAS.map((hora) => (
              <GrillaFila
                key={hora}
                hora={hora}
                celdas={DIAS.map((dia, indice) => ({ dia, estado: estadoDeCelda(hora, dia, indice) }))}
                etiquetas={etiquetas}
                onElegir={elegir}
              />
            ))}
          </div>

          <div className="grilla-reemplazo__leyenda">
            <span className="grilla-reemplazo__leyenda-item">
              <span className="grilla-reemplazo__muestra grilla-reemplazo__muestra--libre" /> Libre
            </span>
            <span className="grilla-reemplazo__leyenda-item">
              <span className="grilla-reemplazo__muestra grilla-reemplazo__muestra--ocupado" /> Ocupado
            </span>
            <span className="grilla-reemplazo__leyenda-item">
              <span className="grilla-reemplazo__muestra grilla-reemplazo__muestra--propuesto" /> Propuesto
            </span>
          </div>

          {error && (
            <p className="modal-campo__error proponer-horario__error" role="alert">
              {error}
            </p>
          )}

          <div className="modal__acciones">
            <button type="button" className="sesion-btn sesion-btn--texto" onClick={onCerrar}>
              Cancelar
            </button>
            <button type="button" className="sesion-btn sesion-btn--primario" onClick={enviar}>
              Enviar propuesta
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function GrillaFila({ hora, celdas, etiquetas, onElegir }) {
  return (
    <>
      <span className="grilla-reemplazo__hora">{hora}</span>
      {celdas.map(({ dia, estado }) => {
        const clase = `grilla-reemplazo__celda grilla-reemplazo__celda--${estado}`;
        if (estado === "libre" || estado === "propuesto") {
          return (
            <button
              key={dia.fecha}
              type="button"
              className={clase}
              aria-label={`${dia.etiqueta} ${hora}: ${estado}`}
              onClick={() => onElegir(hora, dia)}
            >
              {etiquetas[estado]}
            </button>
          );
        }
        return (
          <div key={dia.fecha} className={clase}>
            {etiquetas[estado] && (
              <span className="grilla-reemplazo__texto-celda">{etiquetas[estado]}</span>
            )}
          </div>
        );
      })}
    </>
  );
}

export default ModalProponerHorario;
