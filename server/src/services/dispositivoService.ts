import { dispositivoRepository } from '../infrastructure/repositories/dispositivoRepository';
import { equipoRepository } from '../infrastructure/repositories/equipoRepository';
import { emitirEvento } from '../infrastructure/realtime/socketServer';

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

    const existente = (data.tipo === 'gestor_sesiones' && id_equipo)
      ? await dispositivoRepository.buscarGestorPorEquipo(id_equipo)
      : await dispositivoRepository.buscarPorIpYTipo(data.direccion_ip, data.tipo);

    if (existente) {
      if (id_equipo && existente.id_equipo !== id_equipo) {
        await dispositivoRepository.actualizarEquipo(existente.id_dispositivo, id_equipo);
      }
      const actualizado = await dispositivoRepository.actualizarConexion(existente.id_dispositivo, 'conectado');
      if (existente.estado_conexion !== 'conectado') {
        emitirEvento('dispositivo_actualizado');
      }
      return actualizado;
    }

    const nuevo = await dispositivoRepository.crear({
      tipo: data.tipo,
      nombre: data.nombre,
      direccion_ip: data.direccion_ip,
      id_equipo
    });
    emitirEvento('dispositivo_actualizado');
    return nuevo;
  },

  async heartbeat(id_dispositivo: number) {
    const dispositivo = await dispositivoRepository.buscarPorId(id_dispositivo);
    if (!dispositivo) {
      throw new Error('Dispositivo no encontrado');
    }
    const actualizado = await dispositivoRepository.actualizarConexion(id_dispositivo, 'conectado');
    if (dispositivo.estado_conexion !== 'conectado') {
      emitirEvento('dispositivo_actualizado');
    }
    return actualizado;
  },

  async obtenerTodos() {
    return await dispositivoRepository.obtenerTodos();
  },

  async marcarDesconectados() {
    const cambiados = await dispositivoRepository.marcarDesconectados();
    if (cambiados > 0) {
      emitirEvento('sesion_cerrada');
      emitirEvento('dispositivo_actualizado');
    }
  }

};