import { api } from './api';
import { getDB } from '../db/database';

export const obtenerConfiguracion = async (clave: string): Promise<string | null> => {
  try {
    const response = await api.get('/api/configuracion/publica');
    const config = response.data.find((c: any) => c.clave === clave);
    if (config) {
      const db = await getDB();
      await db.put('configuracion', { clave, valor: config.valor });
      return config.valor;
    }
    return null;
  } catch {
    const db = await getDB();
    const config = await db.get('configuracion', clave);
    return config?.valor || null;
  }
};