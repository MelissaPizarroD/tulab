import { registroAccesoRepository } from '../infrastructure/repositories/registroAccesoRepository';
import { turnoRepository } from '../infrastructure/repositories/turnoRepository';
import { estudianteService } from './estudianteService';
import { emitirEvento } from '../infrastructure/realtime/socketServer';
import { visitanteService } from './visitanteService';

export const registroAccesoService = {

  async registrarEntrada(data: {
    codigo: string;
    id_dispositivo?: number;
    origen_registro: string;
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

      const registroExistente = await registroAccesoRepository.buscarActivoPorVisitante(id_visitante!, turno.id_turno);
      if (registroExistente) {
        throw new Error('El visitante ya tiene una entrada activa en este turno');
      }
    } else {
      const estudiante = await estudianteService.validarCodigo(data.codigo);
      codigo_estudiantil = estudiante.codigo_estudiantil;

      const registroExistente = await registroAccesoRepository.buscarActivoPorEstudiante(codigo_estudiantil!, turno.id_turno);
      if (registroExistente) {
        throw new Error('El estudiante ya tiene una entrada activa en este turno');
      }
    }

    const registro = await registroAccesoRepository.crear({
      codigo_estudiantil,
      id_visitante,
      id_turno: turno.id_turno,
      id_dispositivo: data.id_dispositivo,
      origen_registro: data.origen_registro
    });

    emitirEvento('entrada_registrada', registro);

    return registro;
  },

  async registrarSalida(data: {
    codigo: string;
  }) {
    const turno = await turnoRepository.obtenerTurnoActivo();
    if (!turno) {
      throw new Error('No hay turno activo');
    }

    let registro;

    if (data.codigo.length === 6 && !isNaN(Number(data.codigo))) {
      const visitante = await visitanteService.validarCodigoTemporal(data.codigo);
      registro = await registroAccesoRepository.buscarActivoPorVisitante(visitante.id_visitante, turno.id_turno);
    } else {
      const estudiante = await estudianteService.validarCodigo(data.codigo);
      registro = await registroAccesoRepository.buscarActivoPorEstudiante(estudiante.codigo_estudiantil, turno.id_turno);
    }

    if (!registro) {
      throw new Error('No se encontró una entrada activa para este código');
    }

    const registroActualizado = await registroAccesoRepository.registrarSalida(registro.id_registro);

    emitirEvento('salida_registrada', registroActualizado);

    return registroActualizado;
  },

  async obtenerActivosPorTurno(id_turno: number) {
    return await registroAccesoRepository.obtenerActivosPorTurno(id_turno);
  },

  async obtenerHistorico(filtros: { fecha?: string; codigo?: string }) {
  return await registroAccesoRepository.obtenerHistorico(filtros);
  }

};