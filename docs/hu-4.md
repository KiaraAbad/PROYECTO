## Alcance y objetivos de la HU-4

Esta historia permite al **Estudiante** solicitar sesiones a un tutor y seguirlas, y al **Tutor** responder las solicitudes y gestionar cada sesión.

**Requerimientos programados:**
- [x] **Solicitud de sesión** sobre un bloque libre del tutor: curso, tema y modalidad (mockup 4.1, modal sobre `DetalleTutor`).
- [x] **Solapamiento:** se avisa si el estudiante ya tiene una sesión (o solicitud) a esa hora, o si el tutor ya tiene el bloque ocupado.
- [x] **Mis sesiones** (4.2): secciones *Próximas* e *Historial*, filtro por estado y por rango de fechas, acción «Calificar»/«Calificada»/«—» y «Revisar propuesta».
- [x] **Solicitudes recibidas** (4.3): contadores, tarjetas con *Rechazar* (motivo obligatorio), *Proponer otro horario* y *Aceptar*.
- [x] **Proponer otro horario** (4.4): modal de dos columnas con la grilla de reemplazo (Libre / Ocupado / Solicitado / Propuesto).
- [x] **Detalle de la sesión** (4.5): código `TU-2026-XXXX`, tutor, estudiante, curso y tema, enlace remoto, ventana permitida y trazabilidad.
- [x] **Cancelación** con confirmación (hasta 12 h antes si ya está programada) y **reprogramación** (botón del mockup 4.5).
- [x] **Estados vacío** («Aún no tienes sesiones», «No tienes solicitudes pendientes», «Ninguna sesión coincide…») y **carga** (esqueletos).
- [x] **Avisos** de resultado (caja verde/roja) y errores junto al campo.

**Fuera de alcance (otras historias):** cierre de sesión (HU-5), calificar (HU-6), disponibilidad del tutor (HU-2), inicio de sesión (HU-1) y cualquier backend.

---

## Inventario de componentes y archivos

### A. Vistas (`src/pages`)
| Archivo | Ruta | Mockup |
|---|---|---|
| `MisSesiones.jsx` | `/mis-sesiones` | 4.2 |
| `Solicitudes.jsx` | `/solicitudes` | 4.3 |
| `DetalleSesion.jsx` | `/mis-sesiones/:codigo` | 4.5 |

La solicitud (4.1) no es una página: es un modal que abre `DetalleTutor`.

### B. Componentes (`src/components`, cada uno con su `.css`)
| Componente | Uso |
|---|---|
| `ModalSolicitud` | 4.1 — formulario de solicitud (lo abre `DetalleTutor`) |
| `ModalProponerHorario` | 4.4 — propuesta/reprogramación con grilla de reemplazo |
| `ModalRechazo` | 4.3 — rechazo con motivo obligatorio |
| `ModalCancelarSesion` | 4.5 — «¿Cancelar la sesión del …?» |
| `ModalConfirmacion`, `Modal` | base de los diálogos |
| `TarjetaSesion` | fila de «Mis sesiones» (normal y compacta) |
| `TarjetaSolicitud` | tarjeta de «Solicitudes recibidas» |
| `BadgeEstadoSesion` | badge de estado (color + texto) |
| `TrazabilidadSesion` | línea de tiempo del detalle |
| `EstadoVacioAgenda`, `EsqueletoSesiones`, `Notificacion` | vacío, carga y aviso de resultado |

> `EstadoVacio` y `EsqueletoCarga` ya existían (son los del directorio, con texto fijo); por eso los de HU-4 llevan otro nombre.

### C. Datos, lógica y hooks
| Archivo | Descripción |
|---|---|
| `data/sesiones.json` | 16 sesiones semilla (todos los estados y casos límite) |
| `data/estudiantes.json` | Estudiantes que no son tutores (`u-101` …) |
| `hooks/useSesiones.js` | Lee `sesiones.json` (con demora, como `useTutores`) y expone las acciones |
| `hooks/useAviso.js` | Estado del aviso de resultado, que se cierra solo |
| `utils/reglasSesion.js` | Reglas puras: solapamiento, ventanas de tiempo, filtros y acciones |
| `utils/personas.js` | Busca a una persona por id en `tutores.json` / `estudiantes.json` |
| `utils/usuariosPrueba.js` | Estudiante (`u-101`, Joaquín) y tutor (`u-003`, Sebastián) de los mockups |
| `styles/sesiones-comun.css` | Botones y estructura de página compartidos por HU-4 |
| `styles/mis-sesiones.css`, `solicitudes.css`, `detalle-sesion.css` | Estilos de cada vista |

### D. Archivos de otros integrantes que se modificaron (cambios mínimos)
| Archivo | Cambio |
|---|---|
| `App.jsx` | 3 imports y 3 rutas |
| `components/Header.jsx` + `.css` | «Mis sesiones» y «Mis calificaciones» apuntaban a `/tutores`: ahora van a `/mis-sesiones` y `/mis-calificaciones`. Menú de **tutor** (Mi perfil de tutor, Mis cursos, Disponibilidad, Solicitudes, Mis sesiones) y botón «Tutor» en verde, como en los mockups. El subrayado de la sección activa se calcula para todos los enlaces. |
| `components/Footer.jsx` | Prop opcional `rol="tutor"`: muestra «Guía del tutor» en lugar de «Directorio» y oculta «Términos del programa» (así está en 4.3 y 4.5). |
| `pages/DetalleTutor.jsx` | El botón «Continuar con la solicitud» abre `ModalSolicitud` en lugar del `alert`, y se muestra el aviso «Solicitud enviada…» con el botón «Ir a mis sesiones». |

---

## Modelo de datos

Cada sesión sigue la entidad `Sesion` de `planificacion.md` §10.2, con **estos añadidos que el grupo debe validar**:

1. `estado` agrega `pendiente`, `horario-propuesto` y `rechazada` (el contrato solo tenía `programada`, `realizada`, `no-asistio`, `cancelada`; no había forma de representar una solicitud sin responder).
2. `horarioAlternativo` pasa a ser `{ fecha, horaInicio, horaFin, propuestoPor: "tutor" | "estudiante", estadoPrevio, mensaje }` (o `null`).
3. Campo `canceladaPor: "tutor" | "estudiante" | null`.
4. Los eventos de `trazabilidad` admiten un campo opcional `detalle` (por ejemplo, el motivo del rechazo).
5. `enlaceSesion` se genera al quedar `programada` si la modalidad es remota.

```
pendiente ── aceptar ───────────────────────► programada ─► realizada | no-asistio (HU-5)
    │ rechazar (motivo) ─► rechazada
    │ proponer horario ──► horario-propuesto ── aceptar ► programada
    │                                        └─ rechazar ► cancelada (si venía de una solicitud)
    │                                                      programada (si venía de una programada)
    └ cancelar ─► cancelada          programada ── reprogramar ─► horario-propuesto
```

**Ids:** los tutores usan los de `tutores.json` (`u-001` Ariana … `u-026`); los estudiantes que no son tutores usan `u-101` en adelante.

### Datos semilla: casos para probar
«Hoy» para las reglas es **12/09/2026 12:00** (`AHORA` en `reglasSesion.js`), porque los datos son de setiembre de 2026.

| Código | Escenario |
|---|---|
| `0184` | Programada, estudiante Joaquín con Sebastián (mockups 4.2 y 4.5) |
| `0198` | Propuesta de horario del tutor (Ariana) esperando respuesta de Joaquín |
| `0207` | Solicitud pendiente de Joaquín para el **mismo bloque que `0184`** → *Aceptar* muestra el error de solapamiento |
| `0205`, `0206` | Solicitudes pendientes que sí se pueden aceptar |
| `0212` | Programada que empieza en 6 h → *Cancelar* y *Reprogramar* quedan bloqueados (ventana de 12 h) |
| `0191` / `0172` | Realizadas: «Calificar» y «Calificada 5.0» (campo provisional `calificacion`; ver la nota de abajo) |
| `0163`, `0158`, `0149` | No asistió, cancelada y rechazada con motivo |

> **Nota sobre «Calificada 5.0»:** las valoraciones son de HU-6. Mientras tanto, `sesiones.json` guarda un campo provisional `calificacion` (puntaje; `null` = sin calificar) que solo trae `0172`. Cuando HU-6 tenga su entidad `Valoracion`, `enriquecer()` en `useSesiones.js` debe leer de ahí.

---

## Reglas de negocio (`utils/reglasSesion.js`)

| Regla | Detalle |
|---|---|
| Solapamiento | Mismo día y rangos horarios que se cruzan. Para el estudiante cuentan sus sesiones `programada` y sus solicitudes `pendiente`; para el tutor solo `programada`. Se revisa a la persona en ambos roles. Se vuelve a revisar al aceptar y al aceptar una propuesta. |
| Cancelación | Una solicitud (pendiente o con propuesta) siempre se puede cancelar; una sesión programada, hasta 12 h antes. El tutor no cancela una solicitud pendiente: debe aceptarla, rechazarla o proponer otro horario. |
| Reprogramación | Misma ventana de 12 h; la otra parte debe aceptar. Si rechaza, la sesión conserva su horario. |
| Cierre | `evaluarCierre()` habilita «Cerrar sesión» desde que termina el bloque hasta 72 h después. Lo usa HU-5 (el botón queda deshabilitado hasta entonces y no navega a ninguna parte). |
| Respuesta del tutor | Aviso «Más de 48 horas sin responder» en la tarjeta. |
| Solicitud | Curso del tutor, tema 10–200 caracteres, modalidad permitida por el tutor, bloque posterior al momento actual. |
| Próximas / Historial | Próximas = `pendiente`, `horario-propuesto`, `programada` (de la más cercana a la más lejana). Historial = el resto (de la más reciente a la más antigua). |
| Contadores de solicitudes | *Pendientes* = `pendiente` + `horario-propuesto`; *aceptadas* = `programada`; *rechazadas* = `rechazada`. |

Las acciones (`crearSolicitud`, `aceptarSolicitud`, `rechazarSolicitud`, `proponerHorario`, `aceptarPropuesta`, `rechazarPropuesta`, `cancelarSesion`) son funciones puras que devuelven `{ ok: true, sesiones, sesion }` o `{ ok: false, error: { codigo, mensaje, campos } }`. `useSesiones` las envuelve y las vistas muestran el error donde corresponde (junto al campo, en el modal o en la tarjeta).

Las sesiones modificadas se guardan en una variable del módulo `useSesiones.js`: **se conservan al navegar entre páginas y se reinician al recargar el navegador**.

---

## Cómo probarlo

`npm install` y `npm run dev`. No hay inicio de sesión, así que las vistas usan al estudiante Joaquín y al tutor Sebastián (mockups).

| Qué probar | Cómo |
|---|---|
| Solicitar sesión | `/tutores/u-003` → «Continuar con la solicitud». El bloque por defecto (lun 14/09 16:00) **choca con `0184`**: se ve el aviso rojo, «Elegir otro bloque» y el botón deshabilitado. Elige otro bloque libre (por ejemplo, mié 16/09 16:00), vuelve a abrir el modal y envía: aparece el aviso verde y la solicitud en `/mis-sesiones` como *Pendiente*. |
| Mis sesiones | `/mis-sesiones`; `/mis-sesiones?vacio=1` muestra el estado «Aún no tienes sesiones». Filtra por un estado sin resultados para ver «Ninguna sesión coincide…». |
| Solicitudes | `/solicitudes`: aceptar `0205` o `0206`; aceptar la de Joaquín (`0207`) muestra el error de solapamiento; *Rechazar* pide motivo; *Proponer otro horario* abre la grilla (elige Mar 15/09 16:00). Al resolver las tres, aparece el estado vacío. |
| Detalle | `/mis-sesiones/TU-2026-0184` (vista tutor). Desde «Mis sesiones» entras como estudiante; en `0198` el botón «Revisar propuesta» permite aceptar o rechazar el nuevo horario. 
