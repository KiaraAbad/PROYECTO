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

## Para correr el proyecto

### Frontend
1. `cd frontend && npm install && npm run dev`
2. Presionar "Iniciar sesión" y elegir una cuenta de prueba.

### Backend (Entrega 2)
1. En **pgAdmin**, crear la BD vacía `tutorias_ulima` (`localhost:5432`).
2. Copiar `backend/.env.example` a `backend/.env` y ajustar tus credenciales de PostgreSQL.
3. Ejecutar `cd backend && npm install && npm run dev` y probar `GET http://localhost:3001/api/health`.

> **Nota:** Si sale `database "tutorias_ulima" does not exist`, la configuración está bien y solo falta crear la BD en pgAdmin.
> **Arquitectura:** `routes -> controllers -> services -> repositories -> models` (usando `RepositoryBase.js`; ver `docs/creacionbackend.md`).
