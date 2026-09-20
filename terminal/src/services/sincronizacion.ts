import { api } from './api';
import { getDB } from '../db/database';

export const sincronizarPendientes = async () => {
  const db = await getDB();
  const todos = await db.getAll('registros_pendientes');
  const pendientes = todos.filter((r: any) => r.sincronizado === false);

  if (pendientes.length === 0) return;

  try {
    const response = await api.post('/api/sincronizacion/terminal', {
      registros: pendientes
    });

    for (const resultado of response.data.resultados) {
      if (resultado.exito) {
        await db.delete('registros_pendientes', resultado.id_local);
      }
    }

    console.log(`Sincronizados ${pendientes.length} registros pendientes`);
  } catch {
    console.log('No se pudo sincronizar, se intentará después');
  }
};