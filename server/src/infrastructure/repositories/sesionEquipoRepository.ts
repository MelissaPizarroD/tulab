import pool from '../database/connection';

export const sesionEquipoRepository = {

  async crear(data: {
    id_registro: number;
    id_equipo: number;
    id_dispositivo: number;
  }) {
    const result = await pool.query(
      `INSERT INTO sesion_equipo (id_registro, id_equipo, id_dispositivo, hora_inicio, estado)
       VALUES ($1, $2, $3, NOW(), 'activa') RETURNING *`,
      [data.id_registro, data.id_equipo, data.id_dispositivo]
    );
    return result.rows[0];
  },

  async buscarActivaPorEquipo(id_equipo: number) {
    const result = await pool.query(
      `SELECT se.*, 
              e.nombre AS nombre_estudiante,
              v.nombre AS nombre_visitante,
              v.codigo_temporal
       FROM sesion_equipo se
       LEFT JOIN registro_acceso ra ON se.id_registro = ra.id_registro
       LEFT JOIN estudiante e ON ra.codigo_estudiantil = e.codigo_estudiantil
       LEFT JOIN visitante v ON ra.id_visitante = v.id_visitante
       WHERE se.id_equipo = $1 AND se.estado = 'activa'`,
      [id_equipo]
    );
    return result.rows[0] || null;
  },

  async buscarActivaPorRegistro(id_registro: number) {
    const result = await pool.query(
      `SELECT * FROM sesion_equipo WHERE id_registro = $1 AND estado = 'activa'`,
      [id_registro]
    );
    return result.rows[0] || null;
  },

  async cerrar(id_sesion: number, motivo_cierre: string) {
    const result = await pool.query(
      `UPDATE sesion_equipo SET hora_cierre = NOW(), estado = 'cerrada', motivo_cierre = $1
       WHERE id_sesion = $2 RETURNING *`,
      [motivo_cierre, id_sesion]
    );
    return result.rows[0];
  },

  async obtenerActivasPorTurno(id_turno: number) {
    const result = await pool.query(
      `SELECT se.*,
              eq.numero_equipo,
              e.nombre AS nombre_estudiante,
              ra.codigo_estudiantil,
              v.nombre AS nombre_visitante,
              v.codigo_temporal
       FROM sesion_equipo se
       JOIN registro_acceso ra ON se.id_registro = ra.id_registro
       JOIN equipo eq ON se.id_equipo = eq.id_equipo
       LEFT JOIN estudiante e ON ra.codigo_estudiantil = e.codigo_estudiantil
       LEFT JOIN visitante v ON ra.id_visitante = v.id_visitante
       WHERE ra.id_turno = $1 AND se.estado = 'activa'
       ORDER BY eq.numero_equipo`,
      [id_turno]
    );
    return result.rows;
  },

  async cerrarTodasPorTurno(id_turno: number) {
    await pool.query(
      `UPDATE sesion_equipo SET hora_cierre = NOW(), estado = 'cerrada', motivo_cierre = 'cierre_turno'
       WHERE id_sesion IN (
         SELECT se.id_sesion FROM sesion_equipo se
         JOIN registro_acceso ra ON se.id_registro = ra.id_registro
         WHERE ra.id_turno = $1 AND se.estado = 'activa'
       )`,
      [id_turno]
    );
  }

};