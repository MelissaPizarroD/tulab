import {
  app, BrowserWindow, Tray, Menu, globalShortcut,
  nativeImage, ipcMain, net, Notification, powerMonitor
} from 'electron';
import path from 'path';
import fs from 'fs';
let limiteInactividadMin = 15;
let ultimoAvisoInactividad = 0;

const isDev = process.env.NODE_ENV === 'development';
// Lee la URL del servidor desde config.json (junto al .exe).
// Si no existe, usa API_URL del entorno o localhost.
const leerApiUrl = (): string => {
  try {
    if (app.isPackaged) {
      const ruta = path.join(path.dirname(app.getPath('exe')), 'config.json');
      if (fs.existsSync(ruta)) {
        const cfg = JSON.parse(fs.readFileSync(ruta, 'utf-8'));
        if (cfg.apiUrl) return String(cfg.apiUrl).replace(/\/+$/, '');
      }
    }
  } catch {
    // Si el archivo está mal escrito se usa el valor por defecto
  }
  return process.env.API_URL || 'http://localhost:3000';
};

const API_URL = leerApiUrl();

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let idEquipoActual: number | null = null;
let saliendo = false;
let sesionActiva = false;

// ---------- Bloqueo / desbloqueo ----------

// Pantalla completa, siempre al frente, sin poder minimizar
const bloquear = () => {
  if (!mainWindow || isDev) return;
  sesionActiva = false;
  mainWindow.setMinimizable(false);
  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  mainWindow.setKiosk(true);
  mainWindow.show();
  mainWindow.focus();
};

// Con sesion valida: se libera y se minimiza a la barra de tareas
const desbloquear = () => {
  if (!mainWindow) return;
  sesionActiva = true;
  if (isDev) return;
  mainWindow.setKiosk(false);
  mainWindow.setFullScreen(false);
  mainWindow.setAlwaysOnTop(false);
  mainWindow.setMinimizable(true);
  mainWindow.minimize();
};

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

// ---------- Inicio automatico solo en equipos del laboratorio ----------
// Si existe el archivo "autostart.flag" junto al .exe, se registra el inicio
// con Windows. Si no existe, se elimina el registro (tu PC personal).
const configurarInicioAutomatico = () => {
  if (!app.isPackaged) return;
  const flag = path.join(path.dirname(app.getPath('exe')), 'autostart.flag');
  app.setLoginItemSettings({ openAtLogin: fs.existsSync(flag) });
};

// ---------- Tray y ventana ----------

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
    minimizable: !!isDev,
    maximizable: false,
    closable: false,
    resizable: false,
    autoHideMenuBar: true,
    title: 'TuLab Gestor',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

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

    bloquear();
  }

  mainWindow.on('minimize', (event: any) => {
    if (!sesionActiva && !isDev) {
      // Sin sesion no se permite minimizar
      event.preventDefault();
      mainWindow?.restore();
      return;
    }
    avisarAtajo();
  });

  mainWindow.on('close', (event) => {
    if (!saliendo) {
      event.preventDefault();
      if (sesionActiva) mainWindow?.minimize();
    }
  });
};

// ---------- IPC ----------

ipcMain.on('get-api-url', (event) => {
  event.returnValue = API_URL;
});

ipcMain.on('set-id-equipo', (_event, id: number) => {
  idEquipoActual = id;
});

ipcMain.on('sesion-iniciada', (_event, id: number) => {
  idEquipoActual = id;
});

// El renderer avisa si hay sesion activa o no
ipcMain.on('estado-sesion', (_event, activa: boolean) => {
  if (activa) desbloquear();
  else bloquear();
});

// El renderer informa el tiempo de inactividad configurado en el servidor
ipcMain.on('tiempo-inactividad', (_event, minutos: number) => {
  if (minutos > 0) limiteInactividadMin = minutos;
});

// Revisa cada 15 s la inactividad de todo el sistema (mouse y teclado en cualquier programa)
const iniciarVigilanciaInactividad = () => {
  setInterval(() => {
    if (!sesionActiva || !mainWindow) return;
    const segundosOciosos = powerMonitor.getSystemIdleTime();
    const pasoElLimite = segundosOciosos >= limiteInactividadMin * 60;
    const noAvisadoReciente = Date.now() - ultimoAvisoInactividad > 60000;
    if (pasoElLimite && noAvisadoReciente) {
      ultimoAvisoInactividad = Date.now();
      mainWindow.webContents.send('inactividad');
    }
  }, 15000);
};

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
    // Solo funciona con una sesion activa
    if (!sesionActiva) return;
    if (mainWindow?.isVisible() && !mainWindow.isMinimized()) {
      mainWindow.minimize();
    } else {
      mostrarVentana();
    }
  });

  configurarInicioAutomatico();
  iniciarVigilanciaInactividad();
});

app.on('window-all-closed', (event: any) => {
  event.preventDefault();
});

app.on('before-quit', () => {
  saliendo = true;
  globalShortcut.unregisterAll();
  cerrarSesionAlApagar();
});