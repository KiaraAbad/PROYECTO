import { Link } from "react-router-dom";
import "./TarjetaTutor.css";

function formatearCarrera(carrera = "") {
  return carrera
    .replace(/^Ingeniería de /, "Ing. de ")
    .replace(/^Ingeniería /, "Ing. ");
}

function TarjetaTutor({
  id,
  nombre,
  carrera,
  ciclo,
  cursos = [],
  promedio = 4.8,
  totalSesiones = 25,
  modalidad = "remota",
  fotoUrl,
  variante = "directorio", // "directorio" | "destacado"
  mostrarBoton = true,
  textoFoto,
}) {
  const carreraFormateada = formatearCarrera(carrera);
  const subtitulo = ciclo
    ? `${carreraFormateada} · ${ciclo}.° ciclo`
    : carreraFormateada;

  const esDestacado = variante === "destacado";
  const textoAvatar = textoFoto ?? (esDestacado ? "foto" : "");
  const etiquetaSesiones = esDestacado ? "sesiones" : "ses.";

  return (
    <article
      className={`tarjeta-tutor-mockup ${
        esDestacado ? "tarjeta-tutor-mockup--destacado" : ""
      }`}
    >
      <div className="tarjeta-tutor-mockup__avatar">
        {fotoUrl ? (
          <img
            src={fotoUrl}
            alt={nombre}
            className="tarjeta-tutor-mockup__foto"
          />
        ) : (
          <div
            className={`tarjeta-tutor-mockup__avatar-placeholder ${
              textoAvatar ? "tarjeta-tutor-mockup__avatar-placeholder--con-texto" : ""
            }`}
            aria-hidden="true"
          >
            {textoAvatar}
          </div>
        )}
      </div>

      <h3 className="tarjeta-tutor-mockup__nombre" title={nombre}>
        {nombre}
      </h3>

      <p className="tarjeta-tutor-mockup__carrera">{subtitulo}</p>

      <div
        className="tarjeta-tutor-mockup__cursos"
        aria-label="Cursos que enseña"
      >
        {cursos.slice(0, 3).map((curso, index) => {
          const codigo = typeof curso === "string" ? curso : curso.codigo;
          return (
            <span key={index} className="tarjeta-tutor-mockup__curso-badge">
              {codigo}
            </span>
          );
        })}
      </div>

      <div className="tarjeta-tutor-mockup__stats">
        <strong className="tarjeta-tutor-mockup__promedio">
          {Number(promedio).toFixed(1)}
        </strong>
        <span className="tarjeta-tutor-mockup__separador">·</span>
        <span className="tarjeta-tutor-mockup__sesiones">
          {totalSesiones} {etiquetaSesiones}
        </span>
        <span className="tarjeta-tutor-mockup__separador">·</span>
        <span className="tarjeta-tutor-mockup__modalidad">{modalidad}</span>
      </div>

      {mostrarBoton && (
        <Link
          to={`/tutores/${id}`}
          className="tarjeta-tutor-mockup__btn-ficha"
          aria-label={`Ver ficha de ${nombre}`}
        >
          Ver ficha
        </Link>
      )}
    </article>
  );
}

export default TarjetaTutor;
