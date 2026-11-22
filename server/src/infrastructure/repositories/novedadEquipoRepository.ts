import pool from '../database/connection';

export const novedadEquipoRepository = {

  async crear(data: {
    id_sesion: number;
    id_equipo: number;
    descripcion: string;
    timestamp_reporte?: string;
  }) {
    const result = await pool.query(
      `INSERT INTO novedad_equipo
         (id_sesion, id_equipo, descripcion, timestamp_reporte, codigo_estudiantil, id_visitante)
       SELECT $1::int, $2::int, $3::text, COALESCE($4::timestamptz, NOW()),
              ra.codigo_estudiantil, ra.id_visitante
       FROM sesion_equipo se
       JOIN registro_acceso ra ON se.id_registro = ra.id_registro
       WHERE se.id_sesion = $1::int
       RETURNING *`,
      [data.id_sesion, data.id_equipo, data.descripcion, data.timestamp_reporte || null]
    );
    return result.rows[0];
  },

  async obtenerPorTurno(id_turno: number) {
    const result = await pool.query(
      `SELECT ne.*, eq.numero_equipo,
              e.nombre AS nombre_estudiante,
              v.nombre AS nombre_visitante
       FROM novedad_equipo ne
       JOIN sesion_equipo se ON ne.id_sesion = se.id_sesion
       JOIN registro_acceso ra ON se.id_registro = ra.id_registro
       JOIN equipo eq ON ne.id_equipo = eq.id_equipo
       LEFT JOIN estudiante e ON ne.codigo_estudiantil = e.codigo_estudiantil
       LEFT JOIN visitante v ON ne.id_visitante = v.id_visitante
       WHERE ra.id_turno = $1
       ORDER BY ne.timestamp_reporte DESC`,
      [id_turno]
    );
    return result.rows;
  }

};