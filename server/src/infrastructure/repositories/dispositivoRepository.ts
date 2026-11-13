import pool from '../database/connection';

export const dispositivoRepository = {

  async buscarPorIp(direccion_ip: string) {
    const result = await pool.query(
      `SELECT * FROM dispositivo WHERE direccion_ip = $1 AND activo = true`,
      [direccion_ip]
    );
    return result.rows[0] || null;
  },

  async buscarPorIpYTipo(direccion_ip: string, tipo: string) {
    const result = await pool.query(
      `SELECT * FROM dispositivo WHERE direccion_ip = $1 AND tipo = $2 AND activo = true`,
      [direccion_ip, tipo]
    );
    return result.rows[0] || null;
  },

  async buscarPorId(id_dispositivo: number) {
    const result = await pool.query(
      `SELECT * FROM dispositivo WHERE id_dispositivo = $1`,
      [id_dispositivo]
    );
    return result.rows[0] || null;
  },

  async crear(data: {
    tipo: string;
    nombre: string;
    direccion_ip: string;
    id_equipo?: number;
  }) {
    const result = await pool.query(
      `INSERT INTO dispositivo (tipo, nombre, direccion_ip, id_equipo, fecha_registro, estado_conexion)
       VALUES ($1, $2, $3, $4, NOW(), 'conectado') RETURNING *`,
      [data.tipo, data.nombre, data.direccion_ip, data.id_equipo || null]
    );
    return result.rows[0];
  },

  async actualizarEquipo(id_dispositivo: number, id_equipo: number) {
    const result = await pool.query(
      `UPDATE dispositivo SET id_equipo = $1 WHERE id_dispositivo = $2 RETURNING *`,
      [id_equipo, id_dispositivo]
    );
    return result.rows[0];
  },

  async actualizarConexion(id_dispositivo: number, estado_conexion: string) {
    const result = await pool.query(
      `UPDATE dispositivo SET estado_conexion = $1, ultima_conexion = NOW()
       WHERE id_dispositivo = $2 RETURNING *`,
      [estado_conexion, id_dispositivo]
    );
    return result.rows[0];
  },

  async obtenerTodos() {
    const result = await pool.query(
      `SELECT d.*, e.numero_equipo FROM dispositivo d
       LEFT JOIN equipo e ON d.id_equipo = e.id_equipo
       WHERE d.activo = true
       ORDER BY d.tipo, d.nombre`
    );
    return result.rows;
  },

  async marcarDesconectados() {
    await pool.query(
      `UPDATE sesion_equipo
      SET hora_cierre = NOW(), estado = 'cerrada', motivo_cierre = 'apagado_equipo'
      WHERE estado = 'activa'
      AND id_dispositivo IN (
        SELECT id_dispositivo FROM dispositivo
        WHERE estado_conexion = 'conectado'
        AND ultima_conexion < NOW() - INTERVAL '1 minute'
      )`
    );

    const result = await pool.query(
      `UPDATE dispositivo SET estado_conexion = 'desconectado'
      WHERE ultima_conexion < NOW() - INTERVAL '1 minute'
      AND estado_conexion = 'conectado'`
    );
    return result.rowCount ?? 0;
  },

  async buscarGestorPorEquipo(id_equipo: number) {
  const result = await pool.query(
    `SELECT * FROM dispositivo
     WHERE tipo = 'gestor_sesiones' AND id_equipo = $1 AND activo = true
     ORDER BY id_dispositivo DESC LIMIT 1`,
    [id_equipo]
  );
  return result.rows[0] || null;
  }
};