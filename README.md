# Tutorías entre Pares

Proyecto de una plataforma web colaborativa orientada a conectar estudiantes para sesiones de refuerzo académico.

---

## Migración de archivos a ReactJS + Vite
Los archivos de la página principal + login fueron trasladados y funcionan correctamente.
- index.html -> Home.jsx
- login.html -> Login.jsx

El código utilizado para migrar fue:
```bash
npm create vite@latest . -- --template react
```
- Se adaptaron los HTML a archivos .jsx
- estilos.css sigue siendo el mismo