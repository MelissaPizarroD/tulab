import { turnoRepository } from '../infrastructure/repositories/turnoRepository';
import { registroAccesoRepository } from '../infrastructure/repositories/registroAccesoRepository';
import { sesionEquipoRepository } from '../infrastructure/repositories/sesionEquipoRepository';
import { bitacoraRepository } from '../infrastructure/repositories/bitacoraRepository';
import { novedadEquipoRepository } from '../infrastructure/repositories/novedadEquipoRepository';
import { programacionRecursoRepository } from '../infrastructure/repositories/programacionRecursoRepository';
import { emitirEvento } from '../infrastructure/realtime/socketServer';

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
    const fecha_apertura = ahora.toLocaleDateString('en-CA');
    const hora_apertura = ahora.toLocaleTimeString('es-CO', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    });

    const turno = await turnoRepository.crear({
      id_encargado_apertura: data.id_encargado_apertura,
      fecha_apertura,
      hora_apertura,
      observaciones_apertura: data.observaciones_apertura
    });
    emitirEvento('turno_actualizado');
    return turno;
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
    const hora_cierre = ahora.toLocaleTimeString('es-CO', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    });

    const turnoCerrado = await turnoRepository.cerrar(id_turno, {
      id_encargado_cierre: data.id_encargado_cierre,
      hora_cierre,
      observaciones_cierre: data.observaciones_cierre
    });
    emitirEvento('turno_actualizado');
    return turnoCerrado;
  },

  async obtenerHistorico(filtros: { desde?: string; hasta?: string }) {
    return await turnoRepository.obtenerHistorico(filtros);
  },

  async obtenerDetalle(id_turno: number) {
    const [bitacora, novedades, programaciones, sesiones] = await Promise.all([
      bitacoraRepository.obtenerPorTurno(id_turno),
      novedadEquipoRepository.obtenerPorTurno(id_turno),
      programacionRecursoRepository.obtenerPorTurno(id_turno),
      sesionEquipoRepository.obtenerPorTurno(id_turno)
    ]);
    return { bitacora, novedades, programaciones, sesiones };
  }

};