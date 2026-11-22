import pool from '../database/connection';

export const programacionRecursoRepository = {

  async crear(data: {
    id_turno: number;
    codigo_estudiantil?: string;
    id_visitante?: number;
    id_recurso: number;
    descripcion_recurso?: string;
    hora_inicio: string;
    hora_fin: string;
  }) {
    const result = await pool.query(
      `INSERT INTO programacion_recurso
         (id_turno, codigo_estudiantil, id_visitante, id_recurso, descripcion_recurso,
          hora_estimada_disponibilidad, hora_fin, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pendiente') RETURNING *`,
      [
        data.id_turno,
        data.codigo_estudiantil || null,
        data.id_visitante || null,
        data.id_recurso,
        data.descripcion_recurso || null,
        data.hora_inicio,
        data.hora_fin
      ]
    );
    return result.rows[0];
  },

  // reservas vigentes (pendiente o asignado) del mismo recurso que se traslapan con la franja
  async buscarSolape(id_turno: number, id_recurso: number, hora_inicio: string, hora_fin: string) {
    const result = await pool.query(
      `SELECT hora_estimada_disponibilidad, hora_fin
       FROM programacion_recurso
       WHERE id_turno = $1
         AND id_recurso = $2
         AND estado IN ('pendiente','asignado')
         AND hora_estimada_disponibilidad < $4::time
         AND hora_fin > $3::time
       LIMIT 1`,
      [id_turno, id_recurso, hora_inicio, hora_fin]
    );
    return result.rows[0] || null;
  },

  async obtenerPorId(id_programacion: number) {
    const result = await pool.query(
      `SELECT * FROM programacion_recurso WHERE id_programacion = $1`,
      [id_programacion]
    );
    return result.rows[0] || null;
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
              r.nombre AS nombre_recurso,
              e.nombre AS nombre_estudiante,
              v.nombre AS nombre_visitante
       FROM programacion_recurso pr
       LEFT JOIN recurso r ON pr.id_recurso = r.id_recurso
       LEFT JOIN estudiante e ON pr.codigo_estudiantil = e.codigo_estudiantil
       LEFT JOIN visitante v ON pr.id_visitante = v.id_visitante
       WHERE pr.id_turno = $1
       ORDER BY pr.hora_estimada_disponibilidad`,
      [id_turno]
    );
    return result.rows;
  }

};