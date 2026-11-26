/**
 * Clase padre genérica de repositorio sobre un modelo de Sequelize.
 * Centraliza las operaciones CRUD estándar para evitar acceso directo a datos en controladores.
 */
export class RepositoryBase {
  /**
   * @param {import('sequelize').ModelStatic<import('sequelize').Model>} modelo
   */
  constructor(modelo) {
    this.modelo = modelo;
  }

  /**
   * Obtiene todos los registros que coincidan con las opciones indicadas.
   */
  async findAll(opciones = {}) {
    return await this.modelo.findAll(opciones);
  }

  /**
   * Busca un registro por su clave primaria.
   */
  async findOne(id, opciones = {}) {
    return await this.modelo.findByPk(id, opciones);
  }

  /**
   * Busca un único registro según una condición `where`.
   */
  async findOneWhere(condicion, opciones = {}) {
    return await this.modelo.findOne({ where: condicion, ...opciones });
  }

  /**
   * Crea un nuevo registro en la base de datos.
   */
  async create(data) {
    return await this.modelo.create(data);
  }

  /**
   * Actualiza un registro existente por clave primaria; retorna `null` si no existe.
   */
  async update(id, data) {
    const registro = await this.modelo.findByPk(id);
    if (!registro) {
      return null;
    }
    return await registro.update(data);
  }

  /**
   * Elimina un registro existente por clave primaria; retorna `false` si no existe o `true` si se eliminó.
   */
  async delete(id) {
    const registro = await this.modelo.findByPk(id);
    if (!registro) {
      return false;
    }
    await registro.destroy();
    return true;
  }
}

export default RepositoryBase;
