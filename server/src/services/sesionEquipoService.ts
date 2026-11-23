import { sesionEquipoRepository } from '../infrastructure/repositories/sesionEquipoRepository';
import { registroAccesoRepository } from '../infrastructure/repositories/registroAccesoRepository';
import { turnoRepository } from '../infrastructure/repositories/turnoRepository';
import { estudianteService } from './estudianteService';
import { emitirEvento } from '../infrastructure/realtime/socketServer';
import { visitanteService } from './visitanteService';
import { clasificarCodigo } from '../utils/clasificarCodigo';
import { dispositivoService } from './dispositivoService';

export const sesionEquipoService = {

  async iniciarSesion(data: {
    codigo: string;
    id_equipo: number;
    id_dispositivo: number;
    ip_origen?: string;
    hora_inicio?: string;
  }) {
    await dispositivoService.validarGestor(data.id_dispositivo, data.id_equipo);

    const turno = await turnoRepository.obtenerTurnoActivo();
    if (!turno) {
      throw new Error('No hay turno activo');
    }

    const sesionEquipoActiva = await sesionEquipoRepository.buscarActivaPorEquipo(data.id_equipo);
    if (sesionEquipoActiva) {
      throw new Error('El equipo ya tiene una sesión activa');
    }

    let registro;
    const { tipo, codigo } = clasificarCodigo(data.codigo);
    if (tipo === 'visitante') {
      const visitante = await visitanteService.validarCodigoTemporal(codigo);
      registro = await registroAccesoRepository.buscarActivoPorVisitante(visitante.id_visitante, turno.id_turno);
    } else {
      const estudiante = await estudianteService.validarCodigo(codigo);
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
      id_dispositivo: data.id_dispositivo,
      ip_origen: data.ip_origen,
      hora_inicio: data.hora_inicio
    });

    emitirEvento('sesion_iniciada', sesion);

    return sesion;
  },

  async cerrarSesion(data: {
    id_equipo: number;
    id_dispositivo: number;
    motivo_cierre: string;
    hora_cierre?: string;
  }) {
    await dispositivoService.validarGestor(data.id_dispositivo, data.id_equipo);

    const sesion = await sesionEquipoRepository.buscarActivaPorEquipo(data.id_equipo);
    if (!sesion) {
      throw new Error('No hay sesión activa en este equipo');
    }

    const sesionCerrada = await sesionEquipoRepository.cerrar(
      sesion.id_sesion,
      data.motivo_cierre,
      data.hora_cierre
    );
    emitirEvento('sesion_cerrada', sesionCerrada);

    return sesionCerrada;
  },

  async obtenerActivasPorTurno(id_turno: number) {
    return await sesionEquipoRepository.obtenerActivasPorTurno(id_turno);
  }

};