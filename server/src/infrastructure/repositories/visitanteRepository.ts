import pool from '../database/connection';

export const visitanteRepository = {

  async crear(data: {
    nombre: string;
    motivo_visita?: string;
    codigo_temporal: string;
    timestamp_expiracion: Date;
  }) {
    const result = await pool.query(
      `INSERT INTO visitante (nombre, motivo_visita, codigo_temporal, timestamp_generacion, timestamp_expiracion, estado)
       VALUES ($1, $2, $3, NOW(), $4, 'activo') RETURNING *`,
      [data.nombre, data.motivo_visita || null, data.codigo_temporal, data.timestamp_expiracion]
    );
    return result.rows[0];
  },

  async buscarPorCodigo(codigo_temporal: string) {
    const result = await pool.query(
      `SELECT * FROM visitante WHERE codigo_temporal = $1`,
      [codigo_temporal]
    );
    return result.rows[0] || null;
  },

  async expirar(id_visitante: number) {
    const result = await pool.query(
      `UPDATE visitante SET estado = 'expirado' WHERE id_visitante = $1 RETURNING *`,
      [id_visitante]
    );
    return result.rows[0];
  }

};