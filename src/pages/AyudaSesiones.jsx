import { Link } from 'react-router-dom';

// Ayuda de HU-5: no implementa las pantallas de las otras historias del grupo.
export default function AyudaSesiones({ guia = false }) {
  return (
    <div className="hu5-page hu5-ayuda-pagina">
      <header className="hu5-page-header">
        <div>
          <p className="hu5-eyebrow">Tutorías entre pares · Desarrollo y cierre</p>
          <h1>{guia ? 'Guía del tutor' : 'Ayuda de mis sesiones'}</h1>
          <p className="hu5-lead">Asistencia, notas, materiales e historial de tutorías.</p>
        </div>
      </header>
      <section className="hu5-card">
        <h2>{guia ? 'Cómo registrar el cierre' : '¿Por qué no puedo cerrar una sesión?'}</h2>
        <p>El tutor puede cerrar una sesión programada cuando termina su bloque horario y durante las siguientes 72 horas. Una sesión futura, cancelada, vencida o ya cerrada no admite un nuevo cierre.</p>
        <p>Indica por separado si asistieron el estudiante y el tutor. Si ambos asistieron, registra la duración real y las notas sobre lo trabajado. Los temas pendientes son opcionales.</p>
        <p>Si alguna de las partes no asistió, el cierre queda como «No asistió», sin notas ni horas realizadas. El cierre definitivo siempre pide confirmación.</p>
        <h2>Borradores y material compartido</h2>
        <p>Guardar borrador conserva lo escrito, pero no cierra la sesión ni suma horas. En Material compartido, el tutor puede agregar, editar o quitar enlaces HTTP y HTTPS. Quitar un enlace no borra el archivo original.</p>
        <p>El estudiante puede leer las notas y abrir los enlaces desde el detalle de su sesión, sin editar los registros del tutor.</p>
        <h2>Historial y horas acumuladas</h2>
        <p>El historial permite consultar sesiones por curso y periodo. El resumen del tutor suma únicamente la duración real de las sesiones realizadas y la desglosa por curso. El gráfico cuenta cierres realizados y con inasistencia, sin convertir las ausencias en horas.</p>
        <p>Esta primera entrega conserva los datos en el navegador. Usa siempre la misma dirección y navegador para consultar tus avances guardados.</p>
        <div className="hu5-actions">
          <Link className="hu5-button" to="/sesiones">Mis sesiones</Link>
          <Link className="hu5-button hu5-button--secondary" to="/sesiones/historial">Ver historial</Link>
        </div>
      </section>
    </div>
  );
}
