import { openDB } from 'idb';

const DB_NAME = 'tulab_gestor';
const DB_VERSION = 1;

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('estudiantes')) {
        db.createObjectStore('estudiantes', { keyPath: 'codigo_estudiantil' });
      }

      if (!db.objectStoreNames.contains('visitantes')) {
        const visitantesStore = db.createObjectStore('visitantes', {
          keyPath: 'id_visitante_local',
          autoIncrement: true
        });
        visitantesStore.createIndex('codigo_temporal', 'codigo_temporal', { unique: true });
      }

      if (!db.objectStoreNames.contains('sesiones_pendientes')) {
        db.createObjectStore('sesiones_pendientes', {
          keyPath: 'id_local',
          autoIncrement: true
        });
      }

      if (!db.objectStoreNames.contains('novedades_pendientes')) {
        db.createObjectStore('novedades_pendientes', {
          keyPath: 'id_local',
          autoIncrement: true
        });
      }

      if (!db.objectStoreNames.contains('configuracion')) {
        db.createObjectStore('configuracion', { keyPath: 'clave' });
      }
    }
  });
};

export const getDB = async () => initDB();