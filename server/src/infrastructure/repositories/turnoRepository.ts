import pool from '../database/connection';

export const turnoRepository = {

  async obtenerTurnoActivo() {
    const result = await pool.query(
      `SELECT t.*, 
              e.nombre AS nombre_encargado_apertura
      FROM turno t
      JOIN encargado e ON t.id_encargado_apertura = e.id_encargado
      WHERE t.estado = 'activo' LIMIT 1`
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

  async obtenerHistorico(filtros: { desde?: string; hasta?: string }) {
    let query = `
      SELECT t.*,
            to_char(t.fecha_apertura, 'YYYY-MM-DD') AS fecha_turno,
            e.nombre AS nombre_encargado_apertura,
            ec.nombre AS nombre_encargado_cierre,
            (SELECT COUNT(*)::int FROM registro_acceso ra WHERE ra.id_turno = t.id_turno) AS total_registros
      FROM turno t
      JOIN encargado e ON t.id_encargado_apertura = e.id_encargado
      LEFT JOIN encargado ec ON t.id_encargado_cierre = ec.id_encargado
      WHERE 1=1
    `;
    const params: any[] = [];
    let i = 1;

    if (filtros.desde) {
      query += ` AND t.fecha_apertura >= $${i++}`;
      params.push(filtros.desde);
    }
    if (filtros.hasta) {
      query += ` AND t.fecha_apertura <= $${i++}`;
      params.push(filtros.hasta);
    }

    query += ' ORDER BY t.fecha_apertura DESC, t.hora_apertura DESC LIMIT 200';

    const result = await pool.query(query, params);
    return result.rows;
  }

};