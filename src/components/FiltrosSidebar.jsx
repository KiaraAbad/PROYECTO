import "./FiltrosSidebar.css";

const DIAS_MAP = [
  { clave: "lunes", etiqueta: "Lun" },
  { clave: "martes", etiqueta: "Mar" },
  { clave: "miercoles", etiqueta: "Mié" },
  { clave: "jueves", etiqueta: "Jue" },
  { clave: "viernes", etiqueta: "Vie" },
  { clave: "sabado", etiqueta: "Sáb" },
];

const MODALIDADES = [
  { clave: "presencial", etiqueta: "Presencial" },
  { clave: "remota", etiqueta: "Remota" },
  { clave: "ambas", etiqueta: "Ambas" },
];

function FiltrosSidebar({
  filtros,
  opciones,
  onChange,
  onAplicar,
  onLimpiar,
}) {
  const actualizar = (campo, valor) => {
    onChange({ ...filtros, [campo]: valor });
  };

  const alternarDia = (diaClave) => {
    actualizar("dia", filtros.dia === diaClave ? "" : diaClave);
  };

  const alternarModalidad = (modClave) => {
    actualizar("modalidad", filtros.modalidad === modClave ? "" : modClave);
  };

  return (
    <aside className="filtros-sidebar" aria-label="Filtros de búsqueda de tutores">
      <h2 className="filtros-sidebar__titulo">Filtros</h2>

      {/* CURSO */}
      <div className="filtros-sidebar__grupo">
        <label htmlFor="filtro-curso" className="filtros-sidebar__label">
          CURSO
        </label>
        <div className="filtros-sidebar__select-wrapper">
          <select
            id="filtro-curso"
            className="filtros-sidebar__select"
            value={filtros.curso}
            onChange={(e) => actualizar("curso", e.target.value)}
          >
            <option value="">Todos los cursos</option>
            {opciones.cursos.map((c) => {
              const valor = typeof c === "string" ? c : c.codigo;
              const nombre = typeof c === "string" ? c : `${c.codigo} ${c.nombre}`;
              return (
                <option key={valor} value={valor}>
                  {nombre}
                </option>
              );
            })}
          </select>
          <span className="filtros-sidebar__select-flecha" aria-hidden="true">▾</span>
        </div>
      </div>

      {/* CARRERA */}
      <div className="filtros-sidebar__grupo">
        <label htmlFor="filtro-carrera" className="filtros-sidebar__label">
          CARRERA
        </label>
        <div className="filtros-sidebar__select-wrapper">
          <select
            id="filtro-carrera"
            className="filtros-sidebar__select"
            value={filtros.carrera}
            onChange={(e) => actualizar("carrera", e.target.value)}
          >
            <option value="">Todas</option>
            {opciones.carreras.map((carrera) => (
              <option key={carrera} value={carrera}>
                {carrera}
              </option>
            ))}
          </select>
          <span className="filtros-sidebar__select-flecha" aria-hidden="true">▾</span>
        </div>
      </div>

      {/* MODALIDAD */}
      <div className="filtros-sidebar__grupo">
        <span className="filtros-sidebar__label">MODALIDAD</span>
        <div className="filtros-sidebar__opciones-lista" role="radiogroup" aria-label="Modalidad">
          {MODALIDADES.map((mod) => {
            const estaSeleccionada = filtros.modalidad === mod.clave;
            return (
              <label
                key={mod.clave}
                className="filtros-sidebar__checkbox-item"
              >
                <input
                  type="checkbox"
                  className="filtros-sidebar__checkbox-input"
                  checked={estaSeleccionada}
                  onChange={() => alternarModalidad(mod.clave)}
                />
                <span
                  className={`filtros-sidebar__checkbox-box ${
                    estaSeleccionada ? "filtros-sidebar__checkbox-box--activo" : ""
                  }`}
                  aria-hidden="true"
                >
                  {estaSeleccionada && (
                    <svg
                      viewBox="0 0 24 24"
                      width="13"
                      height="13"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <span className="filtros-sidebar__checkbox-texto">{mod.etiqueta}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* DÍA DE ATENCIÓN */}
      <div className="filtros-sidebar__grupo">
        <span className="filtros-sidebar__label">DÍA DE ATENCIÓN</span>
        <div className="filtros-sidebar__dias-row" role="group" aria-label="Días de atención">
          {DIAS_MAP.map((d) => {
            const estaActivo = filtros.dia === d.clave;
            return (
              <button
                key={d.clave}
                type="button"
                className={`filtros-sidebar__dia-pill ${
                  estaActivo ? "filtros-sidebar__dia-pill--activo" : ""
                }`}
                onClick={() => alternarDia(d.clave)}
                aria-pressed={estaActivo}
              >
                {d.etiqueta}
              </button>
            );
          })}
        </div>
      </div>

      {/* BOTONES */}
      <div className="filtros-sidebar__acciones">
        <button
          type="button"
          className="filtros-sidebar__btn-aplicar"
          onClick={onAplicar}
        >
          Aplicar filtros
        </button>

        <button
          type="button"
          className="filtros-sidebar__btn-limpiar"
          onClick={onLimpiar}
        >
          Limpiar todo
        </button>
      </div>
    </aside>
  );
}

export default FiltrosSidebar;
