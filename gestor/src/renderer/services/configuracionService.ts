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

export const cargarDispositivoLocal = async () => {
  const db = await getDB();
  const equipo = await db.get('configuracion', 'id_equipo');
  const dispositivo = await db.get('configuracion', 'id_dispositivo');
  const numero = await db.get('configuracion', 'numero_equipo');

  if (!equipo || !dispositivo) return null;

  return {
    idEquipo: Number(equipo.valor),
    idDispositivo: Number(dispositivo.valor),
    numeroEquipo: numero ? Number(numero.valor) : null
  };
};

export const guardarDispositivoLocal = async (
  idEquipo: number,
  idDispositivo: number,
  numeroEquipo: number
) => {
  const db = await getDB();
  await db.put('configuracion', { clave: 'id_equipo', valor: String(idEquipo) });
  await db.put('configuracion', { clave: 'numero_equipo', valor: String(numeroEquipo) });
  await db.put('configuracion', { clave: 'id_dispositivo', valor: String(idDispositivo) });
};