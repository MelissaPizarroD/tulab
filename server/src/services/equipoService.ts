import { equipoRepository } from '../infrastructure/repositories/equipoRepository';

const ESTADOS_VALIDOS = ['disponible', 'en_uso', 'fuera_de_servicio'];

export const equipoService = {
  async obtenerTodos() {
    return await equipoRepository.obtenerTodos();
  },

  async crear(data: { numero_equipo: number; descripcion?: string }) {
    if (!data.numero_equipo || data.numero_equipo <= 0) {
      throw new Error('Número de equipo inválido');
    }
    return await equipoRepository.crear(data);
  },

  async actualizarEstado(id_equipo: number, estado: string) {
    if (!ESTADOS_VALIDOS.includes(estado)) {
      throw new Error('Estado inválido');
    }
    const equipo = await equipoRepository.actualizarEstado(id_equipo, estado);
    if (!equipo) throw new Error('Equipo no encontrado');
    return equipo;
  }
};