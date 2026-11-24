import { api, verificarConexion } from './api';
import { getDB } from '../db/database';

const FORMATO_CODIGO = /^(\d{6}|\d{10})$/;

export const iniciarSesion = async (codigo: string, id_equipo: number, id_dispositivo: number) => {
  // Se valida antes de todo para que, sin conexión, no se desbloquee el equipo con un código inválido
  if (!FORMATO_CODIGO.test(codigo.trim())) {
    return { exito: false, mensaje: 'El código no tiene un formato válido', offline: false };
  }

  const conectado = await verificarConexion();

  if (conectado) {
    try {
      const response = await api.post('/api/sesiones/iniciar', {
        codigo,
        id_equipo,
        id_dispositivo
      });
      return { exito: true, datos: response.data, offline: false };
    } catch (error: any) {
      return {
        exito: false,
        mensaje: error.response?.data?.mensaje || 'Error al iniciar sesión',
        offline: false
      };
    }
  } else {
    const db = await getDB();
    await db.add('sesiones_pendientes', {
      codigo,
      id_equipo,
      id_dispositivo,
      hora_inicio: new Date().toISOString(),
      tipo: 'inicio',
      sincronizado: false
    });
    return { exito: true, datos: null, offline: true };
  }
};

export const cerrarSesion = async (id_equipo: number, id_dispositivo: number, motivo_cierre: string) => {
  const conectado = await verificarConexion();

  if (conectado) {
    try {
      const response = await api.post('/api/sesiones/cerrar', {
        id_equipo,
        id_dispositivo,
        motivo_cierre
      });
      return { exito: true, datos: response.data, offline: false };
    } catch (error: any) {
      return {
        exito: false,
        mensaje: error.response?.data?.mensaje || 'Error al cerrar sesión',
        offline: false
      };
    }
  } else {
    const db = await getDB();
    await db.add('sesiones_pendientes', {
      id_equipo,
      id_dispositivo,
      motivo_cierre,
      hora_cierre: new Date().toISOString(),
      tipo: 'cierre',
      sincronizado: false
    });
    return { exito: true, datos: null, offline: true };
  }
};

export const reportarNovedad = async (id_equipo: number, id_dispositivo: number, descripcion: string) => {
  const conectado = await verificarConexion();

  if (conectado) {
    try {
      const response = await api.post('/api/novedades', {
        id_equipo,
        id_dispositivo,
        descripcion
      });
      return { exito: true, datos: response.data, offline: false };
    } catch (error: any) {
      return {
        exito: false,
        mensaje: error.response?.data?.mensaje || 'Error al reportar novedad',
        offline: false
      };
    }
  } else {
    const db = await getDB();
    await db.add('novedades_pendientes', {
      id_equipo,
      id_dispositivo,
      descripcion,
      timestamp_reporte: new Date().toISOString(),
      sincronizado: false
    });
    return { exito: true, datos: null, offline: true };
  }
};

export const hayPendientesDeSesion = async (): Promise<boolean> => {
  const db = await getDB();
  const pendientes = await db.getAll('sesiones_pendientes');
  return pendientes.length > 0;
};