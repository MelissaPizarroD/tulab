import { estudianteRepository } from '../infrastructure/repositories/estudianteRepository';
import { institucionalAdapter } from '../infrastructure/adapters/institucionalAdapter';

export const estudianteService = {

  async validarCodigo(codigo_estudiantil: string) {
    const datosInstitucionales = await institucionalAdapter.validarEstudiante(codigo_estudiantil);
    if (!datosInstitucionales) {
      throw new Error('Código estudiantil no encontrado');
    }
    return await estudianteRepository.crearOActualizar(datosInstitucionales);
  }

};