import pool from '../database/connection';

export const dispositivoRepository = {

  async marcarDesconectados() {
  await pool.query(
    `UPDATE dispositivo SET estado_conexion = 'desconectado'
     WHERE ultima_conexion < NOW() - INTERVAL '1 minute'
     AND estado_conexion = 'conectado'`
    );
  },

  async buscarPorIp(direccion_ip: string) {
    const result = await pool.query(
      `SELECT * FROM dispositivo WHERE direccion_ip = $1 AND activo = true`,
      [direccion_ip]
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
  }

};