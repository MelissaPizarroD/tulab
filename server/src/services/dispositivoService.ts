import { dispositivoRepository } from '../infrastructure/repositories/dispositivoRepository';
import { equipoRepository } from '../infrastructure/repositories/equipoRepository';

export const dispositivoService = {

  async registrar(data: {
    tipo: string;
    nombre: string;
    direccion_ip: string;
    numero_equipo?: number;
  }) {
    let id_equipo: number | undefined;

    if (data.numero_equipo) {
      const equipo = await equipoRepository.buscarPorNumero(Number(data.numero_equipo));
      if (!equipo) {
        throw new Error(`El equipo ${data.numero_equipo} no está registrado. Créalo primero en el Panel.`);
      }
      id_equipo = equipo.id_equipo;
    }

    const existente = await dispositivoRepository.buscarPorIpYTipo(data.direccion_ip, data.tipo);

    if (existente) {
      if (id_equipo && existente.id_equipo !== id_equipo) {
        await dispositivoRepository.actualizarEquipo(existente.id_dispositivo, id_equipo);
      }
      return await dispositivoRepository.actualizarConexion(existente.id_dispositivo, 'conectado');
    }

    return await dispositivoRepository.crear({
      tipo: data.tipo,
      nombre: data.nombre,
      direccion_ip: data.direccion_ip,
      id_equipo
    });
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
    await dispositivoRepository.marcarDesconectados();
  }

};