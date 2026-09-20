import { api } from './api';
import { getDB } from '../db/database';
import { verificarConexion } from './api';

export const registrarEntrada = async (codigo: string) => {
  const conectado = await verificarConexion();

  if (conectado) {
    try {
      const response = await api.post('/api/registros-acceso/entrada', {
        codigo,
        origen_registro: 'terminal'
      });
      return { exito: true, datos: response.data, offline: false };
    } catch (error: any) {
      return {
        exito: false,
        mensaje: error.response?.data?.mensaje || 'Error al registrar entrada',
        offline: false
      };
    }
  } else {
    const db = await getDB();
    await db.add('registros_pendientes', {
      codigo,
      origen_registro: 'terminal',
      hora_entrada: new Date().toISOString(),
      tipo: 'entrada',
      sincronizado: false
    });
    return { exito: true, datos: null, offline: true };
  }
};

export const registrarSalida = async (codigo: string) => {
  const conectado = await verificarConexion();

  if (conectado) {
    try {
      const response = await api.post('/api/registros-acceso/salida', {
        codigo
      });
      return { exito: true, datos: response.data, offline: false };
    } catch (error: any) {
      return {
        exito: false,
        mensaje: error.response?.data?.mensaje || 'Error al registrar salida',
        offline: false
      };
    }
  } else {
    const db = await getDB();
    await db.add('registros_pendientes', {
      codigo,
      origen_registro: 'terminal',
      hora_salida: new Date().toISOString(),
      tipo: 'salida',
      sincronizado: false
    });
    return { exito: true, datos: null, offline: true };
  }
};

export const validarCodigo = async (codigo: string) => {
  const conectado = await verificarConexion();

  if (conectado) {
    try {
      const response = await api.get(`/api/estudiantes/validar/${codigo}`);
      const db = await getDB();
      await db.put('estudiantes', {
        ...response.data,
        fecha_ultima_consulta: new Date().toISOString()
      });
      return { valido: true, datos: response.data };
    } catch {
      return { valido: false, datos: null };
    }
  } else {
    const db = await getDB();
    const estudiante = await db.get('estudiantes', codigo);
    if (estudiante) {
      return { valido: true, datos: estudiante };
    }
    return { valido: false, datos: null };
  }
};