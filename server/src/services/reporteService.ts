import { reporteRepository } from '../infrastructure/repositories/reporteRepository';
import { registroAccesoService } from './registroAccesoService';

const FECHA = /^\d{4}-\d{2}-\d{2}$/;
const MAX_DIAS = 370;

export const reporteService = {

  async obtenerDatos(desde: string, hasta: string) {
    if (!FECHA.test(desde) || !FECHA.test(hasta)) {
      throw new Error('Las fechas deben tener el formato AAAA-MM-DD');
    }
    const dias = (new Date(hasta).getTime() - new Date(desde).getTime()) / 86400000;
    if (isNaN(dias) || dias < 0) {
      throw new Error('El rango de fechas no es válido');
    }
    if (dias > MAX_DIAS) {
      throw new Error('El rango máximo es de un año');
    }

    const [turnos, registros, bitacora, novedades, programaciones, sesiones] = await Promise.all([
      reporteRepository.turnos(desde, hasta),
      registroAccesoService.obtenerHistorico({ desde, hasta, limit: 20000 }),
      reporteRepository.bitacora(desde, hasta),
      reporteRepository.novedades(desde, hasta),
      reporteRepository.programaciones(desde, hasta),
      reporteRepository.sesiones(desde, hasta)
    ]);

    return {
      desde,
      hasta,
      turnos,
      registros: registros.registros,
      bitacora,
      novedades,
      programaciones,
      sesiones
    };
  }

};