import pool from '../database/connection';

export const programacionRecursoRepository = {

  async crear(data: {
    id_turno: number;
    codigo_estudiantil?: string;
    id_visitante?: number;
    tipo_recurso: string;
    descripcion_recurso?: string;
    hora_estimada_disponibilidad?: string;
  }) {
    const result = await pool.query(
      `INSERT INTO programacion_recurso (id_turno, codigo_estudiantil, id_visitante, tipo_recurso, descripcion_recurso, hora_estimada_disponibilidad, estado)
       VALUES ($1, $2, $3, $4, $5, $6, 'pendiente') RETURNING *`,
      [data.id_turno, data.codigo_estudiantil || null, data.id_visitante || null, data.tipo_recurso, data.descripcion_recurso || null, data.hora_estimada_disponibilidad || null]
    );
    return result.rows[0];
  },

  async actualizarEstado(id_programacion: number, estado: string) {
    const result = await pool.query(
      `UPDATE programacion_recurso SET estado = $1
       WHERE id_programacion = $2 RETURNING *`,
      [estado, id_programacion]
    );
    return result.rows[0] || null;
  },

  async obtenerPorTurno(id_turno: number) {
    const result = await pool.query(
      `SELECT pr.*,
              e.nombre AS nombre_estudiante,
              v.nombre AS nombre_visitante
       FROM programacion_recurso pr
       LEFT JOIN estudiante e ON pr.codigo_estudiantil = e.codigo_estudiantil
       LEFT JOIN visitante v ON pr.id_visitante = v.id_visitante
       WHERE pr.id_turno = $1
       ORDER BY pr.hora_estimada_disponibilidad`,
      [id_turno]
    );
    return result.rows;
  }

};