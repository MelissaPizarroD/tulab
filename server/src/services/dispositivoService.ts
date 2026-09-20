import { dispositivoRepository } from '../infrastructure/repositories/dispositivoRepository';
import pool from '../infrastructure/database/connection';

export const dispositivoService = {

  async registrar(data: {
    tipo: string;
    nombre: string;
    direccion_ip: string;
    id_equipo?: number;
  }) {
    const existente = await dispositivoRepository.buscarPorIp(data.direccion_ip);
    if (existente) {
      await dispositivoRepository.actualizarConexion(existente.id_dispositivo, 'conectado');
      return existente;
    }
    return await dispositivoRepository.crear(data);
  },

  async heartbeat(id_dispositivo: number) {
    const dispositivo = await dispositivoRepository.buscarPorId(id_dispositivo);
    if (!dispositivo) {
      throw new Error('Dispositivo no encontrado');
    }
    return await dispositivoRepository.actualizarConexion(id_dispositivo, 'conectado');
  },

  async obtenerTodos() {
    return await dispositivoRepository.obtenerTodos();
  },

    async marcarDesconectados() {
    await pool.query(
        `UPDATE dispositivo SET estado_conexion = 'desconectado'
        WHERE ultima_conexion < NOW() - INTERVAL '1 minute'
        AND estado_conexion = 'conectado'`
    );
    }

};