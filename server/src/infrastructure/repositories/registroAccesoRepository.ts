import pool from '../database/connection';

export const registroAccesoRepository = {

  async crear(data: {
    codigo_estudiantil?: string;
    id_visitante?: number;
    id_turno: number;
    id_dispositivo?: number;
    origen_registro: string;
    ip_origen?: string
  }) {
    const result = await pool.query(
      `INSERT INTO registro_acceso
        (codigo_estudiantil, id_visitante, id_turno, id_dispositivo, hora_entrada, origen_registro, ip_origen, estado)
      VALUES ($1, $2, $3, $4, NOW(), $5, $6, 'activo') RETURNING *`,
      [data.codigo_estudiantil || null, data.id_visitante || null, data.id_turno, data.id_dispositivo || null, data.origen_registro, data.ip_origen || null]
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

  async obtenerHistorico(filtros: {
    desde?: string;
    hasta?: string;
    q?: string;
    tipo?: string;
    id_turno?: number;
    limit?: number;
    offset?: number;
  }) {
    const base = `
      FROM registro_acceso ra
      JOIN turno t ON ra.id_turno = t.id_turno
      JOIN encargado ea ON t.id_encargado_apertura = ea.id_encargado
      LEFT JOIN encargado ec ON t.id_encargado_cierre = ec.id_encargado
      LEFT JOIN estudiante e ON ra.codigo_estudiantil = e.codigo_estudiantil
      LEFT JOIN visitante v ON ra.id_visitante = v.id_visitante
    `;

    // las fechas se filtran por la fecha del turno (no por la hora de entrada),
    // así no dependen de la zona horaria de la base de datos
    let where = 'WHERE 1=1';
    const params: any[] = [];
    let i = 1;

    if (filtros.desde) {
      where += ` AND t.fecha_apertura >= $${i++}`;
      params.push(filtros.desde);
    }
    if (filtros.hasta) {
      where += ` AND t.fecha_apertura <= $${i++}`;
      params.push(filtros.hasta);
    }
    if (filtros.id_turno) {
      where += ` AND ra.id_turno = $${i++}`;
      params.push(filtros.id_turno);
    }
    if (filtros.tipo === 'estudiante') {
      where += ' AND ra.codigo_estudiantil IS NOT NULL';
    } else if (filtros.tipo === 'visitante') {
      where += ' AND ra.id_visitante IS NOT NULL';
    }
    if (filtros.q) {
      where += ` AND (e.nombre ILIKE $${i} OR v.nombre ILIKE $${i}
                   OR ra.codigo_estudiantil ILIKE $${i} OR v.codigo_temporal ILIKE $${i})`;
      params.push(`%${filtros.q}%`);
      i++;
    }

    const total = await pool.query(`SELECT COUNT(*)::int AS total ${base} ${where}`, params);

    const limit = Math.min(Math.max(filtros.limit || 50, 1), 20000);
    const offset = Math.max(filtros.offset || 0, 0);

    const result = await pool.query(
      `SELECT ra.*,
              to_char(t.fecha_apertura, 'YYYY-MM-DD') AS fecha_turno,
              ea.nombre AS nombre_encargado_apertura,
              ec.nombre AS nombre_encargado_cierre,
              e.nombre AS nombre_estudiante, e.programa_academico,
              e.semestre, e.correo_institucional, e.telefono_contacto,
              v.nombre AS nombre_visitante, v.motivo_visita, v.codigo_temporal,
              v.email, v.telefono, v.institucion, v.timestamp_expiracion,
              s.equipos, s.ips_equipo
       ${base}
       LEFT JOIN LATERAL (
         SELECT string_agg(eq.numero_equipo::text, ', ' ORDER BY se.hora_inicio) AS equipos,
                string_agg(DISTINCT se.ip_origen, ', ') AS ips_equipo
         FROM sesion_equipo se
         JOIN equipo eq ON se.id_equipo = eq.id_equipo
         WHERE se.id_registro = ra.id_registro
       ) s ON true
       ${where}
       ORDER BY ra.hora_entrada DESC
       LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    return { total: total.rows[0].total as number, registros: result.rows };
  }

};