import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  setIdEquipo: (id: number) => ipcRenderer.send('set-id-equipo', id),
  notificarSesionIniciada: (id: number) => ipcRenderer.send('sesion-iniciada', id)
});