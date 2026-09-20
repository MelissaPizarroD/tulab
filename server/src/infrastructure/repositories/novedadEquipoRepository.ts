import pool from '../database/connection';

export const novedadEquipoRepository = {

  async crear(data: {
    id_sesion: number;
    id_equipo: number;
    descripcion: string;
  }) {
    const result = await pool.query(
      `INSERT INTO novedad_equipo (id_sesion, id_equipo, descripcion, timestamp_reporte)
       VALUES ($1, $2, $3, NOW()) RETURNING *`,
      [data.id_sesion, data.id_equipo, data.descripcion]
    );
    return result.rows[0];
  },

  async obtenerPorTurno(id_turno: number) {
    const result = await pool.query(
      `SELECT ne.*, eq.numero_equipo,
              e.nombre AS nombre_estudiante,
              ra.codigo_estudiantil
       FROM novedad_equipo ne
       JOIN sesion_equipo se ON ne.id_sesion = se.id_sesion
       JOIN registro_acceso ra ON se.id_registro = ra.id_registro
       JOIN equipo eq ON ne.id_equipo = eq.id_equipo
       LEFT JOIN estudiante e ON ra.codigo_estudiantil = e.codigo_estudiantil
       WHERE ra.id_turno = $1
       ORDER BY ne.timestamp_reporte DESC`,
      [id_turno]
    );
    return result.rows;
  }

};