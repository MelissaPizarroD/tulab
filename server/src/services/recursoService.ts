import { recursoRepository } from '../infrastructure/repositories/recursoRepository';
import { turnoRepository } from '../infrastructure/repositories/turnoRepository';
import { emitirEvento } from '../infrastructure/realtime/socketServer';

export const recursoService = {
  async obtenerTodos() {
    return await recursoRepository.obtenerTodos();
  },

  async crear(nombre: string) {
    const limpio = (nombre || '').trim();
    if (!limpio) throw new Error('El nombre del recurso es obligatorio');
    try {
      const recurso = await recursoRepository.crear(limpio);
      emitirEvento('recurso_actualizado');
      return recurso;
    } catch (e: any) {
      if (e.code === '23505') throw new Error('Ya existe un recurso con ese nombre');
      throw e;
    }
  },

  async actualizarActivo(id_recurso: number, activo: boolean) {
    const recurso = await recursoRepository.actualizarActivo(id_recurso, !!activo);
    if (!recurso) throw new Error('Recurso no encontrado');
    emitirEvento('recurso_actualizado');
    return recurso;
  },

  // Solo se elimina un recurso que nunca se ha programado, para no perder el historial de reservas
  async eliminar(id_recurso: number) {
    const recurso = await recursoRepository.obtenerPorId(id_recurso);
    if (!recurso) throw new Error('Recurso no encontrado');
    if (await recursoRepository.tieneProgramaciones(id_recurso)) {
      throw new Error('No se puede eliminar un recurso con reservas registradas. Desactívalo para que no se pueda programar.');
    }
    try {
      await recursoRepository.eliminar(id_recurso);
    } catch (e: any) {
      if (e.code === '23503') {
        throw new Error('No se puede eliminar un recurso con reservas registradas. Desactívalo para que no se pueda programar.');
      }
      throw e;
    }
    emitirEvento('recurso_actualizado');
  },

  async disponibilidad() {
    const turno = await turnoRepository.obtenerTurnoActivo();
    return await recursoRepository.disponibilidad(turno ? turno.id_turno : null);
  }
};