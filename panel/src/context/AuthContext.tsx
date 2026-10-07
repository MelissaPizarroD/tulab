import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, setAuthToken, removeAuthToken, socket } from '../services/api';

interface Encargado {
  id_encargado: number;
  nombre: string;
  rol: string;
}

interface AuthContextType {
  encargado: Encargado | null;
  token: string | null;
  login: (codigo: string, contrasena: string) => Promise<void>;
  logout: () => void;
  cargando: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [encargado, setEncargado] = useState<Encargado | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const tokenGuardado = localStorage.getItem('tulab_token');
    const encargadoGuardado = localStorage.getItem('tulab_encargado');
    if (tokenGuardado && encargadoGuardado) {
      setToken(tokenGuardado);
      setEncargado(JSON.parse(encargadoGuardado));
      setAuthToken(tokenGuardado);
      socket.connect();
    }
    setCargando(false);
  }, []);

  const login = async (codigo_identificacion: string, contrasena: string) => {
    const response = await api.post('/api/auth/login', {
      codigo_identificacion,
      contrasena
    });
    const { token, encargado } = response.data;
    setToken(token);
    setEncargado(encargado);
    setAuthToken(token);
    localStorage.setItem('tulab_token', token);
    localStorage.setItem('tulab_encargado', JSON.stringify(encargado));
    socket.connect();
  };

  const logout = () => {
    setToken(null);
    setEncargado(null);
    removeAuthToken();
    localStorage.removeItem('tulab_token');
    localStorage.removeItem('tulab_encargado');
    socket.disconnect();
  };

  return (
    <AuthContext.Provider value={{ encargado, token, login, logout, cargando }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};