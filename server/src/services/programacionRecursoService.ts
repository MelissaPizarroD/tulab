import { programacionRecursoRepository } from '../infrastructure/repositories/programacionRecursoRepository';
import { turnoRepository } from '../infrastructure/repositories/turnoRepository';
import { estudianteService } from './estudianteService';
import { visitanteService } from './visitanteService';

export const programacionRecursoService = {

  async programar(data: {
    codigo: string;
    tipo_recurso: string;
    descripcion_recurso?: string;
    hora_estimada_disponibilidad?: string;
  }) {
    const turno = await turnoRepository.obtenerTurnoActivo();
    if (!turno) {
      throw new Error('No hay turno activo');
    }

    let codigo_estudiantil: string | undefined;
    let id_visitante: number | undefined;

    if (data.codigo.length === 6 && !isNaN(Number(data.codigo))) {
      const visitante = await visitanteService.validarCodigoTemporal(data.codigo);
      id_visitante = visitante.id_visitante;
    } else {
      const estudiante = await estudianteService.validarCodigo(data.codigo);
      codigo_estudiantil = estudiante.codigo_estudiantil;
    }

    return await programacionRecursoRepository.crear({
      id_turno: turno.id_turno,
      codigo_estudiantil,
      id_visitante,
      tipo_recurso: data.tipo_recurso,
      descripcion_recurso: data.descripcion_recurso,
      hora_estimada_disponibilidad: data.hora_estimada_disponibilidad
    });
  },

  async actualizarEstado(id_programacion: number, estado: string) {
    const estados = ['pendiente', 'asignado', 'cancelado'];
    if (!estados.includes(estado)) {
      throw new Error('Estado inválido');
    }

    const programacion = await programacionRecursoRepository.actualizarEstado(id_programacion, estado);
    if (!programacion) {
      throw new Error('Programación no encontrada');
    }

    return programacion;
  },

  async obtenerPorTurno(id_turno: number) {
    return await programacionRecursoRepository.obtenerPorTurno(id_turno);
  }

};