import { programacionRecursoRepository } from '../infrastructure/repositories/programacionRecursoRepository';
import { recursoRepository } from '../infrastructure/repositories/recursoRepository';
import { turnoRepository } from '../infrastructure/repositories/turnoRepository';
import { estudianteService } from './estudianteService';
import { visitanteService } from './visitanteService';
import { emitirEvento } from '../infrastructure/realtime/socketServer';
import { clasificarCodigo } from '../utils/clasificarCodigo';

const TRANSICIONES: Record<string, string[]> = {
  pendiente: ['asignado', 'cancelado'],
  asignado: ['finalizado', 'cancelado'],
  finalizado: [],
  cancelado: []
};

export const programacionRecursoService = {

  async programar(data: {
    codigo: string;
    id_recurso: number;
    descripcion_recurso?: string;
    hora_inicio: string;
    hora_fin: string;
  }) {

    let codigo_estudiantil: string | undefined;
    let id_visitante: number | undefined;

    const { tipo, codigo } = clasificarCodigo(data.codigo);

    if (tipo === 'visitante') {
      const visitante = await visitanteService.validarCodigoTemporal(codigo);
      id_visitante = visitante.id_visitante;
    } else {
      const estudiante = await estudianteService.validarCodigo(codigo);
      codigo_estudiantil = estudiante.codigo_estudiantil;
    }

    const turno = await turnoRepository.obtenerTurnoActivo();
    if (!turno) {
      throw new Error('No hay turno activo');
    }

    if (!data.hora_inicio || !data.hora_fin) {
      throw new Error('Indica la hora de inicio y la hora de fin');
    }
    if (data.hora_fin <= data.hora_inicio) {
      throw new Error('La hora de fin debe ser posterior a la hora de inicio');
    }

    const recurso = await recursoRepository.obtenerPorId(Number(data.id_recurso));
    if (!recurso || !recurso.activo) {
      throw new Error('Recurso no disponible');
    }

    const solape = await programacionRecursoRepository.buscarSolape(
      turno.id_turno, recurso.id_recurso, data.hora_inicio, data.hora_fin
    );
    if (solape) {
      throw new Error(
        `${recurso.nombre} ya está reservado de ${String(solape.hora_estimada_disponibilidad).slice(0, 5)} a ${String(solape.hora_fin).slice(0, 5)}`
      );
    }

    const programacion = await programacionRecursoRepository.crear({
      id_turno: turno.id_turno,
      codigo_estudiantil,
      id_visitante,
      id_recurso: recurso.id_recurso,
      descripcion_recurso: data.descripcion_recurso,
      hora_inicio: data.hora_inicio,
      hora_fin: data.hora_fin
    });
    emitirEvento('programacion_actualizada');
    return programacion;
  },

  async actualizarEstado(id_programacion: number, estado: string) {
    if (!(estado in TRANSICIONES)) {
      throw new Error('Estado inválido');
    }

    const actual = await programacionRecursoRepository.obtenerPorId(id_programacion);
    if (!actual) {
      throw new Error('Programación no encontrada');
    }
    if (!TRANSICIONES[actual.estado].includes(estado)) {
      throw new Error(`No se puede pasar de ${actual.estado} a ${estado}`);
    }

    const programacion = await programacionRecursoRepository.actualizarEstado(id_programacion, estado);
    emitirEvento('programacion_actualizada');
    return programacion;
  },

  async obtenerPorTurno(id_turno: number) {
    return await programacionRecursoRepository.obtenerPorTurno(id_turno);
  }

};