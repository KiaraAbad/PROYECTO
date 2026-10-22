# HU-5: desarrollo y cierre

Versión para la Entrega 1: interfaz React con el acceso simulado de HU-1, la agenda de HU-4 y el desarrollo y cierre de HU-5 conectados. HU-1 aporta el usuario y rol activos; agenda y cierre comparten las sesiones. No incluye servicios web, base de datos ni autenticación de servidor. La guía de la conexión está en `docs/HU1-integracion-acceso.md`.

La base de HU-4 procede de la rama `h4`, commit `9299f501345230bbef5ae3fccf2c85b153e4263c`, del repositorio del grupo. Al revisar esta integración, el 21 de octubre de 2026, el [PR #8](https://github.com/KiaraAbad/PROYECTO/pull/8) seguía abierto: integrar esa rama localmente no significa que su pull request ya esté aprobado o incorporado a `main`.

## Qué probar

Abre `http://127.0.0.1:5173/login`. En **Cuentas de prueba**, elige a Sebastián para tutor o a Joaquín para estudiante y pulsa **Ingresar**. Luego abre `/sesiones`. Usa siempre la misma dirección: `localhost` y `127.0.0.1` tienen almacenamientos separados. Las vistas normales siguen los mockups, sin selector de participantes ni botón de reinicio. El selector Tutor / Estudiante solo cambia entre los roles permitidos de la misma cuenta.

También puedes abrir `http://127.0.0.1:5173/mis-sesiones` para la agenda de HU-4 y `/solicitudes` para las solicitudes del tutor. El usuario y rol seleccionados se comparten al navegar hacia HU-5 y volver; el encabezado no cambia solo el texto del menú.

Para repetir casos durante el desarrollo, abre manualmente `http://127.0.0.1:5173/sesiones/pruebas`. Muestra la cuenta activa y permite restablecer los datos con confirmación; cambiar de persona requiere salir e ingresar desde el login. No tiene enlaces en las vistas normales y en la compilación de entrega redirige a Mis sesiones. **Restablecer ejemplo reinicia tanto la agenda de HU-4 como los cierres, borradores y materiales de HU-5**. No lo uses si deseas conservar tus cambios actuales. La copia antigua de HU-5 no se borra al reiniciar la versión compartida.

En una demo nueva o restablecida, la sesión `TU-2026-0184` se prepara para que haya terminado hace aproximadamente media hora. Al recuperar un avance anterior se conservan sus fechas y su cierre: esa sesión no se reabre ni cambia de día automáticamente. Los límites de duración y texto descritos abajo son decisiones de esta versión que se deben confirmar con el grupo.

1. Abre el historial de HU-5 con el perfil de tutor. Revisa los filtros por curso, fechas y estado y prueba una combinación sin resultados.
2. Abre una sesión programada que ya terminó y cuyo plazo de cierre no venció. Pulsa **Registrar cierre** y luego el botón de cierre definitivo sin completar la asistencia: debe mostrar errores junto a los campos.
3. Marca asistencia de ambos, ingresa una duración válida, escribe las notas y guarda un borrador. El borrador no debe convertir la sesión en realizada ni sumar horas.
4. Finaliza el cierre. La sesión debe aparecer como **Realizada** y sus minutos deben reflejarse en el resumen y en el curso correspondiente.
5. En otra sesión, marca la ausencia de alguna de las partes. El resultado debe ser **No asistió** y no debe aumentar las horas acumuladas.
6. En materiales, agrega un enlace HTTPS con título, edítalo y elimínalo. La eliminación debe pedir confirmación. Prueba una dirección incompleta y una con `javascript:`: deben rechazarse.
7. Sal de la cuenta e ingresa como Joaquín. Debe consultar sus notas y materiales sin controles de edición y sin acceso a sesiones ajenas. Cambiar a estudiante desde Sebastián conserva a Sebastián; no lo convierte en Joaquín.
8. Comprueba una sesión futura, una cancelada y una fuera del plazo de cierre: no deben permitir finalizar un nuevo cierre.
9. Recarga la página y revisa el aviso de almacenamiento si tu navegador impide guardar datos. La demo no depende de un servidor para almacenar sus cambios.
10. En HU-4, acepta una solicitud y comprueba que aparece programada en las vistas de sesiones. Desde el detalle de una programada ya terminada y dentro del plazo, abre **Cerrar sesión**: debe mostrar el formulario de HU-5 para ese mismo código.
11. Después de un cierre de HU-5, vuelve a la agenda o al detalle de HU-4. Debe mostrar el desenlace actualizado y conservarlo al recargar. Una sesión cancelada desde HU-4 no debe admitir un cierre nuevo en HU-5.

Las fechas y horas de las sesiones se interpretan en **America/Lima (UTC−05:00)**. La ventana de cierre comienza al terminar la sesión y llega hasta 72 horas después, incluido el instante límite. Solo una sesión programada puede cambiar por cierre a realizada o no-asistio; cancelar pertenece al flujo de agenda de HU-4.

## Cómo leer el código

| Parte | Para qué sirve | Concepto React/JavaScript |
|---|---|---|
| `src/data/` | Catálogos del grupo, sesiones de HU-4 y migración del almacenamiento anterior de HU-5. | Objetos, arreglos y JSON. |
| `src/context/` | Un Provider global para agenda, usuarios, roles, cierres y materiales. | Context, hooks y actualizaciones sin mutar el origen. |
| `src/hooks/useSesiones.js` | Interfaz común para las pantallas de HU-4 y HU-5. | Hook propio y adaptación de interfaces. |
| `src/utils/estadoCompartido.js` | Aplica cambios de agenda y cierres a la misma fuente de datos. | Funciones puras, copias de objetos y trazabilidad. |
| `src/utils/reglasSesion.js` | Solicitudes, propuestas, cancelación y ventanas de agenda de HU-4. | Transiciones de estado, permisos y fechas. |
| `src/utils/sesiones.js` | Ventanas de cierre, validaciones, filtros y sumatorias. | Funciones puras, `filter`, `reduce` y fechas. |
| `src/utils/presentacionSesiones.js` | Fechas numéricas en Lima y recuento mensual de cierres. | `Intl.DateTimeFormat`, `Map` y funciones sin efectos. |
| `src/pages/` | Pantallas de cierre, materiales, historial y horas. | Componentes, props, eventos y formularios controlados. |
| `src/components/` | Piezas reutilizables de la interfaz. | Composición y callbacks. |
| `src/styles/` | Apariencia de las pantallas de HU-5. | CSS propio basado en la paleta del grupo. |
| `tests/hu5.test.mjs` | Casos de reglas funcionales y límites de fecha. | Pruebas con herramientas incluidas en Node. |
| `tests/hu5-legibilidad.test.mjs` | Casos adicionales para comprobar que la reorganización conserva las reglas. | Pruebas de límites y de no modificación de los datos originales. |
| `tests/hu5-presentacion.test.mjs` | Formatos numéricos y gráfico de cierres. | Pruebas de zona horaria, recuento y no modificación. |
| `tests/hu4-almacen.test.mjs` | Semilla compartida, equivalencias de usuarios y recuperación de avances antiguos. | Pruebas de migración y almacenamiento. |

El Provider se monta una sola vez en `App.jsx`, alrededor de las rutas. Navegar entre `/mis-sesiones`, `/solicitudes` y `/sesiones` no crea almacenes independientes ni reinicia los datos.

Empieza leyendo la pantalla de cierre y sigue sus eventos hacia el Context y los validadores. El flujo es: **evento → validar → actualizar el estado → React vuelve a mostrar los datos**. El historial y el resumen consultan ese mismo estado, por eso cambian al cerrar una sesión.

### Orden para estudiar esta versión

1. `src/pages/CerrarSesion.jsx`: empieza por `FormularioCierre`. Ubica `formulario`, `actualizar`, `solicitarCierre` y `confirmarCierre`. Son los datos del formulario y las acciones de sus botones.
2. `src/utils/sesiones.js`: lee `validarCierre` y `ventanaCierre`. Reciben datos y devuelven un resultado sin depender de React.
3. `src/context/SesionesProvider.jsx`: sigue `cerrarSesion` hasta `guardarRegistro`. Aquí se comprueban los permisos y se actualizan los datos compartidos.
4. `src/pages/DetalleCierreSesion.jsx`, `HistorialSesiones.jsx` y `ResumenHoras.jsx`: muestran o calculan resultados a partir de esos mismos datos; no guardan otra copia de las horas.
5. `src/pages/MaterialCompartido.jsx`: repite el patrón del formulario para agregar, editar y quitar enlaces.
6. `src/data/hu5-almacen.js`: déjalo para el final. Prepara el ejemplo y recupera los avances del navegador; gran parte de sus comprobaciones protege contra datos guardados inválidos.

Los nombres propios del proyecto se escriben principalmente en español. Los nombres de React (`useState`, `useEffect`, `useRef`, `children`), los eventos (`onClick`, `onChange`) y las funciones del navegador (`localStorage`, `JSON`) conservan sus nombres originales.

### Conceptos que vas a encontrar

- `useState` conserva un valor que usa la pantalla. Su función `set...` cambia ese valor y solicita a React actualizar lo mostrado.
- `useSesiones()` sin argumento lee la interfaz de HU-5: usuario activo, rol, sesiones, cierres y materiales. `useSesiones(usuario.id)` ofrece la interfaz que usan las pantallas de agenda de HU-4: `todas`, `sesiones`, `aceptar`, `rechazar`, `proponer`, `cancelar`, etc. Son dos formas de consultar el mismo Context, no dos almacenes. El identificador debe coincidir con el usuario activo para operar.
- `useEffect` ejecuta una tarea después del render. En el Provider guarda los datos en el navegador cuando cambia `datos`.
- `useRef` mantiene una referencia entre renders. Se usa para acceder a un input o conservar el último conjunto de datos sin esperar otro render.
- `{ ...formulario, [campo]: valor }` crea otro objeto con los campos anteriores y reemplaza solo la propiedad indicada por `campo`.
- `??` usa el valor de la derecha solo si el de la izquierda es `null` o `undefined`; `?.` permite consultar una propiedad cuando su objeto podría no existir.
- `map` construye otra lista, `filter` selecciona elementos y `find` busca uno. `Map` (con mayúscula) agrupa acumulados por una clave.
- Las operaciones de HU-5 devuelven `ok`, `errores` y `mensaje`. Las de agenda conservan el contrato de HU-4 (`ok`, `sesion` o `error`). Las pantallas revisan `ok` para saber si deben continuar o mostrar los errores.

Para explicar un cierre en una exposición: **el evento del formulario valida los campos → el usuario confirma → el Provider comprueba acceso y plazo → actualiza el cierre → React actualiza detalle, historial y horas → el efecto conserva los datos en localStorage**. No se realiza el cierre definitivo al guardar un borrador.

## Decisiones de esta versión

- El cierre pertenece a HU-5 y se identifica con `sesionCodigo`. No se reescriben los archivos JSON de referencia. El Provider combina la sesión y su cierre, publica el estado efectivo hacia la agenda y registra la trazabilidad del cierre; por eso HU-4 y HU-5 muestran el mismo resultado.
- Un cierre borrador conserva datos parciales; un cierre final requiere asistencia explícita de ambas partes. Si ambos asistieron, exige notas y duración entera de 15 a 240 minutos, en pasos de 15. Una inasistencia no exige duración ni notas y no suma horas.
- Las notas admiten hasta 3000 caracteres y los pendientes hasta 2000. Cada material requiere título (máximo 120), URL HTTP/HTTPS válida (máximo 2048) y descripción opcional (máximo 500).
- Solo los cierres finalizados de sesiones realizadas suman minutos. Los filtros de fechas incluyen el primer y el último día seleccionados.
- Los enlaces compartidos son URLs; no se suben archivos. Las reglas de seguridad y de permisos se volverán a validar en el backend de la Entrega 2.

## Integración realizada y límites de alcance

El punto de unión es `Sesion.codigo` junto con `tutorId`, `estudianteId` y `curso.codigo`. HU-4 conserva solicitudes, aceptación, rechazo, propuestas, cancelación y su agenda. HU-5 conserva asistencia, notas, materiales, historial y horas. Las rutas `/mis-sesiones` y `/solicitudes` ya consultan el estado compartido y los detalles de agenda enlazan al cierre y a los materiales de HU-5 usando el mismo código.

### Almacenamiento y datos anteriores

- La clave actual es `tutorias.sesiones.v2`, con `{ version: 2, sesiones, cierres }`. Los cambios de ambas HU se guardan en ella.
- La clave anterior `tutorias.hu5.v1` queda intacta como respaldo. Si no hay datos v2 válidos y existe una copia v1 válida, se migra una sola vez al cargar y el Provider conserva el resultado en v2.
- La migración identifica a las personas por nombre: Sebastián pasa de `u-001` a `u-003`; Joaquín de `u-002` a `u-101`; Camila de `u-003` a `u-002`; Antonella de `u-004` a `u-102`. Los identificadores finales corresponden a los catálogos del grupo, no a la semilla antigua aislada de HU-5.
- Ante un código repetido, la sesión ya guardada tiene prioridad: conserva fecha, horario, curso, notas, cierre y materiales. Se agregan las sesiones nuevas de HU-4 que no colisionan; no se reasigna un cierre antiguo a otra persona por compartir un código.
- Se aceptan todos los estados de HU-4, incluidos `pendiente`, `rechazada` y `horario-propuesto`, para que recargar la agenda no regenere los datos por error.

Las reglas de ambas HU usan el reloj real y fechas interpretadas en Lima. La semilla de HU-4 se desplaza desde su fecha de referencia al crear una demo por primera vez o al restablecerla; también se desplazan las propuestas y la trazabilidad de ejemplo. **Recargar no desplaza las sesiones guardadas**, y no hay un reloj congelado en septiembre que habilite o bloquee cierres artificialmente.

### Qué sigue siendo una simulación

El login de HU-1 ahora identifica la cuenta de la demo y comparte su ID y rol mediante `AutenticacionProvider`. Hay registro local, ingreso, salida, conservación del acceso y rutas restringidas por rol. No hay autenticación de servidor ni autorización segura frente a quien altere el navegador. No deben utilizarse contraseñas reales.

Las páginas de HU-3 y HU-6 presentes en la rama del grupo se conservan. No se implementa una persistencia completa compartida para calificaciones y reseñas de HU-6. De HU-1 quedan pendientes invitaciones del coordinador, edición de perfil, fotografía y contacto, cambio de contraseña y recuperación. La activación de tutor y las demás pantallas de HU-2 no se implementan en esta conexión.

### Cómo explicarlo en la exposición

«HU-1 identifica al participante de la demo y comparte su ID y rol. HU-4 y HU-5 usan esa misma identidad y un estado común de sesiones. El tutor registra la asistencia y confirma el cierre; se comprueban el participante y las 72 horas. El cierre actualiza agenda, historial y horas. Un borrador no suma horas y una inasistencia tampoco. Salir elimina el acceso, pero conserva las tutorías. Es una simulación local de la primera entrega, sin servidor».

## Apariencia y recursos locales

La HU-5 usa la paleta y la tipografía Source Sans 3 de los mockups. La fuente se incluye en `public/fonts/`, junto con su licencia SIL Open Font License, desde el repositorio oficial `adobe-fonts/source-sans`; el navegador no necesita consultar servicios externos de fuentes. Los estilos están limitados a `.hu5-app` para no alterar las pantallas del grupo. En pantallas pequeñas se apilan tarjetas y acciones; las tablas se desplazan dentro de su propio contenedor.

«Notas sobre lo trabajado» son anotaciones del tutor, no calificaciones numéricas. «Registrar cierre» abre el formulario y el botón de cierre solicita la confirmación definitiva; no son botones para salir de la cuenta. El cierre presenta asistencia en filas, selector de duración y estado previsto en el panel lateral. Los materiales se presentan en tarjetas a todo el ancho. El resumen reúne horas totales, horas por curso y un gráfico mensual con los valores calculados, no con las cifras fijas del dibujo del mockup. Estos ajustes visuales no cambian las reglas ni los registros guardados.

El gráfico «Sesiones cerradas por mes» cuenta cierres realizados e inasistencias; las tarjetas de horas solo suman sesiones realizadas. El selector de curso del resumen está dentro de «Periodo». El historial tiene botones de página numerados. «Guía del tutor» y «Ayuda», en el pie, abren instrucciones de HU-5 en lugar de enlaces vacíos.

«Solicitudes» y «Agenda» ya tienen destinos de HU-4 integrados. La navegación de HU-5 conserva Mis sesiones, Historial y Resumen de horas, junto con los accesos a la agenda y las solicitudes que corresponden al rol. Las pantallas de «Mis cursos» y «Disponibilidad» pertenecen a HU-2; no se inventan pantallas de esas HU como parte del cierre.

## Comprobaciones antes de guardar el avance

Desde la carpeta del proyecto:

```bash
npm run build
npm run lint
node --test tests/*.test.mjs
git status
git diff
```

Las pruebas automáticas incluyen las reglas de HU-4/HU-5 y `tests/hu1-autenticacion.test.mjs`. Se comprueban dominios de correo, validaciones de registro, credenciales locales, conservación y limpieza de la identidad, roles, cierres y migración sin pérdida del avance. Ninguna prueba automática reemplaza recorrer las pantallas en el navegador.

Antes de publicar, revisa el conjunto integrado sobre la base de `h4`, no solamente los archivos antiguos de HU-5: ahora también hay adaptaciones de rutas, encabezado, agenda y almacenamiento que permiten conectarlas. Conserva el respaldo del avance previo. No incluyas `node_modules`, credenciales ni archivos de prueba personales. Preparar esta versión local no hace por sí solo un commit, una subida ni una aprobación del PR de HU-4; la publicación en la rama y la revisión con el equipo son pasos posteriores.
