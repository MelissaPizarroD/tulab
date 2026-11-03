import { visitanteRepository } from '../infrastructure/repositories/visitanteRepository';
import pool from '../infrastructure/database/connection';
import { io } from '../app';

export const visitanteService = {

  async expirarVisitantesVencidos() {
    const result = await pool.query(
      `SELECT id_visitante FROM visitante 
       WHERE estado = 'activo' 
       AND timestamp_expiracion < NOW()`
    );

    for (const v of result.rows) {
      await visitanteRepository.expirar(v.id_visitante);

      await pool.query(
        `UPDATE registro_acceso 
         SET hora_salida = NOW(), estado = 'cerrado'
         WHERE id_visitante = $1 AND estado = 'activo'`,
        [v.id_visitante]
      );

      await pool.query(
        `UPDATE sesion_equipo SET hora_cierre = NOW(), estado = 'cerrada', motivo_cierre = 'inactividad'
         WHERE id_registro IN (
           SELECT id_registro FROM registro_acceso 
           WHERE id_visitante = $1
         ) AND estado = 'activa'`,
        [v.id_visitante]
      );
    }

    if (result.rows.length > 0) {
      io.emit('visitante_actualizado');
      console.log(`${result.rows.length} visitantes expirados`);
    }
  }

};