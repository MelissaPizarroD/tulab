import { api, verificarConexion } from './api';
import { getDB } from '../db/database';

export const iniciarSesion = async (codigo: string, id_equipo: number, id_dispositivo: number) => {
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
      sincronizado: false
    });
    return { exito: true, datos: null, offline: true };
  }
};

export const cerrarSesion = async (id_equipo: number, motivo_cierre: string) => {
  const conectado = await verificarConexion();

  if (conectado) {
    try {
      const response = await api.post('/api/sesiones/cerrar', {
        id_equipo,
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
      motivo_cierre,
      hora_cierre: new Date().toISOString(),
      tipo: 'cierre',
      sincronizado: false
    });
    return { exito: true, datos: null, offline: true };
  }
};

export const reportarNovedad = async (id_equipo: number, descripcion: string) => {
  const conectado = await verificarConexion();

  if (conectado) {
    try {
      const response = await api.post('/api/novedades', {
        id_equipo,
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
      descripcion,
      timestamp_reporte: new Date().toISOString(),
      sincronizado: false
    });
    return { exito: true, datos: null, offline: true };
  }
};