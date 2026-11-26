import express from 'express';
import cors from 'cors';
import errorHandler from './src/middlewares/errorHandler.js';

const app = express();

// Middlewares base
app.use(cors());
app.use(express.json());

/**
 * Manejador compartido para verificar que la API está operativa.
 */
const verificarEstado = (req, res) => {
  res.status(200).json({
    estado: 'ok',
    mensaje: 'API Tutorías entre Pares operativa',
  });
};

// Rutas de verificación de estado
app.get('/', verificarEstado);
app.get('/api/health', verificarEstado);

// ============================================================================
// Montaje futuro de rutas por Historia Funcional (HU-1 a HU-6)
// ============================================================================
// app.use('/api/auth', authRoutes);             // HU-1: Autenticación y acceso
// app.use('/api/usuarios', usuariosRoutes);     // HU-1 / HU-7: Cuentas y gestión de usuarios
// app.use('/api/tutores', tutoresRoutes);       // HU-2 / HU-3: Perfil, disponibilidad y directorio
// app.use('/api/sesiones', sesionesRoutes);     // HU-4 / HU-5: Agenda, desarrollo y cierre
// app.use('/api/valoraciones', valoracionesRoutes); // HU-6: Calificaciones y ranking

// Manejador global de errores HTTP (siempre al final de la cadena)
app.use(errorHandler);

export default app;
