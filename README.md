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

## Para correr el programa y probrar funcionalidades
1. abrir la carpeta del proyecto en el cmd.
2. ejecutar npm install y seguidamente npm run dev
3. Presionar "Iniciar sesión" y elegir una de las cuentas de prueba.
