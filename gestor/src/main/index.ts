import {
  app, BrowserWindow, Tray, Menu, globalShortcut,
  nativeImage, ipcMain, net, Notification
} from 'electron';
import path from 'path';

const isDev = process.env.NODE_ENV === 'development';
const API_URL = process.env.API_URL || 'http://192.168.1.50:3000';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let idEquipoActual: number | null = null;
let saliendo = false;

const mostrarVentana = () => {
  if (!mainWindow) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
};

const avisarAtajo = () => {
  if (Notification.isSupported()) {
    new Notification({
      title: 'TuLab Gestor',
      body: 'Para volver a abrir el Gestor presiona Ctrl + Shift + G o usa la barra de tareas.'
    }).show();
  }
};

const createTray = () => {
  tray = new Tray(nativeImage.createEmpty());
  tray.setToolTip('TuLab Gestor (Ctrl + Shift + G)');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Abrir Gestor', click: mostrarVentana }
  ]));
  tray.on('click', mostrarVentana);
};

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minimizable: true,
    maximizable: false,
    closable: false,
    resizable: false,
    autoHideMenuBar: true,
    title: 'TuLab Gestor',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (!isDev) {
    mainWindow.maximize();
  }

  if (isDev) {
    mainWindow.loadURL('http://localhost:5175');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

    mainWindow.webContents.on('before-input-event', (event, input) => {
      const ctrl = input.control || input.meta;
      const tecla = input.key.toLowerCase();
      const bloqueado =
        (ctrl && ['r', 'w', 'p'].includes(tecla)) ||
        (ctrl && input.shift && tecla === 'i') ||
        input.key === 'F12' ||
        input.key === 'F5' ||
        (input.alt && input.key === 'F4');
      if (bloqueado) event.preventDefault();
    });
  }

  mainWindow.on('minimize', avisarAtajo);

  mainWindow.on('close', (event) => {
    if (!saliendo) {
      event.preventDefault();
      mainWindow?.minimize();
    }
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
  Menu.setApplicationMenu(null);
  createWindow();
  createTray();

  globalShortcut.register('CommandOrControl+Shift+G', () => {
    if (mainWindow?.isVisible() && !mainWindow.isMinimized()) {
      mainWindow.minimize();
    } else {
      mostrarVentana();
    }
  });

  app.setLoginItemSettings({ openAtLogin: true });
});

app.on('window-all-closed', (event: any) => {
  event.preventDefault();
});

app.on('before-quit', () => {
  saliendo = true;
  globalShortcut.unregisterAll();
  cerrarSesionAlApagar();
});