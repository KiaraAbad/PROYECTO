# Prompt: Maquetación y Arquitectura Base del Backend (Entrega 2)

Actúa como un **Arquitecto de Software Senior especializado en Node.js, Express y Sequelize con PostgreSQL**.

Tu tarea es construir **únicamente la estructura base (esqueleto vacío y funcional)** del backend para nuestro proyecto **"Tutorías entre Pares" (Universidad de Lima — 2026-2)**, respetando estrictamente:
1. La arquitectura de carpetas, patrones de diseño y convenciones vistas en clase (`app.js`, `index.js`, `RepositoryBase.js`, `relaciones.js`).
2. Las reglas obligatorias y requerimientos no funcionales definidos en `Proyecto_PW_2026-2_Tema4_Tutorias_entre_Pares.docx` y `docs/planificacion.md`.

> ⚠️ **RESTRICCIÓN CRÍTICA DE ALCANCE:** En este paso **NO** debes crear todavía los modelos, controladores, servicios ni rutas específicas de las entidades del negocio (Usuarios, Tutores, Sesiones, Valoraciones, etc.). Solo debes maquetar la estructura de carpetas, los archivos base de configuración, los middlewares globales de manejo de errores HTTP, la clase padre de repositorios y el servidor Express conectado a PostgreSQL (pgAdmin) listo para recibir entidades por historia funcional (HU-1 a HU-6).

---

## 1. Reglas Oficiales del Proyecto (Obligatorias)

El código generado debe cumplir sin excepción con los siguientes lineamientos de la asignatura:

1. **Arquitectura estricta por capas:**
   `routes -> controllers -> services -> repositories -> models`
   - **Prohibido el acceso directo a datos (Sequelize/modelos) dentro de los controladores o rutas.** Todo acceso a la base de datos debe pasar obligatoriamente por los repositorios que hereden de `RepositoryBase`.
   - Toda lógica de negocio y validación de reglas se centraliza en la capa `services/`.
2. **Validación y Seguridad en Servidor:**
   - El servidor no confía en las validaciones del cliente; las validaciones se repetirán en el backend.
   - Las contraseñas se almacenarán cifradas utilizando `bcrypt` (nunca en texto plano).
   - Se debe incluir soporte base para autenticación y control de acceso por rol (Visitante, Estudiante, Tutor, Coordinador).
3. **Estándar REST y Códigos HTTP:**
   - Todos los endpoints siguen estilo REST bajo el prefijo `/api/...`.
   - Los servicios y el manejador global de errores deben responder con los códigos HTTP semánticos correspondientes (`200` OK, `201` Created, `400` Bad Request, `401` Unauthorized, `403` Forbidden, `404` Not Found, `409` Conflict, `422` Unprocessable Entity, `500` Internal Server Error).
4. **Cero Credenciales en el Repositorio:**
   - Uso estricto de variables de entorno (`.env` ignorado por Git y `.env.example` versionado como plantilla).
5. **Propiedad por Historia Funcional (HU) y Datos Semilla:**
   - La estructura debe permitir que cada integrante desarrolle sus propias entidades, repositorios, servicios, controladores y rutas de forma modular sin bloquear a otros.
   - Se debe dejar lista la carpeta `src/data/` para migrar hacia PostgreSQL el mismo conjunto de datos semilla JSON utilizado en el frontend (`frontend/src/data/`).
6. **Stack Puro (Sin frameworks opinados):**
   - Exclusivamente Node.js + Express + Sequelize + PostgreSQL. Prohibido usar NestJS, Firebase o generadores comerciales.

---

## 2. Ubicación y Stack Tecnológico

1. Crea o estructura la carpeta `backend/` en la raíz del proyecto (al mismo nivel que `frontend/` y `docs/`).
2. Configura `backend/package.json` usando **ES Modules** (`"type": "module"`) e incluye las dependencias necesarias:
   - `express`
   - `sequelize`
   - `pg`
   - `pg-hstore`
   - `cors`
   - `dotenv`
   - `bcrypt`
   - `jsonwebtoken`
   - Scripts: `"dev": "node --watch index.js"` y `"start": "node index.js"`.

---

## 3. Estructura de Carpetas Obligatoria

Genera exactamente esta jerarquía dentro de `backend/`:

```text
backend/
├── .env                    # Variables locales (ignorado por Git)
├── .env.example            # Plantilla de variables sin credenciales reales
├── app.js                  # Configuración de Express, CORS, JSON, rutas y errorHandler
├── index.js                # Punto de entrada: conexión BD, sync Sequelize y app.listen
├── package.json
└── src/
    ├── config/
    │   └── database.js     # Instancia de Sequelize conectada a PostgreSQL
    ├── controllers/        # (Vacío / .gitkeep) Reciben req/res, delegan a services y devuelven códigos HTTP
    ├── data/               # (Vacío / .gitkeep) Futuros scripts de migración de JSON semilla a PostgreSQL
    ├── middlewares/
    │   └── errorHandler.js # Middleware global para capturar errores y responder con códigos HTTP estándar
    ├── models/
    │   └── relaciones.js   # Archivo centralizador de modelos y asociaciones Sequelize
    ├── repositories/
    │   └── RepositoryBase.js # Clase genérica con operaciones CRUD base de Sequelize
    ├── routes/             # (Vacío / .gitkeep) Definición de endpoints Express Router
    ├── services/           # (Vacío / .gitkeep) Lógica de negocio, reglas y validaciones de servidor
    └── tests/
        └── pruebas.http    # Archivo base para probar endpoints con REST Client
```

---

## 4. Especificación de los Archivos Base a Generar

### A. Variables de Entorno (`.env` y `.env.example`)
Define las siguientes claves (usa valores de ejemplo genéricos sin credenciales reales en `.env.example` y valores locales por defecto en `.env`):

```env
PORT=3001
DB_NAME=tutorias_ulima
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=clave_secreta_desarrollo_cambiar_en_produccion
```

### B. `src/config/database.js`
Configura y exporta la instancia `sequelize` leyendo las variables de entorno:
- Dialecto: `'postgres'`.
- Host, puerto, base de datos, usuario y contraseña tomados desde `process.env`.
- Configura `logging: false` para mantener limpia la consola.
- Exporta `sequelize` de forma consistente (`export const sequelize` y `export default sequelize`).

### C. `src/repositories/RepositoryBase.js`
Implementa la clase `RepositoryBase` siguiendo el patrón de repositorio genérico visto en clase para evitar acceso directo a datos en controladores:
- Su `constructor(modelo)` recibe un modelo de Sequelize y lo asigna a `this.modelo`.
- Implementa los métodos asíncronos estándar:
  - `findAll(opciones = {})` -> `return await this.modelo.findAll(opciones);`
  - `findOne(id, opciones = {})` -> `return await this.modelo.findByPk(id, opciones);`
  - `findOneWhere(condicion, opciones = {})` -> `return await this.modelo.findOne({ where: condicion, ...opciones });`
  - `create(data)` -> `return await this.modelo.create(data);`
  - `update(id, data)` -> Busca por PK (`findByPk`); si no existe retorna `null`, si existe ejecuta `await registro.update(data)` y retorna el registro actualizado.
  - `delete(id)` -> Busca por PK (`findByPk`); si no existe retorna `false`, si existe ejecuta `await registro.destroy()` y retorna `true`.

### D. `src/middlewares/errorHandler.js`
Crea un middleware centralizado de manejo de errores de Express `(err, req, res, next)` para garantizar respuestas HTTP consistentes en toda la API:
- Lee `err.statusCode || 500` y `err.message || 'Error interno del servidor'`.
- Responde con formato JSON uniforme: `{ error: mensaje, detalles: err.detalles || null }`.

### E. `src/models/relaciones.js`
Crea el archivo preparado para importar futuros modelos de cada HU y definir sus asociaciones (`hasMany`, `belongsTo`, `hasOne`). Por ahora debe importar `sequelize` desde `../config/database.js` y exportar un objeto vacío para que `index.js` pueda importarlo sin errores.

### F. `app.js`
Configura la instancia de Express separada del levantamiento del servidor:
- Importa `express`, `cors` y `errorHandler` desde `./src/middlewares/errorHandler.js`.
- Aplica `app.use(cors())` y `app.use(express.json())`.
- Crea una ruta de verificación de estado: `GET /api/health` (y `GET /`) que responda con código `200` y JSON `{ estado: "ok", mensaje: "API Tutorías entre Pares operativa" }`.
- Deja comentarios estructurados indicando dónde cada integrante montará las rutas de su historia funcional (`/api/auth`, `/api/usuarios`, `/api/tutores`, `/api/sesiones`, `/api/valoraciones`).
- Monta `app.use(errorHandler)` al final de la cadena de middlewares.
- Exporta `app` por defecto (`export default app;`).

### G. `index.js`
Punto de arranque del servidor:
- Importa `dotenv/config`.
- Importa `app` desde `./app.js`.
- Importa `sequelize` desde `./src/config/database.js`.
- Importa `./src/models/relaciones.js` para asegurar el registro de todos los modelos antes de sincronizar.
- Define una función asíncrona `main()` que:
  1. Ejecute `await sequelize.authenticate()` para validar la conexión con PostgreSQL (pgAdmin).
  2. Ejecute `await sequelize.sync({ alter: false })` para sincronizar tablas sin destruir datos.
  3. Levante el servidor con `app.listen(PORT, ...)` imprimiendo el puerto activo en consola.
  4. Capture cualquier error de arranque con `try/catch` e imprima un mensaje claro en consola.

### H. `src/tests/pruebas.http`
Incluye peticiones iniciales de prueba para verificar que el servidor responde correctamente con código `200`:

```http
### Verificar estado del servidor
GET http://localhost:3001/api/health
Content-Type: application/json
```

---

## 5. Criterios de Aceptación de este Paso

1. Al ejecutar `npm install` y `npm run dev` dentro de `backend/`, el servidor conecta correctamente con la base de datos vacía creada en **pgAdmin** (`tutorias_ulima`) sin arrojar errores de importación ni de sintaxis.
2. El archivo `.gitignore` de la raíz del proyecto ignora `backend/.env` y `backend/node_modules`, pero permite versionar `backend/.env.example`.
3. La arquitectura deja preparado el flujo estricto en capas (`routes -> controllers -> services -> repositories -> models`) y el manejador global de códigos HTTP exigido en la rúbrica.