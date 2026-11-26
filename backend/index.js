import 'dotenv/config';
import app from './app.js';
import sequelize from './src/config/database.js';
import './src/models/relaciones.js';

const PORT = Number(process.env.PORT) || 3001;

/**
 * Inicializa la conexión con PostgreSQL, sincroniza modelos y levanta el servidor HTTP.
 */
async function main() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a PostgreSQL establecida correctamente.');

    await sequelize.sync({ alter: false });
    console.log('Modelos sincronizados con la base de datos.');

    app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor o conectar con PostgreSQL:', error.message);
    process.exitCode = 1;
  }
}

main();
