import pool from '../database/connection';

export const turnoRepository = {

  async obtenerTurnoActivo() {
    const result = await pool.query(
      `SELECT * FROM turno WHERE estado = 'activo' LIMIT 1`
    );
    return result.rows[0] || null;
  },

  async crear(data: {
    id_encargado_apertura: number;
    fecha_apertura: string;
    hora_apertura: string;
    observaciones_apertura?: string;
  }) {
    const result = await pool.query(
      `INSERT INTO turno (id_encargado_apertura, fecha_apertura, hora_apertura, observaciones_apertura, estado)
       VALUES ($1, $2, $3, $4, 'activo') RETURNING *`,
      [data.id_encargado_apertura, data.fecha_apertura, data.hora_apertura, data.observaciones_apertura || null]
    );
    return result.rows[0];
  },

  async cerrar(id_turno: number, data: {
    id_encargado_cierre: number;
    hora_cierre: string;
    observaciones_cierre?: string;
  }) {
    const result = await pool.query(
      `UPDATE turno SET estado = 'cerrado', id_encargado_cierre = $1, hora_cierre = $2, observaciones_cierre = $3
       WHERE id_turno = $4 RETURNING *`,
      [data.id_encargado_cierre, data.hora_cierre, data.observaciones_cierre || null, id_turno]
    );
    return result.rows[0];
  },

  async obtenerHistorico(filtros: { fecha?: string }) {
    let query = `SELECT * FROM turno WHERE 1=1`;
    const params: any[] = [];
    let i = 1;

    if (filtros.fecha) {
      query += ` AND fecha_apertura = $${i++}`;
      params.push(filtros.fecha);
    }

    query += ' ORDER BY fecha_apertura DESC, hora_apertura DESC LIMIT 50';

    const result = await pool.query(query, params);
    return result.rows;
  }

};