import "./EsqueletoSesiones.css";

function EsqueletoSesiones({ cantidad = 3, mensaje = "Cargando sesiones..." }) {
  return (
    <div className="esqueleto-sesiones" aria-busy="true" aria-label={mensaje}>
      {Array.from({ length: cantidad }, (_, i) => (
        <div key={i} className="esqueleto-sesiones__fila">
          <div className="esqueleto-sesiones__avatar" />
          <div className="esqueleto-sesiones__textos">
            <div className="esqueleto-sesiones__linea esqueleto-sesiones__linea--larga" />
            <div className="esqueleto-sesiones__linea esqueleto-sesiones__linea--corta" />
          </div>
          <div className="esqueleto-sesiones__boton" />
        </div>
      ))}
      <p className="esqueleto-sesiones__texto">{mensaje}</p>
    </div>
  );
}

export default EsqueletoSesiones;
