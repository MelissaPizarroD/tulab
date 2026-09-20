import { bitacoraRepository } from '../infrastructure/repositories/bitacoraRepository';
import { turnoRepository } from '../infrastructure/repositories/turnoRepository';

export const bitacoraService = {

  async registrar(data: {
    id_encargado: number;
    descripcion: string;
  }) {
    const turno = await turnoRepository.obtenerTurnoActivo();
    if (!turno) {
      throw new Error('No hay turno activo');
    }

    return await bitacoraRepository.crear({
      id_turno: turno.id_turno,
      id_encargado: data.id_encargado,
      descripcion: data.descripcion
    });
  },

  async eliminar(id_entrada: number) {
    const turno = await turnoRepository.obtenerTurnoActivo();
    if (!turno) {
      throw new Error('No hay turno activo');
    }

    const entrada = await bitacoraRepository.eliminar(id_entrada, turno.id_turno);
    if (!entrada) {
      throw new Error('No se encontró la entrada o no pertenece al turno activo');
    }

    return entrada;
  },

  async obtenerPorTurno(id_turno: number) {
    return await bitacoraRepository.obtenerPorTurno(id_turno);
  }

};