import { app, BrowserWindow, Tray, Menu, globalShortcut, nativeImage, ipcMain, net } from 'electron';
import path from 'path';

const isDev = process.env.NODE_ENV === 'development';
const API_URL = process.env.API_URL || 'http://localhost:3000';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let idEquipoActual: number | null = null;

const createTray = () => {
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  tray.setToolTip('TuLab Gestor');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Abrir Gestor',
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('click', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });
};

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    fullscreen: !isDev,
    kiosk: !isDev,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5175');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('close', (event) => {
    event.preventDefault();
    mainWindow?.hide();
  });
};

ipcMain.on('set-id-equipo', (_event, id: number) => {
  idEquipoActual = id;
});

ipcMain.on('sesion-iniciada', (_event, id: number) => {
  idEquipoActual = id;
});

const cerrarSesionAlApagar = () => {
  if (!idEquipoActual) return;

  const request = net.request({
    method: 'POST',
    url: `${API_URL}/api/sesiones/cerrar`
  });
  request.setHeader('Content-Type', 'application/json');
  request.write(JSON.stringify({
    id_equipo: idEquipoActual,
    motivo_cierre: 'apagado_equipo'
  }));
  request.end();
};

app.whenReady().then(() => {
  createWindow();
  createTray();

  globalShortcut.register('CommandOrControl+Shift+G', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow?.show();
      mainWindow?.focus();
    }
  });

  app.setLoginItemSettings({ openAtLogin: true });
});

app.on('window-all-closed', (event: any) => {
  event.preventDefault();
});

app.on('before-quit', () => {
  globalShortcut.unregisterAll();
  cerrarSesionAlApagar();
});