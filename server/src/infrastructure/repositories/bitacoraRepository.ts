import pool from '../database/connection';

export const bitacoraRepository = {

  async crear(data: {
    id_turno: number;
    id_encargado: number;
    descripcion: string;
  }) {
    const result = await pool.query(
      `INSERT INTO registro_bitacora (id_turno, id_encargado, descripcion, timestamp_registro, estado)
       VALUES ($1, $2, $3, NOW(), 'activa') RETURNING *`,
      [data.id_turno, data.id_encargado, data.descripcion]
    );
    return result.rows[0];
  },

  async eliminar(id_entrada: number, id_turno: number) {
    const result = await pool.query(
      `UPDATE registro_bitacora SET estado = 'eliminada'
       WHERE id_entrada = $1 AND id_turno = $2 AND estado = 'activa' RETURNING *`,
      [id_entrada, id_turno]
    );
    return result.rows[0] || null;
  },

  async obtenerPorTurno(id_turno: number) {
    const result = await pool.query(
      `SELECT rb.*, e.nombre AS nombre_encargado
       FROM registro_bitacora rb
       JOIN encargado e ON rb.id_encargado = e.id_encargado
       WHERE rb.id_turno = $1 AND rb.estado = 'activa'
       ORDER BY rb.timestamp_registro DESC`,
      [id_turno]
    );
    return result.rows;
  }

};