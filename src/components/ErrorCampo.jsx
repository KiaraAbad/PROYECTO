export default function ErrorCampo({ id, mensaje }) {
  return mensaje ? <p className="cuenta-error" id={id} role="alert">{mensaje}</p> : null;
}
