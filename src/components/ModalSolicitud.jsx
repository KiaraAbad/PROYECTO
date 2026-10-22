import { useState } from "react";
import Modal from "./Modal";
import { useSesiones } from "../hooks/useSesiones";
import {
  buscarSolapamiento,
  mensajeSolapamiento,
  formatearFechaLarga,
  capitalizar,
} from "../utils/reglasSesion";
import "../styles/sesiones-comun.css";
import "./ModalSolicitud.css";

const MAXIMO_TEMA = 200;

function ModalSolicitud({ tutor, bloque, onCerrar, onEnviada }) {
  const { usuario } = useSesiones();
  const estudianteId = usuario.id;
  const { todas, cargando, solicitar } = useSesiones(estudianteId);

  const perfil = tutor.perfilTutor ?? {};
  const cursos = perfil.cursos ?? [];
  const modalidadTutor = perfil.modalidad ?? "remota";
  const permitidas = modalidadTutor === "ambas" ? ["remota", "presencial"] : [modalidadTutor];

  const [codigoCurso, setCodigoCurso] = useState(cursos[0]?.codigo ?? "");
  const [tema, setTema] = useState("");
  const [modalidad, setModalidad] = useState(permitidas[0]);
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState("");

  const nombreCompleto = `${tutor.nombres} ${tutor.apellidos}`.trim();

  const cruce = cargando
    ? null
    : buscarSolapamiento(todas, bloque, {
      tutorId: tutor.id,
      estudianteId,
      incluirPendientes: true,
    });
  const mensajeCruce = cruce
    ? mensajeSolapamiento(cruce, "estudiante", "Elige otro bloque o cancela la sesión anterior.")
    : "";

  function enviar(evento) {
    evento.preventDefault();
    const curso = cursos.find((item) => item.codigo === codigoCurso);
    const resultado = solicitar({
      tutorId: tutor.id,
      curso: curso ? { codigo: curso.codigo, nombre: curso.nombre } : null,
      tema,
      modalidad,
      fecha: bloque.fecha,
      horaInicio: bloque.horaInicio,
      horaFin: bloque.horaFin,
    });

    if (resultado.ok) {
      onEnviada();
      return;
    }

    const { campos, mensaje } = resultado.error;
    setErrores(campos);
    setErrorGeneral(Object.keys(campos).length > 0 ? "" : mensaje);
  }

  return (
    <Modal titulo="Solicitar sesión" onCerrar={onCerrar}>
      <form onSubmit={enviar} noValidate>
        <div className="modal-solicitud__resumen">
          <div className="modal-solicitud__avatar" aria-hidden="true" />
          <div>
            <p className="modal-solicitud__nombre">{nombreCompleto}</p>
            <p className="modal-solicitud__bloque">
              {capitalizar(formatearFechaLarga(bloque.fecha))} · {bloque.horaInicio} a {bloque.horaFin} ·{" "}
              {modalidad}
            </p>
          </div>
        </div>

        {(mensajeCruce || errorGeneral) && (
          <div className="modal__aviso-error" role="alert">
            <p>{mensajeCruce || errorGeneral}</p>
          </div>
        )}

        <div className={`modal-campo ${errores.curso ? "modal-campo--error" : ""}`}>
          <label className="modal-campo__etiqueta" htmlFor="solicitud-curso">
            Curso
          </label>
          <select
            id="solicitud-curso"
            className="modal-campo__control"
            value={codigoCurso}
            onChange={(e) => setCodigoCurso(e.target.value)}
          >
            {cursos.map((curso) => (
              <option key={curso.codigo} value={curso.codigo}>
                {curso.codigo} {curso.nombre}
              </option>
            ))}
          </select>
          {errores.curso && <p className="modal-campo__error">{errores.curso}</p>}
        </div>

        <div className={`modal-campo ${errores.tema ? "modal-campo--error" : ""}`}>
          <label className="modal-campo__etiqueta" htmlFor="solicitud-tema">
            Tema a trabajar
          </label>
          <textarea
            id="solicitud-tema"
            className="modal-campo__control"
            rows="3"
            maxLength={MAXIMO_TEMA}
            placeholder="Ej. Ejercicios de integrales por partes"
            value={tema}
            onChange={(e) => {
              setTema(e.target.value);
              setErrores({ ...errores, tema: undefined });
            }}
            aria-invalid={Boolean(errores.tema)}
          />
          {errores.tema ? (
            <p className="modal-campo__error">{errores.tema}</p>
          ) : (
            <p className="modal-campo__ayuda">
              Cuéntale al tutor qué necesitas reforzar. Máximo {MAXIMO_TEMA} caracteres.
            </p>
          )}
        </div>

        <div className="modal-campo">
          <span className="modal-campo__etiqueta">Modalidad</span>
          <div className="modal-solicitud__modalidades" role="group" aria-label="Modalidad">
            {["remota", "presencial"].map((opcion) => (
              <button
                key={opcion}
                type="button"
                className={`modal-solicitud__modalidad ${modalidad === opcion ? "modal-solicitud__modalidad--activa" : ""
                  }`}
                disabled={!permitidas.includes(opcion)}
                title={
                  permitidas.includes(opcion) ? undefined : `Este tutor atiende solo de forma ${modalidadTutor}`
                }
                aria-pressed={modalidad === opcion}
                onClick={() => setModalidad(opcion)}
              >
                {capitalizar(opcion)}
              </button>
            ))}
          </div>
        </div>

        <div className="modal__acciones">
          {cruce ? (
            <button type="button" className="sesion-btn sesion-btn--contorno" onClick={onCerrar}>
              Elegir otro bloque
            </button>
          ) : (
            <button type="button" className="sesion-btn sesion-btn--texto" onClick={onCerrar}>
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className="sesion-btn sesion-btn--primario"
            disabled={cargando || Boolean(cruce)}
          >
            {cargando ? "Cargando..." : "Enviar solicitud"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ModalSolicitud;
