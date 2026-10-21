import ModalConfirmacion from "./ModalConfirmacion";
import { formatearFecha } from "../utils/reglasSesion";

function ModalCancelarSesion({ sesion, rol, onConfirmar, onCerrar }) {
  const aQuien = rol === "tutor" ? "al estudiante" : "al tutor";

  return (
    <ModalConfirmacion
      titulo={`¿Cancelar la sesión del ${formatearFecha(sesion.fecha)}?`}
      mensaje={`Se notificará ${aQuien} y el bloque quedará libre. Esta acción no se puede deshacer.`}
      textoConfirmar="Cancelar sesión"
      onConfirmar={onConfirmar}
      onCerrar={onCerrar}
    />
  );
}

export default ModalCancelarSesion;
