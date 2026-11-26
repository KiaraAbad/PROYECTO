import 'dotenv/config';
import { Sequelize } from 'sequelize';

/**
 * Instancia principal de Sequelize conectada a PostgreSQL.
 */
export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    logging: false,
  }
);

export default sequelize;
