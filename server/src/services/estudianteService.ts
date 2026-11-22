import { estudianteRepository } from '../infrastructure/repositories/estudianteRepository';
import { institucionalAdapter } from '../infrastructure/adapters/institucionalAdapter';
import { clasificarCodigo } from '../utils/clasificarCodigo';

export const estudianteService = {

  async validarCodigo(codigo_estudiantil: string) {
    const datosInstitucionales = await institucionalAdapter.validarEstudiante(codigo_estudiantil);
    if (!datosInstitucionales) {
      throw new Error('Código estudiantil no encontrado');
    }
    return await estudianteRepository.crearOActualizar(datosInstitucionales);
  },

  // Solo confirma que el código existe: no devuelve el perfil ni escribe en la base
  async existe(valor: string) {
    const { tipo, codigo } = clasificarCodigo(valor);
    if (tipo !== 'estudiante') {
      throw new Error('El código no corresponde a un estudiante');
    }
    const datos = await institucionalAdapter.validarEstudiante(codigo);
    if (!datos) {
      throw new Error('Código estudiantil no encontrado');
    }
    return { valido: true, codigo_estudiantil: datos.codigo_estudiantil };
  }

};