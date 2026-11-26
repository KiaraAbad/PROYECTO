import sequelize from '../config/database.js';

/**
 * Archivo centralizador de modelos y asociaciones de Sequelize.
 * Aquí cada historia funcional (HU-1 a HU-6) registrará sus modelos
 * y definirá sus relaciones (hasMany, belongsTo, hasOne) antes de sincronizar.
 */

// Ejemplo futuro:
// import Usuario from './Usuario.js';
// import PerfilTutor from './PerfilTutor.js';
// Usuario.hasOne(PerfilTutor, { foreignKey: 'tutorId' });

export { sequelize };
export default {};
