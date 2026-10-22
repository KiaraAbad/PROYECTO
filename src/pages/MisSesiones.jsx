import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TarjetaSesion from "../components/TarjetaSesion";
import EstadoVacioAgenda from "../components/EstadoVacioAgenda";
import EsqueletoSesiones from "../components/EsqueletoSesiones";
import Notificacion from "../components/Notificacion";
import { useSesiones } from "../hooks/useSesiones";
import { useAviso } from "../hooks/useAviso";
import { ETIQUETAS_ESTADO, filtrarSesiones, separarProximasHistorial } from "../utils/reglasSesion";
import "../styles/sesiones-comun.css";
import "../styles/mis-sesiones.css";

function MisSesiones() {
  const { usuario, rol } = useSesiones();
  const [parametros] = useSearchParams();
  const { sesiones, cargando } = useSesiones(usuario.id);
  const { aviso, avisar, cerrarAviso } = useAviso();

  const [estado, setEstado] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");


  const mostrarVacio = parametros.get("vacio") === "1";
  const propias = mostrarVacio ? [] : sesiones.filter((sesion) =>
    (rol === 'tutor' ? sesion.tutorId : sesion.estudianteId) === usuario.id);

  const rangoInvalido = Boolean(desde && hasta && desde > hasta);
  const hayFiltros = Boolean(estado || desde || hasta);

  const filtradas = filtrarSesiones(propias, {
    estado,
    desde: rangoInvalido ? "" : desde,
    hasta: rangoInvalido ? "" : hasta,
  });
  const { proximas, historial } = separarProximasHistorial(filtradas);

  function limpiarFiltros() {
    setEstado("");
    setDesde("");
    setHasta("");
  }


  function calificar() {
    avisar("info", "La calificación del tutor se habilita con la historia de valoraciones (HU-6).");
  }

  function renderContenido() {
    if (cargando) return <EsqueletoSesiones cantidad={4} />;

    if (propias.length === 0) {
      return (
        <EstadoVacioAgenda
          titulo="Aún no tienes sesiones"
          mensaje="Busca un tutor en el directorio y solicita tu primera sesión."
          textoAccion="Ir al directorio"
          destino="/tutores"
        />
      );
    }

    if (filtradas.length === 0) {
      return (
        <EstadoVacioAgenda
          icono="?"
          titulo="Ninguna sesión coincide con estos filtros"
          mensaje="Prueba con otro estado u otro rango de fechas."
          textoAccion="Limpiar filtros"
          onAccion={limpiarFiltros}
        />
      );
    }

    return (
      <>
        <section className="mis-sesiones__seccion" aria-labelledby="titulo-proximas">
          <h2 id="titulo-proximas" className="mis-sesiones__seccion-titulo">
            Próximas
          </h2>
          {proximas.length === 0 ? (
            <p className="mis-sesiones__vacio-seccion">No tienes sesiones próximas con estos filtros.</p>
          ) : (
            <div className="mis-sesiones__lista">
              {proximas.map((sesion) => (
                <TarjetaSesion key={sesion.codigo} sesion={sesion} rol={rol} onCalificar={calificar} />
              ))}
            </div>
          )}
        </section>

        <section className="mis-sesiones__seccion" aria-labelledby="titulo-historial">
          <h2 id="titulo-historial" className="mis-sesiones__seccion-titulo">
            Historial
          </h2>
          {historial.length === 0 ? (
            <p className="mis-sesiones__vacio-seccion">Todavía no hay sesiones en tu historial con estos filtros.</p>
          ) : (
            <div className="mis-sesiones__lista mis-sesiones__lista--compacta">
              {historial.map((sesion) => (
                <TarjetaSesion
                  key={sesion.codigo}
                  sesion={sesion}
                  rol={rol}
                  compacta
                  onCalificar={calificar}
                />
              ))}
            </div>
          )}
        </section>
      </>
    );
  }

  return (
    <div className="agenda-page">
      <Header />

      <main className="agenda-container">
        <div className="mis-sesiones__encabezado">
          <div>
            <h1 className="agenda-titulo">Mis sesiones</h1>
            <p className="agenda-subtitulo">
              {proximas.length} {proximas.length === 1 ? "próxima" : "próximas"} · {historial.length} en el
              historial
            </p>
          </div>

          <div className="mis-sesiones__filtros">
            <label className="mis-sesiones__filtro">
              Estado:
              <select value={estado} onChange={(e) => setEstado(e.target.value)} aria-label="Filtrar por estado">
                <option value="">todos</option>
                {Object.entries(ETIQUETAS_ESTADO).map(([valor, texto]) => (
                  <option key={valor} value={valor}>
                    {texto.toLowerCase()}
                  </option>
                ))}
              </select>
            </label>

            <div className="mis-sesiones__filtro" role="group" aria-label="Rango de fechas">
              <input
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                aria-label="Desde"
                aria-invalid={rangoInvalido}
              />
              —
              <input
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
                aria-label="Hasta"
                aria-invalid={rangoInvalido}
              />
            </div>

            {hayFiltros && (
              <button type="button" className="sesion-btn sesion-btn--texto" onClick={limpiarFiltros}>
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {rangoInvalido && (
          <p className="mis-sesiones__filtro-error" role="alert">
            La fecha final no puede ser anterior a la inicial.
          </p>
        )}

        {renderContenido()}
      </main>

      <Footer rol={rol} />

      {aviso && (
        <Notificacion tipo={aviso.tipo} mensaje={aviso.mensaje} accion={aviso.accion} onCerrar={cerrarAviso} />
      )}
    </div>
  );
}

export default MisSesiones;
