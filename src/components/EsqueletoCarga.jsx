import "./EsqueletoCarga.css";

function EsqueletoCarga({ cantidad = 4 }) {
  return (
    <div className="esqueletos-carga" aria-label="Cargando tutores" aria-busy="true">
      <div className="esqueletos-carga__grid">
        {Array.from({ length: cantidad }, (_, i) => (
          <div key={i} className="esqueleto-tarjeta">
            <div className="esqueleto-tarjeta__avatar" />
            <div className="esqueleto-tarjeta__linea esqueleto-tarjeta__linea--larga" />
            <div className="esqueleto-tarjeta__linea esqueleto-tarjeta__linea--corta" />
            <div className="esqueleto-tarjeta__rectangulo" />
          </div>
        ))}
      </div>
      <p className="esqueletos-carga__texto">Cargando tutores...</p>
    </div>
  );
}

export default EsqueletoCarga;
