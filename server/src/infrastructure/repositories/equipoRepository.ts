import pool from '../database/connection';

export const equipoRepository = {

  async obtenerTodos() {
    const result = await pool.query(
      `SELECT * FROM equipo ORDER BY numero_equipo`
    );
    return result.rows;
  },

  async crear(data: { numero_equipo: number; descripcion?: string }) {
    const result = await pool.query(
      `INSERT INTO equipo (numero_equipo, estado, descripcion)
       VALUES ($1, 'disponible', $2) RETURNING *`,
      [data.numero_equipo, data.descripcion || null]
    );
    return result.rows[0];
  },

  async actualizarEstado(id_equipo: number, estado: string) {
    const result = await pool.query(
      `UPDATE equipo SET estado = $1 WHERE id_equipo = $2 RETURNING *`,
      [estado, id_equipo]
    );
    return result.rows[0];
  }

};