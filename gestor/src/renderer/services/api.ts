import axios from 'axios';

// Prioridad: config.json (vía Electron) > VITE_API_URL > localhost
const API_URL: string =
  (window as any).electron?.apiUrl ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 5000
});

export const verificarConexion = async (): Promise<boolean> => {
  try {
    await api.get('/health');
    return true;
  } catch {
    return false;
  }
};

export const urlServidor = API_URL;