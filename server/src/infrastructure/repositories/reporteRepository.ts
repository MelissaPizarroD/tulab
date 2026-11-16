import pool from '../database/connection';

export const reporteRepository = {

  async turnos(desde: string, hasta: string) {
    const result = await pool.query(
      `SELECT t.*,
              to_char(t.fecha_apertura, 'YYYY-MM-DD') AS fecha_turno,
              ea.nombre AS nombre_encargado_apertura,
              ec.nombre AS nombre_encargado_cierre,
              (SELECT COUNT(*)::int FROM registro_acceso ra WHERE ra.id_turno = t.id_turno) AS total_registros
       FROM turno t
       JOIN encargado ea ON t.id_encargado_apertura = ea.id_encargado
       LEFT JOIN encargado ec ON t.id_encargado_cierre = ec.id_encargado
       WHERE t.fecha_apertura BETWEEN $1 AND $2
       ORDER BY t.fecha_apertura, t.hora_apertura`,
      [desde, hasta]
    );
    return result.rows;
  },

  async bitacora(desde: string, hasta: string) {
    const result = await pool.query(
      `SELECT rb.*, e.nombre AS nombre_encargado,
              to_char(t.fecha_apertura, 'YYYY-MM-DD') AS fecha_turno
       FROM registro_bitacora rb
       JOIN turno t ON rb.id_turno = t.id_turno
       JOIN encargado e ON rb.id_encargado = e.id_encargado
       WHERE rb.estado = 'activa' AND t.fecha_apertura BETWEEN $1 AND $2
       ORDER BY rb.timestamp_registro`,
      [desde, hasta]
    );
    return result.rows;
  },

  async novedades(desde: string, hasta: string) {
    const result = await pool.query(
      `SELECT ne.*, eq.numero_equipo,
              ra.id_turno,
              to_char(t.fecha_apertura, 'YYYY-MM-DD') AS fecha_turno,
              e.nombre AS nombre_estudiante,
              ra.codigo_estudiantil
       FROM novedad_equipo ne
       JOIN sesion_equipo se ON ne.id_sesion = se.id_sesion
       JOIN registro_acceso ra ON se.id_registro = ra.id_registro
       JOIN turno t ON ra.id_turno = t.id_turno
       JOIN equipo eq ON ne.id_equipo = eq.id_equipo
       LEFT JOIN estudiante e ON ra.codigo_estudiantil = e.codigo_estudiantil
       WHERE t.fecha_apertura BETWEEN $1 AND $2
       ORDER BY ne.timestamp_reporte`,
      [desde, hasta]
    );
    return result.rows;
  },

  async programaciones(desde: string, hasta: string) {
    const result = await pool.query(
      `SELECT pr.*,
              to_char(t.fecha_apertura, 'YYYY-MM-DD') AS fecha_turno,
              e.nombre AS nombre_estudiante,
              v.nombre AS nombre_visitante
       FROM programacion_recurso pr
       JOIN turno t ON pr.id_turno = t.id_turno
       LEFT JOIN estudiante e ON pr.codigo_estudiantil = e.codigo_estudiantil
       LEFT JOIN visitante v ON pr.id_visitante = v.id_visitante
       WHERE t.fecha_apertura BETWEEN $1 AND $2
       ORDER BY t.fecha_apertura, pr.hora_estimada_disponibilidad`,
      [desde, hasta]
    );
    return result.rows;
  },

  async sesiones(desde: string, hasta: string) {
    const result = await pool.query(
      `SELECT se.id_sesion, se.hora_inicio, se.hora_cierre, se.ip_origen,
              eq.numero_equipo, ra.id_turno,
              to_char(t.fecha_apertura, 'YYYY-MM-DD') AS fecha_turno
       FROM sesion_equipo se
       JOIN registro_acceso ra ON se.id_registro = ra.id_registro
       JOIN turno t ON ra.id_turno = t.id_turno
       JOIN equipo eq ON se.id_equipo = eq.id_equipo
       WHERE t.fecha_apertura BETWEEN $1 AND $2
       ORDER BY se.hora_inicio`,
      [desde, hasta]
    );
    return result.rows;
  }

};