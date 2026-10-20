# 📋 Planificación Técnica: HU-3 — Directorio de Tutores

**Responsable:** Santiago
**Estado:** Implementado (Alineado con Mockups Oficiales)
**Dependencias clave:** `tutores.json` (Datos Semilla con 24 tutores activos), Componentes Comunes (`TarjetaTutor`, `FiltrosSidebar`, `FiltrosActivos`, `Paginacion`, `EstadoVacio`, `EsqueletoCarga`).

---

## 1. Alcance y Objetivos de la HU-3

Esta historia funcional permite al **Estudiante** (y al **Visitante** en modo solo lectura) buscar y visualizar la oferta de tutores disponibles.

**Requerimientos principales programados:**
- [x] Listado de tutores activos (consumiendo `tutores.json` en la Entrega 1 con 24 perfiles activos).
- [x] Paginación de resultados y contador de coincidencias totales («Mostrando 1 a 8 de 24 tutores»).
- [x] Buscador y filtros combinados: Curso, Carrera, Modalidad (presencial/remota/ambas) y Día de atención (Lun a Sáb).
- [x] Ordenamiento: Por mejor promedio, nombre, número de cursos o disponibilidad más próxima.
- [x] Interfaz de "Filtros Activos" (chips redondeados en lavanda `#EAE8F7` removibles con cruz individual o enlace «Limpiar todo»).
- [x] **Estado sin resultados ilustrado:** Icono con signo `?`, mensaje explicativo y acciones «Quitar filtros» y «Ver todos».
- [x] **Estado cargando:** Cuadrícula de 4 esqueletos de tarjeta con animación de pulso y texto central «Cargando tutores...».
- [x] Vista de **Detalle del Tutor** (`/tutores/:id`):
  - Ficha de perfil con nombre, carrera, ciclo, badges de cursos y promedio con botón «Ver reseñas».
  - Grilla de disponibilidad semanal interactiva con navegación entre semanas.
  - **Estado de tutor sin bloques libres:** Manejo de semanas con excepción puntual («No hay bloques libres esta semana»), con botón para saltar a la semana siguiente y botón para buscar otros tutores del mismo curso.

---

## 2. Inventario de Componentes React

El desarrollo está modularizado en las siguientes piezas:

### A. Vistas (Pages)
1. `src/pages/Directorio.jsx`: Contenedor principal con filtros sidebar, chips activos, grilla de resultados (4 columnas en escritorio) y paginación.
2. `src/pages/DetalleTutor.jsx`: Vista detallada con ficha del tutor, navegación semanal, grilla de horarios y estado de excepción puntual.

### B. Componentes Compartidos
- `TarjetaTutor.jsx`: Componente reutilizable tanto para la landing page (sin botón, avatar con texto «foto» y «sesiones») como para el directorio (con botón «Ver ficha», badges y «ses.»).
- `FiltrosSidebar.jsx`: Tarjeta lateral con selectores de curso y carrera, checkboxes estilizados de modalidad y píldoras redondeadas para días.
- `FiltrosActivos.jsx`: Píldoras lavanda para filtros aplicados con eliminación individual y botón «Limpiar todo».
- `Paginacion.jsx`: Barra inferior con resumen de resultados a la izquierda y botones numéricos cuadrados con página activa sólida a la derecha.
- `EstadoVacio.jsx`: Estado visual cuando no hay coincidencias con icono de interrogación y botones «Quitar filtros» y «Ver todos».
- `EsqueletoCarga.jsx`: Esqueletos de tarjeta con silueta de avatar y barras de contenido mientras se cargan los tutores.
- `Header.jsx`: Soporta tanto la variante pública de visitante (para la landing page, con enlaces e «Iniciar sesión» / «Crear cuenta») como la variante autenticada (con conmutador Estudiante/Tutor y avatar JM).
- `Footer.jsx`: Pie de página oscuro (`#19182A`) alineado con el sistema de diseño.

---

## 3. Plan de Acción y Cumplimiento

### Fase 1: Contrato de Datos (Mock Data)
- **Implementado:** `src/data/tutores.json` contiene los 24 tutores activos alineados a los mockups, incluyendo los tutores destacados: Camila Quispe, Rodrigo Salazar, Ariana Flores, Sebastián Rojas, Valeria Ccahuana, Diego Huamán, Lucía Paredes, Mateo Chávez, Fabiana Loayza, etc.

### Fase 2: Maquetado del Layout Estático y Vistas Alternativas
- **Implementado:** 
  - Layout del Directorio con grilla responsive a 4 columnas.
  - Detalle del tutor con selector de bloque y confirmación interactiva.
  - Vistas alternativas documentadas en los mockups: estado sin resultados, estado cargando con esqueletos y estado sin bloques disponibles en la semana consultada.

### Fase 3: Lógica de Estados y Filtrado (React Hooks)
- **Implementado:** `useState`, `useMemo` para no recalcular innecesariamente los tutores filtrados y reseteo de paginación en cambios de criterios.

