import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  apiUrl: ipcRenderer.sendSync('get-api-url') as string,
  setIdEquipo: (id: number) => ipcRenderer.send('set-id-equipo', id),
  notificarSesionIniciada: (id: number) => ipcRenderer.send('sesion-iniciada', id),
  estadoSesion: (activa: boolean) => ipcRenderer.send('estado-sesion', activa),
  setTiempoInactividad: (minutos: number) => ipcRenderer.send('tiempo-inactividad', minutos),
  onInactividad: (callback: () => void) => {
    const listener = () => callback();
    ipcRenderer.on('inactividad', listener);
    return () => ipcRenderer.removeListener('inactividad', listener);
  }
});