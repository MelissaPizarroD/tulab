import { api } from './api';
import { getDB } from '../db/database';

let sincronizando = false;

export const sincronizarPendientes = async () => {
  if (sincronizando) return;
  sincronizando = true;

  try {
    const db = await getDB();
    const sesiones = await db.getAll('sesiones_pendientes');
    const novedades = await db.getAll('novedades_pendientes');

    const eventos = [
      ...sesiones.map((s: any) => {
        const esCierre = s.tipo === 'cierre';
        return {
          ref: `sesiones_pendientes:${s.id_local}`,
          tipo: esCierre ? 'cierre' : 'inicio',
          hora: esCierre ? s.hora_cierre : s.hora_inicio,
          codigo: s.codigo,
          id_equipo: s.id_equipo,
          id_dispositivo: s.id_dispositivo,
          motivo_cierre: s.motivo_cierre
        };
      }),
      ...novedades.map((n: any) => ({
        ref: `novedades_pendientes:${n.id_local}`,
        tipo: 'novedad',
        hora: n.timestamp_reporte,
        id_equipo: n.id_equipo,
        id_dispositivo: n.id_dispositivo,
        descripcion: n.descripcion
      }))
    ].sort((a, b) => a.hora.localeCompare(b.hora));

    if (eventos.length === 0) return;

    const response = await api.post('/api/sincronizacion/gestor', { eventos });

    for (const resultado of response.data.resultados) {
      if (!resultado.exito && !resultado.descartar) continue;
      const [almacen, id] = resultado.ref.split(':');
      await db.delete(almacen, Number(id));
    }

    console.log(`Sincronizados ${eventos.length} eventos pendientes`);
  } catch {
    console.log('No se pudo sincronizar, se intentará después');
  } finally {
    sincronizando = false;
  }
};