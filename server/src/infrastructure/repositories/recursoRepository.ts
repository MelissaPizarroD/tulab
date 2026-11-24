import pool from '../database/connection';

export const recursoRepository = {
  async obtenerTodos() {
    const r = await pool.query(`SELECT * FROM recurso ORDER BY nombre`);
    return r.rows;
  },

  async obtenerPorId(id_recurso: number) {
    const r = await pool.query(`SELECT * FROM recurso WHERE id_recurso = $1`, [id_recurso]);
    return r.rows[0] || null;
  },

  async crear(nombre: string) {
    const r = await pool.query(
      `INSERT INTO recurso (nombre) VALUES ($1) RETURNING *`,
      [nombre]
    );
    return r.rows[0];
  },

  async actualizarActivo(id_recurso: number, activo: boolean) {
    const r = await pool.query(
      `UPDATE recurso SET activo = $1 WHERE id_recurso = $2 RETURNING *`,
      [activo, id_recurso]
    );
    return r.rows[0] || null;
  },

  async tieneProgramaciones(id_recurso: number) {
    const r = await pool.query(
      `SELECT EXISTS (SELECT 1 FROM programacion_recurso WHERE id_recurso = $1) AS tiene`,
      [id_recurso]
    );
    return r.rows[0].tiene as boolean;
  },

  async eliminar(id_recurso: number) {
    await pool.query(`DELETE FROM recurso WHERE id_recurso = $1`, [id_recurso]);
  },

  // recursos con su estado actual según las reservas del turno activo
  async disponibilidad(id_turno: number | null) {
    const r = await pool.query(
      `SELECT r.id_recurso, r.nombre, r.activo,
              EXISTS (
                SELECT 1 FROM programacion_recurso pr
                WHERE pr.id_recurso = r.id_recurso
                  AND pr.id_turno = $1
                  AND pr.estado IN ('pendiente','asignado')
                  AND (NOW() AT TIME ZONE 'America/Bogota')::time >= pr.hora_estimada_disponibilidad
                  AND (NOW() AT TIME ZONE 'America/Bogota')::time <  pr.hora_fin
              ) AS ocupado_ahora
       FROM recurso r
       ORDER BY r.nombre`,
      [id_turno]
    );
    return r.rows;
  }
};