import pool from '../database/connection';

export const registroAccesoRepository = {

  async crear(data: {
    codigo_estudiantil?: string;
    id_visitante?: number;
    id_turno: number;
    id_dispositivo?: number;
    origen_registro: string;
  }) {
    const result = await pool.query(
      `INSERT INTO registro_acceso (codigo_estudiantil, id_visitante, id_turno, id_dispositivo, hora_entrada, origen_registro, estado)
       VALUES ($1, $2, $3, $4, NOW(), $5, 'activo') RETURNING *`,
      [data.codigo_estudiantil || null, data.id_visitante || null, data.id_turno, data.id_dispositivo || null, data.origen_registro]
    );
    return result.rows[0];
  },

  async buscarActivoPorEstudiante(codigo_estudiantil: string, id_turno: number) {
    const result = await pool.query(
      `SELECT * FROM registro_acceso 
       WHERE codigo_estudiantil = $1 AND id_turno = $2 AND estado = 'activo'`,
      [codigo_estudiantil, id_turno]
    );
    return result.rows[0] || null;
  },

  async buscarActivoPorVisitante(id_visitante: number, id_turno: number) {
    const result = await pool.query(
      `SELECT * FROM registro_acceso
       WHERE id_visitante = $1 AND id_turno = $2 AND estado = 'activo'`,
      [id_visitante, id_turno]
    );
    return result.rows[0] || null;
  },

  async registrarSalida(id_registro: number) {
    const result = await pool.query(
      `UPDATE registro_acceso SET hora_salida = NOW(), estado = 'cerrado'
       WHERE id_registro = $1 RETURNING *`,
      [id_registro]
    );
    return result.rows[0];
  },

  async obtenerActivosPorTurno(id_turno: number) {
    const result = await pool.query(
      `SELECT ra.*,
              e.nombre AS nombre_estudiante, e.programa_academico,
              e.semestre, e.correo_institucional, e.telefono_contacto,
              v.nombre AS nombre_visitante, v.motivo_visita, v.codigo_temporal,
              v.email, v.telefono, v.institucion, v.timestamp_expiracion
      FROM registro_acceso ra
      LEFT JOIN estudiante e ON ra.codigo_estudiantil = e.codigo_estudiantil
      LEFT JOIN visitante v ON ra.id_visitante = v.id_visitante
      WHERE ra.id_turno = $1 AND ra.estado = 'activo'
      ORDER BY ra.hora_entrada`,
      [id_turno]
    );
    return result.rows;
  },

  async cerrarTodosPorTurno(id_turno: number) {
    await pool.query(
      `UPDATE registro_acceso SET hora_salida = NOW(), estado = 'cerrado'
       WHERE id_turno = $1 AND estado = 'activo'`,
      [id_turno]
    );
  },

  async obtenerHistorico(filtros: { fecha?: string; codigo?: string }) {
    let query = `
      SELECT ra.*,
            e.nombre AS nombre_estudiante, e.programa_academico,
            e.semestre, e.correo_institucional, e.telefono_contacto,
            v.nombre AS nombre_visitante, v.motivo_visita, v.codigo_temporal,
            v.email, v.telefono, v.institucion, v.timestamp_expiracion
      FROM registro_acceso ra
      LEFT JOIN estudiante e ON ra.codigo_estudiantil = e.codigo_estudiantil
      LEFT JOIN visitante v ON ra.id_visitante = v.id_visitante
      WHERE 1=1
    `;
    const params: any[] = [];
    let i = 1;

    if (filtros.fecha) {
      query += ` AND DATE(ra.hora_entrada) = $${i++}`;
      params.push(filtros.fecha);
    }

    if (filtros.codigo) {
      query += ` AND ra.codigo_estudiantil = $${i++}`;
      params.push(filtros.codigo);
    }

    query += ' ORDER BY ra.hora_entrada DESC LIMIT 100';

    const result = await pool.query(query, params);
    return result.rows;
  }

};