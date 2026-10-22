import Modal from "./Modal";

function ModalConfirmacion({
  titulo,
  mensaje,
  textoConfirmar,
  textoVolver = "Volver",
  onConfirmar,
  onCerrar,
  children,
}) {
  return (
    <Modal titulo={titulo} tamano="angosto" onCerrar={onCerrar}>
      {mensaje && <p className="modal__mensaje">{mensaje}</p>}
      {children}
      <div className="modal__acciones">
        <button type="button" className="sesion-btn sesion-btn--contorno" onClick={onCerrar}>
          {textoVolver}
        </button>
        <button type="button" className="sesion-btn sesion-btn--peligro" onClick={onConfirmar}>
          {textoConfirmar}
        </button>
      </div>
    </Modal>
  );
}

export default ModalConfirmacion;
