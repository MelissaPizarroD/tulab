import { estudianteRepository } from '../infrastructure/repositories/estudianteRepository';
import { visitanteRepository } from '../infrastructure/repositories/visitanteRepository';
import { institucionalAdapter } from '../infrastructure/adapters/institucionalAdapter';

const generarCodigoTemporal = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const estudianteService = {

  async validarCodigo(codigo_estudiantil: string) {
    const datosInstitucionales = await institucionalAdapter.validarEstudiante(codigo_estudiantil);
    if (!datosInstitucionales) {
      throw new Error('Código estudiantil no encontrado');
    }
    const estudiante = await estudianteRepository.crearOActualizar(datosInstitucionales);
    return estudiante;
  },

  async registrarVisitante(data: {
    nombre: string;
    motivo_visita?: string;
    email?: string;
    telefono?: string;
    institucion?: string;
  }) {
    const codigo_temporal = generarCodigoTemporal();
    const timestamp_expiracion = new Date();
    timestamp_expiracion.setHours(timestamp_expiracion.getHours() + 8);

    const visitante = await visitanteRepository.crear({
      ...data,
      codigo_temporal,
      timestamp_expiracion
    });

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
  }

};