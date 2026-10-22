# Planificación Técnica: HU-2 — Ficha y disponibilidad del tutor

**Responsable:** Aaron Castro  
**Estado:** Implementado y validado mediante pruebas manuales y compilación del proyecto.  
**Dependencias clave:** `src/data/tutores.json` (datos semilla), `src/context/TutoresContext.jsx` (estado compartido y persistencia local), `src/hooks/useTutores.js` (acceso a los datos de tutores), `src/pages/MiPerfilTutor.jsx`, `src/pages/MisCursosTutor.jsx`, `src/pages/DisponibilidadTutor.jsx` y `src/pages/DetalleTutor.jsx` (ficha pública del tutor, compartida con HU-3).

---

## 1. Alcance y objetivos de la HU-2

Esta historia funcional permite al **Tutor** gestionar su perfil público, los cursos que enseña y sus horarios de atención. El **Estudiante** puede consultar la ficha pública del tutor y visualizar los bloques disponibles para solicitar una tutoría.

### Requerimientos principales implementados

- [x] **Activación y desactivación del perfil del tutor:** permite cambiar el estado del perfil para indicar si continúa ofreciendo tutorías. Se comprobó que un tutor desactivado deja de aparecer en el directorio.
- [x] **Gestión de cursos:** registro, edición y eliminación de los cursos que enseña el tutor.
- [x] **Nivel y experiencia por curso:** cada curso puede incluir un nivel declarado y una breve descripción de la experiencia del tutor.
- [x] **Información de la ficha:** edición de la biografía, modalidad de atención (presencial, remota o ambas) y sede de preferencia.
- [x] **Disponibilidad semanal recurrente:** registro y visualización de bloques horarios por día de la semana.
- [x] **Excepciones puntuales:** registro de excepciones por fecha y horario para bloquear temporalmente la disponibilidad recurrente.
- [x] **Listado y eliminación de excepciones:** consulta de las excepciones registradas y eliminación de las que ya no correspondan.
- [x] **Ficha pública del tutor:** visualización de la biografía, modalidad, sede, cursos, nivel, experiencia y disponibilidad semanal.
- [x] **Persistencia para la demostración:** los cambios se conservan en el almacenamiento local del navegador mediante `localStorage`.
- [x] **Validación técnica:** ejecución de `npm run build` sin errores.

---

## 2. Inventario de componentes y archivos React

El desarrollo de la HU-2 se integra con la estructura existente del proyecto y reutiliza la información de tutores.

### A. Vistas (Pages)

1. `src/pages/MiPerfilTutor.jsx`: permite consultar y modificar la información del perfil, así como activar o desactivar al tutor.
2. `src/pages/MisCursosTutor.jsx`: permite registrar, editar y eliminar cursos, incluyendo su nivel declarado y descripción de experiencia.
3. `src/pages/DisponibilidadTutor.jsx`: permite gestionar los bloques de disponibilidad semanal y las excepciones por fecha.
4. `src/pages/DetalleTutor.jsx`: muestra la ficha pública del tutor. Para la integración con HU-2, presenta la biografía, modalidad, sede, cursos y agenda semanal.

### B. Gestión de estado y datos

- `src/context/TutoresContext.jsx`: centraliza el estado compartido de los tutores, permite actualizar sus datos y guarda los cambios en el almacenamiento local.
- `src/hooks/useTutores.js`: proporciona acceso a los datos de tutores utilizados por las vistas del proyecto.
- `src/data/tutores.json`: contiene los datos semilla iniciales de los tutores.
- `src/main.jsx`: incorpora `TutoresProvider` para compartir el contexto con la aplicación.

### C. Estilos

- `src/styles/mi-perfil-tutor.css`: estilos de la gestión del perfil del tutor.
- `src/styles/disponibilidad-tutor.css`: estilos de la gestión de disponibilidad y excepciones.
- `src/styles/detalle-tutor.css`: estilos de la ficha pública y su agenda semanal.
- `src/styles/mis-cursos-tutor.css`: estilos de la gestión de cursos.

---

## 3. Plan de acción y cumplimiento

### Fase 1. Integración del estado de tutores

**Implementado:** se incorporó `TutoresContext` para centralizar las actualizaciones del estado de los tutores y conservar los cambios mediante `localStorage`.

El contexto permite que las distintas vistas trabajen sobre el estado compartido durante la demostración, evitando modificar directamente el archivo JSON original.

### Fase 2. Gestión del perfil público

**Implementado:** se desarrolló la pantalla de gestión del perfil del tutor, con edición de biografía, modalidad y sede de preferencia.

También se incorporó el control de activación y desactivación del perfil. Se comprobó que la desactivación impide que el tutor aparezca en el directorio.

### Fase 3. Gestión de cursos

**Implementado y probado:** se incorporaron las operaciones de registro, edición y eliminación de cursos.

Cada curso puede incluir su código, nombre, nivel declarado y descripción de experiencia. Se realizaron pruebas manuales de las operaciones principales.

### Fase 4. Disponibilidad semanal y excepciones

**Implementado y probado:** se incorporó la gestión de horarios recurrentes por día y bloque horario, junto con excepciones puntuales por fecha.

Se verificó que una excepción bloquee el intervalo correspondiente en la ficha pública y que la eliminación de la excepción permita recuperar la disponibilidad cuando no existe otra restricción.

### Fase 5. Integración con la ficha pública (HU-3)

**Implementado y probado:** se amplió `DetalleTutor.jsx` para presentar los datos del perfil y los cursos registrados, manteniendo la agenda semanal y la navegación entre semanas.

La integración permite visualizar los datos actualizados del tutor y consultar los bloques disponibles. Esta modificación se realiza sobre una vista compartida con HU-3, por lo que debe mantenerse coordinada con su responsable.

### Fase 6. Validación

**Validado mediante pruebas manuales y compilación:**

- Activación y desactivación del perfil.
- Registro, edición y eliminación de cursos.
- Actualización de biografía, modalidad y sede.
- Visualización de cursos y datos del perfil en la ficha pública.
- Registro, persistencia y eliminación de excepciones.
- Bloqueo de horarios afectados por excepciones.
- Compilación del proyecto mediante `npm run build`.

---

## 4. Consideraciones técnicas y limitaciones

- **Persistencia local:** la versión actual guarda los cambios en `localStorage`. Los datos no se sincronizan automáticamente entre diferentes navegadores, dispositivos o usuarios.
- **Datos semilla:** `tutores.json` sirve como fuente inicial. Los cambios de la demostración se guardan en el estado compartido y el almacenamiento local, no directamente en el archivo JSON.
- **Integración entre historias:** `DetalleTutor.jsx` forma parte del directorio y la experiencia de consulta de HU-3. Los cambios de HU-2 deben coordinarse con el responsable de esa historia para evitar sobrescribir sus modificaciones.
- **Validación funcional:** las pruebas manuales confirman los flujos principales observados en la demostración. No sustituyen pruebas automatizadas ni una validación de persistencia en un backend real.

---

## 5. Resultado de la HU-2

La HU-2 cuenta con las funcionalidades principales de gestión del perfil, cursos, disponibilidad y excepciones implementadas e integradas con la ficha pública del tutor.

La validación manual y la compilación del proyecto finalizaron correctamente. La persistencia utilizada corresponde al almacenamiento local del navegador, por lo que una futura integración con backend deberá contemplar la sincronización y gestión centralizada de los datos.
