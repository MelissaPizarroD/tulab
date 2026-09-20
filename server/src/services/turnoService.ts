import { turnoRepository } from '../infrastructure/repositories/turnoRepository';
import { registroAccesoRepository } from '../infrastructure/repositories/registroAccesoRepository';
import { sesionEquipoRepository } from '../infrastructure/repositories/sesionEquipoRepository';

export const turnoService = {

  async obtenerTurnoActivo() {
    return await turnoRepository.obtenerTurnoActivo();
  },

  async abrirTurno(data: {
    id_encargado_apertura: number;
    observaciones_apertura?: string;
  }) {
    const turnoActivo = await turnoRepository.obtenerTurnoActivo();
    if (turnoActivo) {
      throw new Error('Ya existe un turno activo');
    }

    const ahora = new Date();
    return await turnoRepository.crear({
      id_encargado_apertura: data.id_encargado_apertura,
      fecha_apertura: ahora.toISOString().split('T')[0],
      hora_apertura: ahora.toTimeString().split(' ')[0],
      observaciones_apertura: data.observaciones_apertura
    });
  },

  async cerrarTurno(id_turno: number, data: {
    id_encargado_cierre: number;
    observaciones_cierre?: string;
  }) {
    const turnoActivo = await turnoRepository.obtenerTurnoActivo();
    if (!turnoActivo || turnoActivo.id_turno !== id_turno) {
      throw new Error('No existe un turno activo con ese id');
    }

    await sesionEquipoRepository.cerrarTodasPorTurno(id_turno);
    await registroAccesoRepository.cerrarTodosPorTurno(id_turno);

    const ahora = new Date();
    return await turnoRepository.cerrar(id_turno, {
      id_encargado_cierre: data.id_encargado_cierre,
      hora_cierre: ahora.toTimeString().split(' ')[0],
      observaciones_cierre: data.observaciones_cierre
    });
  }

};