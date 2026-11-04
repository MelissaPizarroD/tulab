import { sesionEquipoRepository } from '../infrastructure/repositories/sesionEquipoRepository';
import { registroAccesoRepository } from '../infrastructure/repositories/registroAccesoRepository';
import { turnoRepository } from '../infrastructure/repositories/turnoRepository';
import { estudianteService } from './estudianteService';
import { emitirEvento } from '../infrastructure/realtime/socketServer';

export const sesionEquipoService = {

  async iniciarSesion(data: {
    codigo: string;
    id_equipo: number;
    id_dispositivo: number;
  }) {
    const turno = await turnoRepository.obtenerTurnoActivo();
    if (!turno) {
      throw new Error('No hay turno activo');
    }

    const sesionEquipoActiva = await sesionEquipoRepository.buscarActivaPorEquipo(data.id_equipo);
    if (sesionEquipoActiva) {
      throw new Error('El equipo ya tiene una sesión activa');
    }

    let registro;
    if (data.codigo.length === 6 && !isNaN(Number(data.codigo))) {
      const visitante = await estudianteService.validarCodigoTemporal(data.codigo);
      registro = await registroAccesoRepository.buscarActivoPorVisitante(visitante.id_visitante, turno.id_turno);
    } else {
      const estudiante = await estudianteService.validarCodigo(data.codigo);
      registro = await registroAccesoRepository.buscarActivoPorEstudiante(estudiante.codigo_estudiantil, turno.id_turno);
    }

    if (!registro) {
      throw new Error('El estudiante o visitante no tiene entrada activa en este turno');
    }

    const sesionActiva = await sesionEquipoRepository.buscarActivaPorRegistro(registro.id_registro);
    if (sesionActiva) {
      throw new Error('El estudiante o visitante ya tiene una sesión activa en otro equipo');
    }

    const sesion = await sesionEquipoRepository.crear({
      id_registro: registro.id_registro,
      id_equipo: data.id_equipo,
      id_dispositivo: data.id_dispositivo
    });

    emitirEvento('sesion_iniciada', sesion);

    return sesion;
  },

  async cerrarSesion(data: {
    id_equipo: number;
    motivo_cierre: string;
  }) {
    const sesion = await sesionEquipoRepository.buscarActivaPorEquipo(data.id_equipo);
    if (!sesion) {
      throw new Error('No hay sesión activa en este equipo');
    }

    const sesionCerrada = await sesionEquipoRepository.cerrar(sesion.id_sesion, data.motivo_cierre);

    emitirEvento('sesion_cerrada', sesionCerrada);

    return sesionCerrada;
  },

  async obtenerActivasPorTurno(id_turno: number) {
    return await sesionEquipoRepository.obtenerActivasPorTurno(id_turno);
  }

};