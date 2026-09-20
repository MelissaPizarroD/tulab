import { configuracionRepository } from '../infrastructure/repositories/configuracionRepository';

export const configuracionService = {

  async obtenerTodas() {
    return await configuracionRepository.obtenerTodas();
  },

  async obtenerPorClave(clave: string) {
    const config = await configuracionRepository.obtenerPorClave(clave);
    if (!config) {
      throw new Error(`Configuración '${clave}' no encontrada`);
    }
    return config;
  },

  async actualizar(clave: string, valor: string, id_encargado: number) {
    const config = await configuracionRepository.actualizar(clave, valor, id_encargado);
    if (!config) {
      throw new Error(`Configuración '${clave}' no encontrada`);
    }
    return config;
  }

};