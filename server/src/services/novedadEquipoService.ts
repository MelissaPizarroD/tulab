import { novedadEquipoRepository } from '../infrastructure/repositories/novedadEquipoRepository';
import { sesionEquipoRepository } from '../infrastructure/repositories/sesionEquipoRepository';
import { turnoRepository } from '../infrastructure/repositories/turnoRepository';

export const novedadEquipoService = {

async reportar(data: {
  id_equipo: number;
  descripcion: string;
}) {
  const turno = await turnoRepository.obtenerTurnoActivo();
  if (!turno) {
    throw new Error('No hay turno activo');
  }

  const sesionActiva = await sesionEquipoRepository.buscarActivaPorEquipo(data.id_equipo);
  if (!sesionActiva) {
    throw new Error('No hay sesión activa en este equipo');
  }

  return await novedadEquipoRepository.crear({
    id_sesion: sesionActiva.id_sesion,
    id_equipo: data.id_equipo,
    descripcion: data.descripcion
  });
},

  async obtenerPorTurno(id_turno: number) {
    return await novedadEquipoRepository.obtenerPorTurno(id_turno);
  }

};