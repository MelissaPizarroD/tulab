import { openDB } from 'idb';

const DB_NAME = 'tulab_terminal';
const DB_VERSION = 1;

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('estudiantes')) {
        const estudiantesStore = db.createObjectStore('estudiantes', {
          keyPath: 'codigo_estudiantil'
        });
        estudiantesStore.createIndex('fecha_ultima_consulta', 'fecha_ultima_consulta');
      }

      if (!db.objectStoreNames.contains('visitantes')) {
        const visitantesStore = db.createObjectStore('visitantes', {
          keyPath: 'id_visitante_local',
          autoIncrement: true
        });
        visitantesStore.createIndex('codigo_temporal', 'codigo_temporal', { unique: true });
      }

      if (!db.objectStoreNames.contains('registros_pendientes')) {
        const registrosStore = db.createObjectStore('registros_pendientes', {
          keyPath: 'id_local',
          autoIncrement: true
        });
        registrosStore.createIndex('sincronizado', 'sincronizado');
      }

      if (!db.objectStoreNames.contains('configuracion')) {
        db.createObjectStore('configuracion', { keyPath: 'clave' });
      }
    }
  });
};

export const getDB = async () => {
  return initDB();
};