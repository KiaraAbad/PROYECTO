/**
 * Middleware global de manejo de errores de Express.
 * Garantiza respuestas HTTP uniformes en toda la API.
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const mensaje = err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    error: mensaje,
    detalles: err.detalles || null,
  });
};

export default errorHandler;
