import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TarjetaSolicitud from "../components/TarjetaSolicitud";
import ModalRechazo from "../components/ModalRechazo";
import ModalProponerHorario from "../components/ModalProponerHorario";
import EstadoVacioAgenda from "../components/EstadoVacioAgenda";
import EsqueletoSesiones from "../components/EsqueletoSesiones";
import Notificacion from "../components/Notificacion";
import { useSesiones } from "../hooks/useSesiones";
import { useAviso } from "../hooks/useAviso";
import { contarSolicitudes, solicitudesPendientes } from "../utils/reglasSesion";
import "../styles/sesiones-comun.css";
import "../styles/solicitudes.css";

function Solicitudes() {
  const { usuario: tutor, rol } = useSesiones();
  const { sesiones, todas, cargando, aceptar, rechazar, proponer, aceptarNuevoHorario, rechazarNuevoHorario } =
    useSesiones(tutor.id);
  const { aviso, avisar, cerrarAviso } = useAviso();

  const [errores, setErrores] = useState({});
  const [rechazando, setRechazando] = useState(null);
  const [proponiendo, setProponiendo] = useState(null);

  const delTutor = sesiones.filter((sesion) => sesion.tutorId === tutor.id);
  const contadores = contarSolicitudes(delTutor);
  const pendientes = solicitudesPendientes(delTutor);
  const programadasDelTutor = todas.filter(
    (sesion) => sesion.tutorId === tutor.id && sesion.estado === "programada"
  );


  function responder(solicitud, accion, mensajeExito) {
    const resultado = accion();
    setErrores((anterior) => ({
      ...anterior,
      [solicitud.codigo]: resultado.ok ? "" : resultado.error.mensaje,
    }));
    if (resultado.ok) avisar("exito", mensajeExito(resultado.sesion));
    return resultado;
  }

  function manejarRechazo(codigo, motivo) {
    const resultado = rechazar(codigo, motivo);
    if (resultado.ok) avisar("exito", "Solicitud rechazada. Le avisaremos al estudiante.");
    return resultado;
  }

  function manejarPropuesta(solicitud, horario, mensaje) {
    const resultado = proponer(solicitud.codigo, horario, mensaje);
    if (resultado.ok) avisar("exito", "Propuesta enviada. Te avisaremos cuando el estudiante responda.");
    return resultado;
  }

  function renderListado() {
    if (rol !== 'tutor') return <EstadoVacioAgenda titulo="Solicitudes del tutor" mensaje="Cambia a la vista de tutor para administrar tus solicitudes." textoAccion="Ir a mis sesiones" destino="/mis-sesiones" />;
    if (cargando) return <EsqueletoSesiones cantidad={3} mensaje="Cargando solicitudes..." />;

    if (pendientes.length === 0) {
      return (
        <EstadoVacioAgenda
          icono="✓"
          exito
          titulo="No tienes solicitudes pendientes"
          mensaje="Las solicitudes de tus estudiantes aparecerán aquí."
          textoAccion="Ir a mis sesiones"
          destino="/mis-sesiones"
          contorno
        />
      );
    }

    return (
      <div className="solicitudes__lista">
        {pendientes.map((solicitud) => (
          <TarjetaSolicitud
            key={solicitud.codigo}
            solicitud={solicitud}
            error={errores[solicitud.codigo]}
            onAceptar={(item) =>
              responder(item, () => aceptar(item.codigo), (s) => `Solicitud aceptada. La sesión ${s.codigo} quedó programada.`)
            }
            onRechazar={setRechazando}
            onProponer={setProponiendo}
            onAceptarPropuesta={(item) =>
              responder(
                item,
                () => aceptarNuevoHorario(item.codigo),
                (s) => `Propuesta aceptada. La sesión ${s.codigo} quedó programada.`
              )
            }
            onRechazarPropuesta={(item) =>
              responder(item, () => rechazarNuevoHorario(item.codigo), () => "Propuesta rechazada.")
            }
          />
        ))}
      </div>
    );
  }

  return (
    <div className="agenda-page">
      <Header />

      <main className="agenda-container">
        <div className="solicitudes__encabezado">
          <div>
            <h1 className="agenda-titulo">Solicitudes recibidas</h1>
            <p className="agenda-subtitulo">Responde en menos de 48 horas para mantener tu ficha publicada.</p>
          </div>

          <div className="solicitudes__contadores" aria-label="Resumen de solicitudes">
            <div className="solicitudes__contador solicitudes__contador--pendientes">
              <span className="solicitudes__contador-numero">{contadores.pendientes}</span>
              <span className="solicitudes__contador-texto">
                {contadores.pendientes === 1 ? "pendiente" : "pendientes"}
              </span>
            </div>
            <div className="solicitudes__contador solicitudes__contador--aceptadas">
              <span className="solicitudes__contador-numero">{contadores.aceptadas}</span>
              <span className="solicitudes__contador-texto">
                {contadores.aceptadas === 1 ? "aceptada" : "aceptadas"}
              </span>
            </div>
            <div className="solicitudes__contador solicitudes__contador--rechazadas">
              <span className="solicitudes__contador-numero">{contadores.rechazadas}</span>
              <span className="solicitudes__contador-texto">
                {contadores.rechazadas === 1 ? "rechazada" : "rechazadas"}
              </span>
            </div>
          </div>
        </div>

        {renderListado()}
      </main>

      <Footer rol={rol} />

      {rechazando && (
        <ModalRechazo
          solicitud={rechazando}
          onRechazar={manejarRechazo}
          onCerrar={() => setRechazando(null)}
        />
      )}

      {proponiendo && (
        <ModalProponerHorario
          sesion={proponiendo}
          rol="tutor"
          sesionesTutor={programadasDelTutor}
          onProponer={(horario, mensaje) => manejarPropuesta(proponiendo, horario, mensaje)}
          onCerrar={() => setProponiendo(null)}
        />
      )}

      {aviso && (
        <Notificacion tipo={aviso.tipo} mensaje={aviso.mensaje} accion={aviso.accion} onCerrar={cerrarAviso} />
      )}
    </div>
  );
}

export default Solicitudes;
