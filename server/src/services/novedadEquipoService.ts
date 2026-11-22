import { emitirEvento } from '../infrastructure/realtime/socketServer';
import { novedadEquipoRepository } from '../infrastructure/repositories/novedadEquipoRepository';
import { sesionEquipoRepository } from '../infrastructure/repositories/sesionEquipoRepository';
import { turnoRepository } from '../infrastructure/repositories/turnoRepository';
import { dispositivoService } from './dispositivoService';

export const novedadEquipoService = {

  async reportar(data: {
    id_equipo: number;
    id_dispositivo: number;
    descripcion: string;
    timestamp_reporte?: string;
  }) {
    await dispositivoService.validarGestor(data.id_dispositivo, data.id_equipo);

    const turno = await turnoRepository.obtenerTurnoActivo();
    if (!turno) {
      throw new Error('No hay turno activo');
    }

    const sesionActiva = await sesionEquipoRepository.buscarActivaPorEquipo(data.id_equipo);
    if (!sesionActiva) {
      throw new Error('No hay sesión activa en este equipo');
    }

    const novedad = await novedadEquipoRepository.crear({
      id_sesion: sesionActiva.id_sesion,
      id_equipo: data.id_equipo,
      descripcion: data.descripcion,
      timestamp_reporte: data.timestamp_reporte
    });
    emitirEvento('novedad_reportada', novedad);
    return novedad;
  },

  async obtenerPorTurno(id_turno: number) {
    return await novedadEquipoRepository.obtenerPorTurno(id_turno);
  }

};