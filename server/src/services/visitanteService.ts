import { visitanteRepository } from '../infrastructure/repositories/visitanteRepository';
import { emitirEvento } from '../infrastructure/realtime/socketServer';

const generarCodigoTemporal = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const visitanteService = {

  async registrar(data: {
    nombre: string;
    motivo_visita?: string;
    email?: string;
    telefono?: string;
    institucion?: string;
  }) {
    if (!data.nombre || !data.nombre.trim()) {
      throw new Error('El nombre del visitante es obligatorio');
    }

    const codigo_temporal = generarCodigoTemporal();
    const timestamp_expiracion = new Date();
    timestamp_expiracion.setHours(timestamp_expiracion.getHours() + 8);

    const visitante = await visitanteRepository.crear({
      ...data,
      codigo_temporal,
      timestamp_expiracion
    });

    emitirEvento('visitante_actualizado');
    return visitante;
  },

  async validarCodigoTemporal(codigo_temporal: string) {
    const visitante = await visitanteRepository.buscarPorCodigo(codigo_temporal);
    if (!visitante) {
      throw new Error('Código temporal no encontrado');
    }
    if (visitante.estado === 'expirado') {
      throw new Error('Código temporal expirado');
    }
    if (new Date() > new Date(visitante.timestamp_expiracion)) {
      await visitanteRepository.expirar(visitante.id_visitante);
      throw new Error('Código temporal expirado');
    }
    return visitante;
  },

  async actualizarExpiracion(id_visitante: number, timestamp_expiracion: string) {
    const nuevaExpiracion = new Date(timestamp_expiracion);
    if (nuevaExpiracion <= new Date()) {
      throw new Error('La nueva hora de expiración debe ser futura');
    }
    const visitante = await visitanteRepository.actualizarExpiracion(id_visitante, nuevaExpiracion);
    emitirEvento('visitante_actualizado');
    return visitante;
  },

  async obtenerVigentes() {
    return await visitanteRepository.obtenerVigentes();
  },

  async expirarVisitantesVencidos() {
    const vencidos = await visitanteRepository.obtenerVencidos();

    for (const v of vencidos) {
      await visitanteRepository.expirar(v.id_visitante);
      await visitanteRepository.cerrarSesionesActivas(v.id_visitante);
      await visitanteRepository.cerrarRegistrosActivos(v.id_visitante);
    }

    if (vencidos.length > 0) {
      console.log(`${vencidos.length} visitantes expirados`);
      emitirEvento('visitante_actualizado');
    }
  }

};