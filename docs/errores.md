# Informe Integral de Errores del Proyecto

> **Fecha:** 22 de octubre de 2026  
> **Estado del Proyecto:** Corregido y Validado (`npm run build`, `npm run lint` y pruebas pasando al 100%)  
> **Propósito:** Registro exhaustivo de incidencias, errores de compilación, fallas de ejecución, problemas derivados de merges mal ajustados, inconsistencias de datos, hooks, contexto, componentes, assets y errores de indentación.  
> **Nota:** Todos los errores enumerados han sido corregidos y validados con éxito.

---

## 1. Errores Críticos que Impiden Levantar el Proyecto (Bloqueantes)

Estos errores impiden directamente la compilación de producción (`npm run build`), interrumpen la ejecución del servidor de desarrollo de Vite o causan un bloqueo inmediato en tiempo de ejecución al acceder a las rutas clave.

### 1.1 Error de Sintaxis JSX por Cierre Incompleto de Etiquetas
- **Archivo afectado:** `src/pages/DetalleTutor.jsx`
- **Líneas afectadas:** 597–600
- **Descripción:** La grilla de la agenda semanal abre la fila `<tr key={fila.hora}>` en la línea 532 y realiza un mapeo de las columnas de días `{semanaActual.dias.map(...)`. Al terminar dicho mapeo en la línea 597, faltan las etiquetas de cierre `</tr>` y el cierre del callback `))}`. En su lugar, el archivo salta directamente a `</tbody>`.
- **Mensaje de error (`npm run build`):**
  ```text
  [builtin:vite-transform] Expected corresponding JSX closing tag for 'tr'.
       ╭─[ src/pages/DetalleTutor.jsx:598:21 ]
   532 │                       <tr key={fila.hora}>
       │                        ─┬  
       │                         ╰── Opened here
   598 │                   </tbody>
       │                     ──┬──  
       │                       ╰──── Expected `</tr>`
  ```
- **Impacto:** Falla crítica de build. Vite rechaza la transformación del módulo y la aplicación no puede construirse ni servirse en desarrollo.

### 1.2 Error en Tiempo de Ejecución por Variable No Definida (`ReferenceError`)
- **Archivo afectado:** `src/pages/DetalleTutor.jsx`
- **Línea afectada:** 132
- **Código con error:**
  ```javascript
  const [semanas] = useState(() => crearSemanas(new Date()));
  ```
- **Descripción:** La función `crearSemanas` no está importada ni declarada en ninguna parte del archivo (únicamente existe la función en singular `crearSemana(indice)` definida en la línea 51).
- **Mensaje de error (ESLint y Navegador):**
  ```text
  'crearSemanas' is not defined. (no-undef)
  ReferenceError: crearSemanas is not defined
  ```
- **Impacto:** Pantalla en blanco inmediata (`crash`) al navegar a cualquier ficha de tutor (`/tutores/:id`). Además, la variable `semanas` no se utiliza en el resto del componente.

### 1.3 Error de Exportación Nombrada Faltante en Módulo de Utilidades
- **Archivo afectado:** `src/utils/filtrosTutores.js` (dependiente de `src/utils/texto.js`)
- **Líneas afectadas:** Línea 1, 165 y 176
- **Código con error:**
  ```javascript
  import { normalizarTexto } from "./texto";
  // ...
  const consulta = normalizarTexto(filtros.busqueda ?? "");
  ```
- **Descripción:** `src/utils/texto.js` únicamente contiene `export function normalizar(s)`. La exportación nombrada `normalizarTexto` no existe.
- **Mensaje de error:**
  ```text
  SyntaxError: The requested module '/src/utils/texto.js' does not provide an export named 'normalizarTexto'
  ```
- **Impacto:** Si cualquier componente importa `filtrosTutores.js`, el empaquetador falla inmediatamente al resolver el módulo.

---

## 2. Problemas Derivados de Merges Mal Ajustados

A partir del análisis del historial de Git (`git log`, commit de merge `7c4effcb052e1a83417e89bfbe6b8930f5ed98d8` e integraciones de los PRs #8, #9 y #10), se identificaron desajustes severos introducidos durante la resolución de conflictos:

### 2.1 Pérdida Accidental de Código en `DetalleTutor.jsx` al Fusionar `main` en `feature/hu2-tutor`
- **Commit origen:** `7c4effcb052e1a83417e89bfbe6b8930f5ed98d8` (Merge branch 'main' into feature/hu2-tutor).
- **Detalle del diff:**
  ```diff
  @@ -572,8 -350,8 +595,6 @@@
                                </td>
                              );
                            })}
  --                      </tr>
  --                    ))}
                      </tbody>
  ```
- **Explicación:** Tanto en la rama entrante (`e6df35b`) como en la rama local (`1d10d52`), las líneas de cierre `</tr>` y `))}` estaban presentes. Al combinar manualmente las diferencias de la celda de disponibilidad en conflicto, ambas líneas fueron eliminadas por error, provocando el fallo del punto 1.1.

### 2.2 Colisión No Resuelta entre `crearSemanas` y `crearSemana`
- **Commit origen:** `7c4effcb052e1a83417e89bfbe6b8930f5ed98d8`.
- **Explicación:** En la rama `main`, la agenda se generaba con una función llamada `crearSemanas(ahora)` que retornaba una lista de semanas fijas. En la rama `feature/hu2-tutor`, Aaron Castro reemplazó esto por una función `crearSemana(indice)` (en singular) que calcula dinámicamente cualquier semana por índice. Durante la resolución del conflicto:
  1. Se aceptó la definición nueva `crearSemana(indice)`.
  2. Se conservó por error la línea de estado de `main`: `const [semanas] = useState(() => crearSemanas(new Date()));`.
  3. Esto dejó una llamada huérfana a una función que ya no existía en el archivo.

### 2.3 Residuos de Formato de Fecha en `ModalSolicitud`
- **Archivo:** `src/pages/DetalleTutor.jsx`
- **Código:**
  ```javascript
  bloque={{
    fecha: bloqueSeleccionado.fecha.split("/").reverse().join("-"),
    horaInicio: bloqueSeleccionado.horaInicio,
    horaFin: bloqueSeleccionado.horaFin,
  }}
  ```
- **Explicación:** En la versión previa al merge, `bloqueSeleccionado.fecha` se almacenaba en formato `DD/MM/YYYY`. Con la refactorización de HU-2, `col.fechaISO` pasó a proveer la fecha ya en formato `YYYY-MM-DD`. Al aplicar `.split("/").reverse().join("-")` sobre una cadena que ya usa guiones, el método falla conceptualmente (retorna el mismo valor solo por casualidad porque no encuentra barras `/`), evidenciando una adaptación incompleta de la lógica integrada.

### 2.4 Inconsistencia de Extensiones en Rutas de `src/App.jsx`
- **Archivo:** `src/App.jsx`
- **Código:**
  ```javascript
  import MiPerfilTutor from './pages/MiPerfilTutor';
  import MisCursosTutor from './pages/MisCursosTutor.jsx';
  import DisponibilidadTutor from './pages/DisponibilidadTutor.jsx';
  ```
- **Explicación:** Al fusionar las nuevas vistas de HU-2 en `App.jsx`, se agregaron importaciones con la extensión explícita `.jsx`, a diferencia de todas las demás vistas del proyecto que no la incluyen.

### 2.5 Aislamiento de las Nuevas Vistas del Tutor en la Navegación Global
- **Archivo:** `src/components/Header.jsx`
- **Explicación:** Tras el merge de HU-2, se registraron las rutas `/mi-perfil-tutor`, `/mis-cursos-tutor` y `/disponibilidad-tutor`, pero el componente de navegación global `Header.jsx` no fue actualizado. Un usuario con rol `tutor` no tiene ningún enlace en el menú superior para acceder a su perfil, cursos o gestión de disponibilidad.

---

## 3. Errores de Linter y Reglas de React (ESLint)

### 3.1 Incumplimiento de Fast Refresh en Contexto de Tutores
- **Archivo:** `src/context/TutoresContext.jsx`
- **Regla:** `react-refresh/only-export-components`
- **Descripción:** El archivo exporta tanto un componente React (`TutoresProvider`) como una función utilitaria / hook (`useTutoresContext`).
- **Mensaje de ESLint:**
  ```text
  70:17 error Fast refresh only works when a file only exports components.
  Use a new file to share constants or functions between components (react-refresh/only-export-components)
  ```
- **Impacto:** Falla la ejecución de `npm run lint` y desactiva el refresco en caliente confiable (HMR) en el entorno de desarrollo.

### 3.2 Actualización de Estado Síncrona Dentro de un Efecto (`Cascading Renders`)
- **Archivo:** `src/pages/MiPerfilTutor.jsx`
- **Regla:** `react-hooks/set-state-in-effect`
- **Código con error:**
  ```javascript
  useEffect(() => {
    if (!tutor) return;
    const perfil = tutor.perfilTutor || {};
    setFormulario({
      biografia: perfil.biografia || "",
      modalidad: perfil.modalidad || "ambas",
      sedePreferencia: perfil.sedePreferencia || "",
    });
  }, [tutor]);
  ```
- **Mensaje de ESLint:**
  ```text
  30:3 error Calling setState synchronously within an effect can trigger cascading renders (react-hooks/set-state-in-effect)
  ```
- **Impacto:** Causa re-renderizados forzados inmediatos, degrada el rendimiento de la interfaz y rompe la verificación de calidad de código de React 19.

### 3.3 Variables Declaradas No Utilizadas (`no-unused-vars`)
- **Archivo:** `src/pages/DetalleTutor.jsx`
  - Línea 128: `const navigate = useNavigate();` declarada y nunca llamada.
  - Línea 132: `const [semanas] = useState(...);` declarada y nunca utilizada.

---

## 4. Errores de Indentación, Formato y Estilo de Código

Se realizó una auditoría de formato en todos los archivos de `src/`, detectándose múltiples anomalías:

### 4.1 Código sin Indentar en Bloques Internos (Columna 0)
1. **`src/pages/MiPerfilTutor.jsx` (Líneas 25–35):**
   - El hook `useEffect` completo se encuentra pegado al margen izquierdo (columna 0), dentro de la función `MiPerfilTutor()`:
   ```javascript
   function MiPerfilTutor() {
     // ...
   useEffect(() => {
     if (!tutor) return;
     // ...
   }, [tutor]);
   ```
2. **`src/pages/DetalleTutor.jsx` (Línea 173):**
   - El paréntesis y punto y coma de cierre `);` de `semanaTieneBloquesLibres` inicia en columna 0 en lugar de estar indentado a 2 o 4 espacios:
   ```javascript
     const semanaTieneBloquesLibres = horasFilas.some((fila) =>
     semanaActual.dias.some((col) =>
       // ...
     )
   );
   ```

### 4.2 Mezcla de Sangría de 2 Espacios y 4 Espacios en los Mismos Archivos
El proyecto no tiene una regla unificada de indentación; conviven archivos y secciones estructurados a 2 espacios con otros a 4 espacios:
- **`src/pages/MiPerfilTutor.jsx` (Líneas 147–166):** Los elementos `<Link>` tienen bloques indentados a 4 y 8 espacios, mientras que el resto del componente utiliza 2 espacios.
- **`src/utils/fechas.js`:** La función `lunesDeSemana` utiliza 4 espacios de sangría, mientras que `rangoSemana` utiliza 2 espacios. La línea 1 tiene un espaciado anómalo alrededor de comas: `new Date(2026, 9 ,19);`.
- **`src/pages/DetalleTutor.jsx` (Líneas 470–475):** El bloque `<div className="detalle-tutor__sin-bloques-caja">` tiene 10 espacios y su hijo `<div className="detalle-tutor__sin-bloques-icono">` tiene exactamente la misma sangría de 10 espacios, perdiéndose la jerarquía visual de etiquetas.
- **`src/components/TarjetaTutor.jsx`:** Mezcla bloques JSX a 2 y 4 espacios.

### 4.3 Archivos con Primera Línea Vacía
Varios archivos inician con un salto de línea en blanco en la fila 1 antes de los imports o declaraciones:
- `src/main.jsx` (Línea 1 vacía)
- `src/context/TutoresContext.jsx` (Línea 1 vacía)
- `src/hooks/useTutores.js` (Línea 1 vacía)
- `src/pages/MiPerfilTutor.jsx` (Línea 1 vacía)
- `src/estilos.css` (Línea 1 vacía)
- `src/styles/mi-perfil-tutor.css` (Línea 1 vacía)
- `src/styles/disponibilidad-tutor.css` (Línea 1 vacía)

### 4.4 Archivos sin Salto de Línea Final (Missing EOF Newline) y Espacios Residuales
- **Espacio en blanco al final de la línea:** `src/components/TarjetaTutor.jsx` línea 103 termina con dos espacios (`export default TarjetaTutor;  `).
- **Archivos sin salto de línea final:**
  - `src/App.jsx`
  - `src/components/Modal.css`
  - `src/components/ModalProponerHorario.css`
  - `src/components/Presentacion.jsx`
  - `src/components/TarjetaSesion.css`
  - `src/components/TarjetaTutor.jsx`
  - `src/components/TutoresDestacados.jsx`
  - `src/estilos.css`
  - `src/pages/CalificarSesion.jsx`
  - `src/pages/Home.jsx`
  - `src/pages/NoEncontrada.jsx`
  - `src/pages/RankingTutores.jsx`
  - `src/styles/globales.css`
  - `src/styles/sesiones-comun.css`
  - `src/utils/fechas.js`

---

## 5. Errores y Deficiencias por Componentes y Vistas

### 5.1 Componentes (`src/components/`)
1. **`TutoresDestacados.jsx` (Desconexión de datos y tutores inexistentes):**
   - No consume `TutoresContext` ni `useTutores()`. En su lugar, posee un array hardcodeado en memoria.
   - Contiene el tutor `{ id: "u-rodrigo", nombre: "Rodrigo Salazar Ferro" }`. Dicho tutor **no existe** en `tutores.json`. Si un usuario intenta acceder a su ficha, el sistema no lo encuentra.
   - En `tutores.json`, el id `"u-001"` corresponde a "Anita Alvarado Hancco", pero en `TutoresDestacados.jsx` se le asigna el nombre "Ariana Flores Bustamante".
   - Las tarjetas no tienen enlaces (`<Link>`) hacia el perfil del tutor cuando se muestran como destacadas.
2. **`Presentacion.jsx` (Formulario de búsqueda inoperante):**
   - El input `<input placeholder="Busca un curso..." />` guarda el texto en `termino`, pero en el submit (`handleBuscar`) simplemente hace `navigate("/tutores")`, perdiendo la búsqueda del estudiante.
3. **`EstrellasRating.jsx` (Problemas de accesibilidad web):**
   - Los elementos `<span>` interactivos poseen un `onClick` pero carecen de `role="button"`, `tabIndex="0"` y manejadores de eventos de teclado (`onKeyDown`).
4. **`AspectosCalificacion.jsx` (Componente no utilizado):**
   - El componente fue desarrollado pero quedó huérfano; `CalificarSesion.jsx` duplicó los campos de aspectos en su propio código JSX.

### 5.2 Vistas / Páginas (`src/pages/`)
1. **`DetalleTutor.jsx`:**
   - **Alerta de reseñas hardcodeada:** El botón "Ver reseñas" (línea 304) ejecuta `alert('Reseñas de... promedio 4.7 con 28 opiniones.')` en lugar de navegar a la vista de reseñas existente `/tutor/:id` (`FichaTutorReseñas.jsx`).
   - **Navegación con recarga completa:** El botón "Buscar otros tutores" (línea 504) utiliza `window.location.href = "/tutores"`, rompiendo la SPA y perdiendo el estado en memoria, en lugar de usar `navigate("/tutores")`.
2. **`Directorio.jsx`:**
   - **Filtros iniciales excluyentes:** El estado `FILTROS_INICIALES` está fijado rígidamente en `curso: "MA101", modalidad: "remota", dia: "lunes"`. Al ingresar al directorio por primera vez, la vista no muestra todos los tutores sino únicamente los que coinciden con dicha combinación predefinida.
   - **Ignora parámetros de búsqueda:** No lee parámetros de consulta (`searchParams`) provenientes de la barra de búsqueda de la página de inicio.
3. **`CalificarSesion.jsx`:**
   - La pantalla no recibe ningún parámetro (`codigo` de sesión o `id` de tutor), ni actualiza `SesionesContext`, `ValoracionMock.json` o `localStorage`. Solo imprime en consola con `console.log` y muestra un `alert`.
4. **`MisCalificaciones.jsx`:**
   - Carga la totalidad de reseñas de `ValoracionMock.json` en memoria sin filtrar por el estudiante que ha iniciado sesión.
5. **`MiPerfilTutor.jsx`, `MisCursosTutor.jsx` y `DisponibilidadTutor.jsx`:**
   - No emplean la identidad del tutor autenticado desde `useAutenticacion()`. Emplean `useParams()` con un fallback cableado a `"u-001"`:
     ```javascript
     const tutor = tutores.find((item) => item.id === (id || "u-001")) || null;
     ```
     Si un tutor logueado distinto (por ejemplo, Sebastián Rojas `u-003`) ingresa a `/mi-perfil-tutor`, el sistema le carga y modifica los datos de Anita Alvarado (`u-001`).
6. **`RankingTutores.jsx`:**
   - Página huérfana en `src/pages/`. La ruta en `App.jsx` fue reemplazada por una redirección hacia `/tutores?vista=ranking`, pero el componente quedó en el repositorio sin uso.
7. **`NoEncontrada.jsx`:**
   - No incluye los componentes de navegación `Header` ni `Footer`, ofreciendo una experiencia inconsistente en enlaces rotos.
8. **`FichaTutorReseñas.jsx`:**
   - Nombre de archivo con carácter especial no ASCII (`ñ`), lo cual provoca riesgos de resolución en entornos Linux / Docker con normalizaciones UTF-8 distintas (NFC vs NFD).
   - Posee un diccionario rígido `ID_TUTOR_POR_ID_VALORACION = { 101: 'u-001', 102: 'u-002' }`, por lo que las reseñas no funcionan para ningún otro tutor del directorio.

---

## 6. Errores y Deficiencias en Contexto, Hooks y Datos

### 6.1 Contexto y Hooks
1. **Falta de sincronización entre `TutoresContext` y `AutenticacionContext`:**
   - Las modificaciones en `TutoresContext` (datos de perfil, disponibilidad, cursos) no actualizan el objeto `usuario` en `AutenticacionContext`, produciendo discrepancias en la sesión activa.
2. **Fragilidad en `useSesiones(usuario.id)`:**
   - En páginas como `MisSesiones.jsx` (línea 18) y `Solicitudes.jsx` (línea 19), se pasa directamente `usuario.id` a `useSesiones`. Si el estado de usuario se reinicia o se pierde temporalmente en el almacenamiento, se produce una excepción no capturada de tipo `TypeError: Cannot read properties of null (reading 'id')`.

### 6.2 Data y Semillas (`src/data/`)
1. **Nombres de archivo inconsistentes:**
   - `src/data/ValoracionMock.json` utiliza convención PascalCase, mientras que `tutores.json`, `sesiones.json` y `estudiantes.json` emplean minúsculas y kebab-case.
2. **Inconsistencias entre Semilla de Tutores y Componente Destacados:**
   - La información de tutores en `src/data/tutores.json` difiere de la lista hardcodeada en `src/components/TutoresDestacados.jsx` (nombres cambiados, cursos y calificaciones discrepantes).

---

## 7. Archivos Huérfanos, Código Muerto y Assets No Utilizados

### 7.1 Módulos JavaScript y JSX Sin Referencias
- `src/components/AspectosCalificacion.jsx`: Sin uso.
- `src/pages/RankingTutores.jsx`: Sin uso.
- `src/utils/filtrosTutores.js`: Sin uso (y roto con import fallido).
- `src/utils/resumenFiltros.js`: Sin uso.
- `src/utils/fechas.js`: Sin uso.
- `src/utils/usuariosPrueba.js`: Sin uso.

### 7.2 Duplicidad de Utilidades entre HU-4 y HU-5
- Coexisten `src/utils/sesiones.js` (desarrollado para HU-5) y `src/utils/reglasSesion.js` (desarrollado para HU-4), conteniendo funciones con el mismo propósito y nombre (`filtrarSesiones`, `formatearFechaHora`), pero implementadas por separado.

### 7.3 Estilos CSS Sin Referencias
- `src/estilos.css`: Archivo huérfano con más de 500 líneas de estilos de maqueta inicial, no importado en ningún punto de la aplicación.
- `src/App.css`: Archivo vacío con una sola línea de comentario, no importado.
- `src/index.css` y `src/styles/globales.css`: Importan `@import "./styles/tokens.css"` dos veces redundantemente.

### 7.4 Assets No Referenciados
- `src/assets/hero.png`: No importado ni referenciado en estilos ni componentes.
- `src/assets/react.svg` y `src/assets/vite.svg`: Íconos de plantilla inicial no utilizados.
- `public/icons.svg`: Sprite SVG con iconos externos (discord, bluesky, etc.) no utilizados en la plataforma.

---

## 8. Matriz de Prioridad de Corrección

| Nivel | Archivo | Error | Causa Raíz |
| :--- | :--- | :--- | :--- |
| **Bloqueante** | `src/pages/DetalleTutor.jsx` | Falla sintáctica JSX en línea 598 (`</tr>` y `))}` faltantes) | Resolución defectuosa de merge en commit `7c4effc` |
| **Bloqueante** | `src/pages/DetalleTutor.jsx` | `ReferenceError: crearSemanas is not defined` en línea 132 | Código residual de `main` mantenido durante merge en commit `7c4effc` |
| **Bloqueante** | `src/utils/filtrosTutores.js` | `normalizarTexto` no exportado en `src/utils/texto.js` | Desajuste en contrato de importación/exportación |
| **Alto** | `src/context/TutoresContext.jsx` | Error ESLint `react-refresh/only-export-components` | Exportar hook y componente en el mismo archivo `.jsx` |
| **Alto** | `src/pages/MiPerfilTutor.jsx` | Error ESLint `react-hooks/set-state-in-effect` | `setState` síncrono dentro de `useEffect` |
| **Alto** | `src/pages/MiPerfilTutor.jsx`, `MisCursosTutor.jsx`, `DisponibilidadTutor.jsx` | Fallback rígido a `"u-001"` en lugar del tutor autenticado | Falta de integración con `useAutenticacion()` |
| **Medio** | `src/components/TutoresDestacados.jsx` | Tutor `"u-rodrigo"` inexistente y datos hardcodeados | Desconexión entre la semilla `tutores.json` y la maqueta |
| **Medio** | `src/pages/Directorio.jsx` | Filtros iniciales excluyentes (`MA101, remota, lunes`) | Hardcoding de filtros en estado inicial |
| **Medio** | `src/components/Header.jsx` | Faltan accesos a las vistas del tutor en el menú | Desactualización de rutas de navegación post-merge |
| **Bajo** | Múltiples archivos (sección 4) | Errores de indentación (columna 0, líneas vacías, mezcla 2/4 espacios) | Inconsistencia de formato entre desarrolladores |
| **Bajo** | `src/estilos.css`, `src/App.css`, `utils/fechas.js`, etc. | Código muerto y archivos huérfanos | Archivos residuales de entregas previas |
