import pool from '../database/connection';

export const visitanteRepository = {

  async crear(data: {
    nombre: string;
    motivo_visita?: string;
    email?: string;
    telefono?: string;
    institucion?: string;
    codigo_temporal: string;
    timestamp_expiracion: Date;
  }) {
    const result = await pool.query(
      `INSERT INTO visitante (nombre, motivo_visita, email, telefono, institucion, codigo_temporal, timestamp_generacion, timestamp_expiracion, estado)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, 'activo') RETURNING *`,
      [
        data.nombre,
        data.motivo_visita || null,
        data.email || null,
        data.telefono || null,
        data.institucion || null,
        data.codigo_temporal,
        data.timestamp_expiracion
      ]
    );
    return result.rows[0];
  },

  async buscarPorCodigo(codigo_temporal: string) {
    const result = await pool.query(
      `SELECT * FROM visitante WHERE codigo_temporal = $1`,
      [codigo_temporal]
    );
    return result.rows[0] || null;
  },

  async expirar(id_visitante: number) {
    const result = await pool.query(
      `UPDATE visitante SET estado = 'expirado' WHERE id_visitante = $1 RETURNING *`,
      [id_visitante]
    );
    return result.rows[0];
  },

  async actualizarExpiracion(id_visitante: number, timestamp_expiracion: Date) {
    const result = await pool.query(
      `UPDATE visitante SET timestamp_expiracion = $1
       WHERE id_visitante = $2 RETURNING *`,
      [timestamp_expiracion, id_visitante]
    );
    return result.rows[0];
  },

  async obtenerVigentes() {
    const result = await pool.query(
      `SELECT v.*,
              EXISTS (
                SELECT 1 FROM registro_acceso ra
                WHERE ra.id_visitante = v.id_visitante AND ra.estado = 'activo'
              ) AS ha_ingresado
       FROM visitante v
       WHERE v.estado = 'activo' AND v.timestamp_expiracion > NOW()
       ORDER BY v.timestamp_generacion DESC`
    );
    return result.rows;
  },

  async obtenerVencidos() {
    const result = await pool.query(
      `SELECT id_visitante FROM visitante
       WHERE estado = 'activo' AND timestamp_expiracion < NOW()`
    );
    return result.rows;
  },

  async cerrarRegistrosActivos(id_visitante: number) {
    await pool.query(
      `UPDATE registro_acceso SET hora_salida = NOW(), estado = 'cerrado'
       WHERE id_visitante = $1 AND estado = 'activo'`,
      [id_visitante]
    );
  },

  async cerrarSesionesActivas(id_visitante: number) {
    await pool.query(
      `UPDATE sesion_equipo
       SET hora_cierre = NOW(), estado = 'cerrada', motivo_cierre = 'inactividad'
       WHERE id_registro IN (
         SELECT id_registro FROM registro_acceso WHERE id_visitante = $1
       ) AND estado = 'activa'`,
      [id_visitante]
    );
  }

};