import pool from '../database/connection';

export const configuracionRepository = {

  async obtenerPorClave(clave: string) {
    const result = await pool.query(
      `SELECT * FROM configuracion_sistema WHERE clave = $1`,
      [clave]
    );
    return result.rows[0] || null;
  },

  async obtenerTodas() {
    const result = await pool.query(
      `SELECT * FROM configuracion_sistema ORDER BY clave`
    );
    return result.rows;
  },

  async actualizar(clave: string, valor: string, id_encargado: number) {
    const result = await pool.query(
      `UPDATE configuracion_sistema SET valor = $1, ultima_modificacion = NOW(), id_encargado_modifico = $2
       WHERE clave = $3 RETURNING *`,
      [valor, id_encargado, clave]
    );
    return result.rows[0] || null;
  }

};