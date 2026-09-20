import pool from '../database/connection';

export const encargadoRepository = {

  async buscarPorCodigo(codigo_identificacion: string) {
    const result = await pool.query(
      `SELECT * FROM encargado WHERE codigo_identificacion = $1 AND activo = true`,
      [codigo_identificacion]
    );
    return result.rows[0] || null;
  },

  async buscarPorId(id_encargado: number) {
    const result = await pool.query(
      `SELECT id_encargado, nombre, codigo_identificacion, rol, activo 
       FROM encargado WHERE id_encargado = $1`,
      [id_encargado]
    );
    return result.rows[0] || null;
  }

};