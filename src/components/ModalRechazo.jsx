import { useState } from "react";
import ModalConfirmacion from "./ModalConfirmacion";

function ModalRechazo({ solicitud, onRechazar, onCerrar }) {
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState("");

  function confirmar() {
    if (motivo.trim().length < 10) {
      setError("Indica el motivo del rechazo (mínimo 10 caracteres).");
      return;
    }
    const resultado = onRechazar(solicitud.codigo, motivo);
    if (resultado.ok) {
      onCerrar();
    } else {
      setError(resultado.error.campos.motivo || resultado.error.mensaje);
    }
  }

  return (
    <ModalConfirmacion
      titulo="Rechazar solicitud"
      mensaje={`Se le avisará a ${solicitud.estudiante.nombreCompleto} con el motivo que indiques. Esta acción no se puede deshacer.`}
      textoConfirmar="Rechazar solicitud"
      onConfirmar={confirmar}
      onCerrar={onCerrar}
    >
      <div className={`modal-campo ${error ? "modal-campo--error" : ""}`}>
        <label className="modal-campo__etiqueta" htmlFor="motivo-rechazo">
          Motivo del rechazo
        </label>
        <textarea
          id="motivo-rechazo"
          className="modal-campo__control"
          rows="3"
          maxLength="200"
          placeholder="Ej. Ese día tengo examen y no podré atender."
          value={motivo}
          onChange={(e) => {
            setMotivo(e.target.value);
            setError("");
          }}
          aria-invalid={error !== ""}
        />
        {error && <p className="modal-campo__error">{error}</p>}
      </div>
    </ModalConfirmacion>
  );
}

export default ModalRechazo;
