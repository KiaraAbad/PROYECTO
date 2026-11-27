# 📋 Planificación del Proyecto — Tutorías entre Pares

> **Archivo base del proyecto.** Este documento es la fuente única de verdad para cualquier agente o integrante que trabaje en el repositorio. Antes de escribir código, lee este archivo completo. Cualquier decisión técnica, de diseño o de estructura que no esté aquí se define en el `Proyecto_PW_2026-2_Tema4_Tutorias_entre_Pares.docx` (requerimientos) y en `Tema4_Mockups_f.pdf` (diseño y mockups).

---

## 1. Ficha del proyecto

| Campo | Valor |
|---|---|
| **Asignatura** | Programación Web |
| **Periodo** | 2026-2 |
| **Tema** | 4 — Tutorías entre pares |
| **Universidad** | Universidad de Lima |
| **Entrega 1 (nota 2)** | Semana 9 — **solo interfaz** (React), con datos mock/JSON en el front |
| **Entrega 2 (nota 4)** | Semana 15 — se agregan servicios web (Node + Express), base de datos y despliegue |
| **Modo de trabajo** | Grupos de 5–6 integrantes, cada uno responsable de **una historia funcional completa** |
| **Repositorio** | Uno solo, una rama por integrante, integración por *pull requests* revisados por otro miembro |

> ⚠️ **Regla de asignación:** las historias se desarrollan **en orden, desde HU-1**. Un equipo de 5 hace HU-1 → HU-5; de 6, hasta HU-6. La asignación se comunica al docente en la **semana 4** y no se modifica después.

---

## 2. Descripción del caso

Plataforma web que conecta a estudiantes de la Universidad de Lima que necesitan reforzar un curso con otros estudiantes que lo dominan y se ofrecen como tutores.

- El **tutor** declara los cursos que enseña, la modalidad de atención y su disponibilidad semanal.
- El **estudiante** lo ubica en el directorio, revisa su ficha y solicita una sesión sobre un bloque disponible, indicando el tema.
- El tutor **acepta**, **rechaza con motivo** o **propone un horario alternativo**.
- Al realizarse, la sesión se **cierra** con registro de asistencia, notas del tutor y enlaces a material compartido.
- El estudiante **califica** al tutor; un **coordinador** supervisa tutores y consulta métricas.

### Alcance
- **Incluye:** registro/login con control por rol · ficha y disponibilidad del tutor · directorio con búsqueda y filtros · solicitud y agenda de sesiones · cierre con asistencia y notas · valoraciones · supervisión con tablero de métricas.
- **No incluye:** envío real de correos · pagos en línea · videollamadas integradas · carga de archivos · sincronización con calendarios externos.

---

## 3. Actores y roles

| Actor | Descripción |
|---|---|
| **Visitante** | No autenticado. Ve landing, directorio y fichas en modo lectura. |
| **Estudiante** | Busca tutores, solicita sesiones, sigue su agenda, califica. |
| **Tutor** | Estudiante con perfil activado: mantiene ficha, disponibilidad, responde solicitudes y cierra sesiones. |
| **Coordinador** | Supervisa tutores, gestiona cuentas, consulta métricas. Cabecera oscura propia (`#2B2670`) y distintivo «Panel del coordinador». |

> El rol **tutor se activa sobre la cuenta del estudiante** (conmutador Estudiante ⇄ Tutor en la cabecera autenticada).

---

## 4. Historias funcionales (HU)

Cada integrante es dueño de sus entidades, vistas y servicios de principio a fin: **interfaz, servicios web, acceso a datos y pruebas**, en ambas entregas.

### HU-1 — Cuenta y acceso
- Registro de estudiante: nombres, apellidos, correo institucional (`@aloe.ulima.edu.pe`), contraseña, carrera, ciclo. Registro del coordinador por invitación.
- Login/logout con redirección por rol; protección de rutas y vista 403. El rol tutor se activa sobre la cuenta.
- Consulta y edición de cuenta (fotografía, contacto); cambio y recuperación de contraseña.

### HU-2 — Ficha y disponibilidad del tutor
- Activar/desactivar cuenta como tutor.
- CRUD de cursos que enseña (nivel declarado + breve descripción de experiencia).
- Biografía, modalidad (presencial / remota / ambas), sede de preferencia.
- Disponibilidad semanal recurrente por día y bloque horario, con **excepciones puntuales por fecha** (listado con eliminación).
- Ficha pública del tutor (la que ve el estudiante).

### HU-3 — Directorio de tutores
- Listado de tutores activos con paginación y total de coincidencias.
- Filtros: curso, carrera, modalidad, día de atención; búsqueda por texto.
- Ordenamiento: nombre, n.º de cursos, disponibilidad más próxima.
- Filtros activos visibles con remoción individual o total.
- Detalle del tutor: ficha, cursos, disponibilidad de la semana; navegación entre semanas; aviso cuando no hay bloques libres en el rango.

### HU-4 — Agenda de sesiones
- Solicitud sobre bloque disponible (curso, tema, modalidad).
- Validación de solapamiento con sesiones del tutor y del propio estudiante.
- Respuesta del tutor: aceptar / rechazar con motivo / proponer horario alternativo.
- «Mis sesiones» (estudiante y tutor) con filtro por estado y rango de fechas.
- Cancelación por cualquiera de las partes dentro de la ventana permitida y con confirmación.
- Detalle de sesión con código (formato `TU-2026-XXXX`) y trazabilidad de cambios.

### HU-5 — Desarrollo y cierre
- Registro de asistencia de ambas partes al término.
- Notas del tutor (visibles para el estudiante) y temas pendientes.
- Enlaces a material compartido, con edición y eliminación (sin carga de archivos: solo URLs).
- Estados de sesión: `programada → realizada | no asistió | cancelada` con sus transiciones.
- Historial por estudiante y tutor con filtros por curso y periodo.
- Resumen de horas acumuladas por tutor y curso.

### HU-6 — Valoraciones *(complementaria)*
- Calificación del tutor tras sesión cerrada: puntaje general, comentario y por aspectos (claridad, puntualidad, dominio del tema).
- Una sola calificación por sesión, editable dentro del plazo (7 días).
- Ficha del tutor: promedio, distribución, listado filtrable. Ranking de tutores por curso.
- Estudiante: listado de sus calificaciones con edición/eliminación.

### HU-7 — Supervisión y métricas *(complementaria)*
- Listado de tutores con filtros/búsqueda; ficha con historial de sesiones.
- Suspensión y reactivación de tutor con motivo. Los suspendidos **no aparecen en el directorio**.
- Gestión de usuarios con filtros, búsqueda, paginación y bloqueo de cuentas.
- Tablero: sesiones del periodo, tasa de inasistencia, horas acumuladas, distribución por curso y carrera en gráfico, acotable por fechas.

---

## 5. Stack tecnológico

### 5.1 Entregas y tecnologías obligatorias

| Componente | Tecnología |
|---|---|
| **Interfaz** | React (Vite), enrutamiento con **React Router**, estado con **hooks + Context** |
| **Estilos** | CSS propio o preprocesador (variables CSS de diseño) |
| **Servicios web** | Node.js con **Express**, estilo REST |
| **Base de datos** | Relacional o no relacional, con ORM o patrón Repository |
| **Control de versiones** | Git + repositorio remoto (GitHub) |
| **Despliegue** | Nube de libre elección, capa gratuita |

### 5.2 Librerías previstas

| Librería | Uso | Estado |
|---|---|---|
| `react` + `react-dom` | Core UI | ✅ ya instalado |
| `react-router-dom` | Enrutamiento y rutas protegidas | 📦 agregar en Entrega 1 |
| `vite` | Bundler/dev server | ✅ ya instalado |
| `express` | Backend REST | 📦 Entrega 2 |
| `cors`, `dotenv` | Middleware básico + variables de entorno | 📦 Entrega 2 |
| `bcrypt` | Hash de contraseñas | 📦 Entrega 2 |
| `sequelize` o equivalente | ORM / capa de datos | 📦 Entrega 2 (según DB elegida) |
| `jsonwebtoken` o sesiones | Autenticación | 📦 Entrega 2 |

> ❌ **Prohibido:** plantillas de administración, temas comerciales, NestJS para el backend, Firebase como scaffolding de APIs. ✅ **Permitido:** librerías de componentes como Material UI (opcional; preferimos CSS propio con tokens).

### 5.3 Arquitectura y capas (Entrega 2)

```
Interfaz (React)  →  Servicios web (Express REST)  →  Capa de datos (ORM/Repository)
```

- **Sin acceso a datos en controladores ni consultas en componentes de interfaz.**
- Validaciones **repetidas en servidor** (no confiar en el cliente).
- Contraseñas **cifradas** con bcrypt.
- Servicios responden con **códigos HTTP correctos** (200/201/400/401/403/404/409/422/500).
- **El repositorio NO contiene credenciales**: se manejan con variables de entorno (`.env` + `.gitignore`).

---

## 6. Sistema de diseño (fuente: mockups)

### 6.1 Paleta de colores

| Token | Hex | Uso |
|---|---|---|
| `primary` | `#3B3596` | Índigo profundo: marca, botones primarios, enlaces activos |
| `primary-dark` | `#2B2670` | Índigo oscuro: cabecera del panel del coordinador, estados presionados |
| `primary-soft` | `#EAE8F7` | Fondos suaves de resaltado |
| `accent` | `#E0A03A` | Ámbar suave: acentos, destacados, humaniza la UI |
| `bg` | `#FAFAFD` | Fondo de página |
| `surface` | `#FFFFFF` | Tarjetas y superficies elevadas |
| `border` | `#E2E1EC` | Bordes y divisores |
| `text` | `#1C1B2E` | Texto principal |
| `text-muted` | `#6E6C82` | Texto auxiliar |
| `success` | `#1E7F4D` | Operaciones exitosas, estado «Realizada» |
| `warning` | `#B7791F` | Advertencias, estado «Programada» |
| `danger` | `#B4322B` | Acciones destructivas, «No asistió» |
| `info` | `#3B6FA8` | Información neutra |

### 6.2 Tipografía — Source Sans 3

| Estilo | Tamaño/Interlineado | Peso | Uso |
|---|---|---|---|
| Título de pantalla | 28/32 px | 700 | H1 de cada vista |
| Título de sección | 20/28 px | 700 | H2 |
| Subtítulo | 16/24 px | 600 | H3, énfasis |
| Cuerpo | 15/22 px | 400 | Texto normal |
| Auxiliar | 13/18 px | 400 | Ayudas, metadatos |
| Etiqueta | 12/16 px | 600 | Labels de formularios, badges |

### 6.3 Forma, profundidad y reglas

- **Radio base:** 8 px · **chips/píldoras:** 999 px.
- **Espaciado:** múltiplos de 4 px.
- **Lienzo:** 1920 × 1080 px; contenido a ancho completo con **margen lateral de 56 px**.
- **Cabecera autenticada:** 76 px de alto a 1920 px.
- **Sombra de tarjeta:** `0 1px 4px rgba(28,27,46,.08)`.
- **Estados:** siempre combinan **color + texto** (nunca solo color).
- **Alcance visual de la Entrega 1:** solo escritorio (no se requieren vistas móviles).

### 6.4 Tokens CSS (definir en `src/index.css` como variables)

```css
:root {
  --primary: #3B3596;
  --primary-dark: #2B2670;
  --primary-soft: #EAE8F7;
  --accent: #E0A03A;
  --bg: #FAFAFD;
  --surface: #FFFFFF;
  --border: #E2E1EC;
  --text: #1C1B2E;
  --text-muted: #6E6C82;
  --success: #1E7F4D;
  --warning: #B7791F;
  --danger: #B4322B;
  --info: #3B6FA8;
  --radius: 8px;
  --radius-chip: 999px;
  --shadow-card: 0 1px 4px rgba(28, 27, 46, .08);
}
```

---

## 7. Componentes compartidos (módulo común del grupo)

Se implementan **una sola vez** en un módulo compartido; nadie duplica componentes. Los que ya existen en `src/components/` son el punto de partida.

| Componente | Responsable | Notas |
|---|---|---|
| `Header` | Grupo | Cabecera autenticada: marca, nav con sección activa subrayada, conmutador Estudiante/Tutor, menú de cuenta. Variante oscura para coordinador. |
| `Footer` | Grupo | Pie común; en panel del coordinador: «Panel del coordinador · Programa de Tutorías entre Pares». |
| `TarjetaTutor` | Grupo | Foto circular, nombre, carrera, cursos, promedio, modalidad. |
| `TutoresDestacados` | Grupo | Sección de la landing con las tarjetas destacadas. |
| `GrillaDisponibilidad` | Grupo | Grilla semanal Lun–Sáb × bloques horarios (08:00…20:00), estados Libre / Ocupado / No disponible. |
| `BadgeEstadoSesion` | Grupo | Programada · Realizada · No asistió · Cancelada · Horario propuesto (color + texto). |
| `FiltrosActivos` | Grupo | Chips removibles individuales + «Limpiar todo». |
| `Paginacion` | Grupo | ‹ 1 2 3 › con totales («Mostrando 1 a 8 de 24»). |
| `ModalConfirmacion` | Grupo | Toda acción destructiva pide confirmación. |
| `EstadoVacio` | Grupo | Ilustración + mensaje + CTA («Aún no tienes sesiones… Ir al directorio»). |
| `CampoFormulario` | Grupo | Label + input + error en línea junto al campo. |
| `Notificacion` | Grupo | Toasts/avisos de resultado de toda operación de escritura. |
| `EsqueletoCarga` | Grupo | Skeletons para estados de carga (p. ej. «Cargando tutores…»). |

### Reglas de UI no funcionales
- Interfaz **responsiva, en español y visualmente consistente**.
- Los formularios **validan y señalan el error junto al campo** (validación en línea).
- Toda operación de escritura **notifica su resultado**; toda acción destructiva **pide confirmación**; toda vista sin datos **contempla su estado vacío**.

---

## 8. Estructura de carpetas (jerarquía del repositorio)

> Partimos de la estructura Vite actual (ver `docs/` y captura del explorador). La jerarquía objetivo completa es la siguiente:

```
proyecto/
├── docs/
│   └── planificacion.md          ← este archivo (fuente única de verdad)
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/                   # imágenes, hero, logos
│   ├── components/               # COMPONENTES COMPARTIDOS (sección 7)
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── Presentacion.jsx
│   │   ├── TarjetaTutor.jsx
│   │   ├── TutoresDestacados.jsx
│   │   ├── GrillaDisponibilidad.jsx
│   │   ├── BadgeEstadoSesion.jsx
│   │   ├── FiltrosActivos.jsx
│   │   ├── Paginacion.jsx
│   │   ├── ModalConfirmacion.jsx
│   │   ├── EstadoVacio.jsx
│   │   ├── CampoFormulario.jsx
│   │   ├── Notificacion.jsx
│   │   └── EsqueletoCarga.jsx
│   ├── pages/                    # vistas (mapeo en sección 9)
│   │   ├── Home.jsx              # 1.1 landing pública
│   │   ├── Login.jsx             # 1.2
│   │   ├── Registro.jsx          # 1.3
│   │   ├── RecuperarPassword.jsx # 1.4
│   │   ├── MiCuenta.jsx          # 1.5
│   │   ├── AccesoDenegado.jsx    # 1.6 (403)
│   │   ├── NoEncontrada.jsx      # 1.6 (404)
│   │   ├── PerfilTutor.jsx       # 2.1 activar/desactivar + estado de ficha
│   │   ├── MisCursos.jsx         # 2.2
│   │   ├── Disponibilidad.jsx    # 2.3
│   │   ├── Excepciones.jsx       # 2.4
│   │   ├── FichaPublicaTutor.jsx # 2.5 / 3.x / 6.2 (lectura pública)
│   │   ├── Directorio.jsx        # 3.1
│   │   ├── DetalleTutor.jsx      # 3.2 / 3.3 (selección de bloque)
│   │   ├── MisSesiones.jsx       # 4.2 (estudiante) / 5.3 historial (tutor)
│   │   ├── Solicitudes.jsx       # 4.3 (tutor)
│   │   ├── DetalleSesion.jsx     # 4.5
│   │   ├── CerrarSesion.jsx      # 5.1
│   │   ├── MaterialCompartido.jsx# 5.2
│   │   ├── ResumenHoras.jsx      # 5.4
│   │   ├── Calificar.jsx         # 6.1 (modal)
│   │   ├── MisCalificaciones.jsx # 6.3
│   │   ├── Ranking.jsx           # 6.4
│   │   ├── PanelTutores.jsx      # 7.1
│   │   ├── PanelUsuarios.jsx     # 7.3
│   │   └── PanelTablero.jsx      # 7.4
│   ├── context/                  # AuthContext, SesionContext, NotificacionContext
│   ├── hooks/                    # useAuth, useTutores, useSesiones, ...
│   ├── data/                     # datos semilla JSON (Entrega 1)
│   ├── services/                 # Entrega 2: cliente HTTP a la API
│   ├── routes/                   # definición de rutas + guards por rol
│   ├── utils/                    # helpers: fechas, formatos, validaciones compartidas
│   ├── styles/                   # tokens, estilos por vista
│   ├── App.jsx
│   └── main.jsx
├── server/                       # ENTREGA 2 (backend Express)
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middlewares/          # auth, validación, errores
│   │   └── config/
│   └── .env.example              # sin credenciales reales
├── .gitignore
├── package.json
├── README.md
└── vite.config.js
```

### Estrategia de ramas
- `main` ← protegida; solo recibe PRs aprobados.
- Todo merge mediante **pull request revisado por otro miembro**. El historial de commits es evidencia de participación individual.

---

## 9. Mapa de navegación y vistas

```
Público      Landing → Directorio → Ficha → [login al solicitar]
Estudiante   Directorio → Ficha → Solicitar → Mis sesiones → Detalle
             Sesión realizada → Calificar → Mis calificaciones
Tutor        Activarme → Cursos · Disponibilidad · Excepciones
             Solicitudes → Aceptar | Rechazar | Proponer horario
             Mis sesiones → Cerrar (asistencia y notas)
Coordinador  Tutores → Detalle → Suspender · Usuarios · Tablero
```

| # | Vista | Rol | Mockup |
|---|---|---|---|
| 1.1 | Landing pública | Visitante | Hero + buscador + tutores destacados + pasos |
| 1.2 | Inicio de sesión | Visitante | Error de credenciales con intentos restantes; botón en carga |
| 1.3 | Registro | Visitante | Validación en línea (@aloe.ulima.edu.pe, contraseñas); modal «Cuenta creada» |
| 1.4 | Recuperar contraseña | Visitante | 3 pasos: correo → confirmación con reenvío → nueva contraseña con indicador «Segura» |
| 1.5 | Mi cuenta | Estudiante | Datos personales + cambiar contraseña |
| 1.6 | 403 / 404 | Cualquiera | Con CTA de retorno |
| 2.1 | Mi perfil de tutor | Tutor | Estado activo/inactivo, requisitos de ficha completa, métricas |
| 2.2 | Mis cursos | Tutor | CRUD + estado vacío |
| 2.3 | Disponibilidad semanal | Tutor | Grilla con arrastre, cambios sin guardar, horas por día |
| 2.4 | Excepciones por fecha | Tutor | Calendario + rango horario + motivo; aviso de cancelaciones automáticas |
| 2.5 | Ficha pública | Visitante | Lectura pública |
| 3.1 | Directorio | Estudiante | Filtros (curso, carrera, modalidad, día), orden, filtros activos, paginación, esqueletos, sin resultados |
| 3.2 | Detalle del tutor con selección de bloque | Estudiante | Grilla con bloque elegido y CTA «Continuar con la solicitud» |
| 3.3 | Tutor sin bloques libres | Estudiante | Aviso + navegación entre semanas |
| 4.1 | Modal de solicitud | Estudiante | Con mensaje de solapamiento y validación |
| 4.2 | Mis sesiones | Estudiante | Pestañas próximas/historial, filtros, calificar |
| 4.3 | Solicitudes recibidas | Tutor | Contadores pendientes/aceptadas/rechazadas |
| 4.4 | Modal proponer horario | Tutor | Alternativa al bloque solicitado |
| 4.5 | Detalle de sesión | Tutor/Estudiante | Código, trazabilidad, enlaces, ventanas de cancelación/cierre |
| 5.1 | Cierre de sesión | Tutor | Asistencia, duración, notas, temas pendientes; cierre como «No asistió» |
| 5.2 | Material compartido | Tutor | Solo enlaces con título; estudiante en lectura |
| 5.3 | Historial de sesiones | Tutor | Tabla con filtros por curso y periodo |
| 5.4 | Resumen de horas | Tutor | Horas por curso + barras por mes |
| 6.1 | Modal calificar | Estudiante | Puntaje, aspectos, comentario |
| 6.2 | Reseñas en ficha | Pública | Promedio, distribución, aspectos, comentarios filtrables |
| 6.3 | Mis calificaciones | Estudiante | Edición/eliminación dentro de plazo |
| 6.4 | Ranking por curso | Estudiante | Solo tutores con ≥5 calificaciones |
| 7.1–7.4 | Panel del coordinador | Coordinador | Cabecera oscura; tutores, suspensión con modal motivo, usuarios, tablero con métricas y gráficos |

---

## 10. Contrato de datos y datos semilla (clave anti-bloqueo)

### 10.1 Principio
Cada integrante es **dueño de sus entidades**; **nadie escribe sobre las entidades de otro**. Cuando una historia necesita **leer** datos de otra, se hace mediante el contrato.

1. **Contrato de datos** (documento acordado por el grupo): define la estructura de cada entidad compartida — **perfil de tutor, bloque de disponibilidad, sesión, usuario** — con campos, tipos y valores admitidos. Es la interfaz entre historias; **cambiarlo requiere acuerdo del grupo**.
2. **Datos semilla**: un archivo JSON derivado del contrato que cubra **todos los escenarios, incluidos los casos límite**. En la Entrega 1 cada quien desarrolla contra ese archivo (`src/data/`); en la Entrega 2 el mismo conjunto se carga en la base de datos. Así nadie espera el avance de otro.

### 10.2 Entidades base (propuesta inicial — validar y congelar con el grupo)

**Usuario**
```jsonc
{
  "id": "u-001",
  "nombres": "Camila Andrea",
  "apellidos": "Quispe Andrade",
  "correo": "camila.quispe@aloe.ulima.edu.pe",   // debe terminar en @aloe.ulima.edu.pe
  "passwordHash": "",                            // nunca texto plano
  "rol": ["estudiante", "tutor"],                // coordinador se registra por invitación
  "carrera": "Ingeniería Industrial",
  "ciclo": 8,
  "fotoUrl": "",
  "celular": "987654321",
  "estado": "activo"                             // activo | bloqueado | suspendido
}
```

**PerfilTutor** (1:1 con usuario cuando activa el rol)
```jsonc
{
  "tutorId": "u-001",
  "activo": true,
  "biografia": "",
  "modalidad": "ambas",                          // presencial | remota | ambas
  "sedePreferencia": "",
  "cursos": [
    { "codigo": "MA101", "nombre": "Cálculo I", "nivel": "avanzado", "experiencia": "..." }
  ],
  "promedio": 4.8,
  "totalResenas": 31,
  "publicadoDesde": "2026-08-03"
}
```

**BloqueDisponibilidad**
```jsonc
{
  "tutorId": "u-001",
  "tipo": "recurrente",                          // recurrente | excepcion
  "dia": "lunes",                                // lunes..sabado
  "horaInicio": "16:00",
  "horaFin": "17:00",
  "fecha": null,                                 // solo excepciones
  "estado": "libre"                              // libre | ocupado | no-disponible
}
```

**Sesion**
```jsonc
{
  "codigo": "TU-2026-0184",
  "tutorId": "u-001",
  "estudianteId": "u-002",
  "curso": { "codigo": "MA101", "nombre": "Cálculo I" },
  "tema": "Ejercicios de integrales por partes",
  "fecha": "2026-09-14",
  "horaInicio": "16:00",
  "horaFin": "17:00",
  "modalidad": "remota",
  "enlaceSesion": "meet.ulima.edu.pe/tu-0184",
  "estado": "programada",                        // programada | realizada | no-asistio | cancelada
  "motivoRechazo": null,
  "horarioAlternativo": null,
  "trazabilidad": [
    { "fecha": "2026-09-10T19:42:00", "evento": "Solicitud enviada", "actor": "Joaquín Medina" }
  ]
}
```

**CierreSesion / Valoracion** (HU-5/HU-6)
```jsonc
{
  "sesionCodigo": "TU-2026-0184",
  "asistenciaEstudiante": true,
  "asistenciaTutor": true,
  "duracionRealMin": 60,
  "notas": "...", "temasPendientes": "...",
  "material": [ { "titulo": "...", "url": "https://..." } ]
}
```
```jsonc
{
  "sesionCodigo": "TU-2026-0184",
  "autorId": "u-002",
  "puntaje": 5,                                  // 1..5
  "aspectos": { "claridad": 5, "puntualidad": 4, "dominio": 5 },
  "comentario": "...",
  "editableHasta": "2026-09-21"                  // 7 días tras el cierre
}
```

---

## 11. Plan de trabajo por entregas

### Fase 0 — Preparación (semanas 1–4)
- [x] Formación de grupo y asignación de historias (comunicar al docente, semana 4).
- [x] Crear repositorio, ramas y proteger `main`.
- [x] Redactar y **congelar el contrato de datos** (sección 10).
- [x] Elaborar el **JSON de datos semilla** con todos los escenarios y casos límite.
- [x] Configurar tokens CSS del sistema de diseño (sección 6.4).

### Entrega 1 — Solo interfaz (semana 9)
- [x] Toda la navegación con React Router (rutas públicas; guards simulados con Context).
- [x] Componentes compartidos del módulo común.
- [x] Vistas de la sección 9 según la HU asignada, fieles a los mockups.
- [x] Datos 100% desde el JSON semilla en el front.
- [x] Validaciones de formularios en cliente, estados vacíos, carga, errores y confirmaciones.
- [x] CSS propio consistente con los tokens; interfaz en español.

### Entrega 2 — Sistema completo (semana 15)
- [ ] Backend Express REST por capas (controllers → services → repositories).
- [ ] Base de datos con ORM; carga de los mismos datos semilla.
- [ ] Autenticación real, contraseñas cifradas (bcrypt), protección de rutas por rol.
- [ ] Validaciones repetidas en servidor y códigos HTTP correctos.
- [ ] Variables de entorno sin credenciales en el repo.
- [ ] Despliegue en capa gratuita (front + back + DB).
- [ ] **Conservar intacto** lo construido en la Entrega 1.

---

## 12. Checklist de calidad (aplica a todo PR)

- [ ] Interfaz en español, responsiva y consistente con los mockups y tokens.
- [ ] Errores junto al campo, confirmaciones en destructivas, estados vacíos y de carga.
- [ ] Estados con color **y** texto.
- [ ] Sin credenciales ni secretos en el repo (`.env` ignorado).
- [ ] Sin lógica de datos en componentes ni controladores (capas respetadas).
- [ ] Commits claros; PR revisado por otro integrante.
- [ ] Historia completa de principio a fin (interfaz + servicios + datos + pruebas).
- [ ] Compromiso compartido: la integración y el funcionamiento del sistema completo es responsabilidad de todos, aunque cada quien lidere su historia.

---

*Última actualización: 2026-10-16 — mantener sincronizado con el docx (requerimientos) y el PDF de mockups (diseño).*
