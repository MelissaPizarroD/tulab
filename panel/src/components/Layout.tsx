import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/tulab_logo.svg';
import '../styles/panel.css';
import {
  IconoDashboard, IconoReloj, IconoHistorial, IconoAjustes, IconoSalir, IconoPanel
} from './Iconos';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', Icono: IconoDashboard, soloSala: false },
  { path: '/turno', label: 'Gestión de turno', Icono: IconoReloj, soloSala: true },
  { path: '/historicos', label: 'Históricos', Icono: IconoHistorial, soloSala: false },
  { path: '/configuracion', label: 'Configuración', Icono: IconoAjustes, soloSala: true }
];

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { encargado, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // en pantallas pequeñas la barra empieza colapsada
  const [colapsado, setColapsado] = useState(() => window.innerWidth < 900);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app">
      <aside className={`lateral ${colapsado ? 'lateral--colapsado' : ''}`}>
        <div className="lateral__cabecera">
          {!colapsado && <img className="lateral__logo" src={logo} alt="TuLab" />}
          <button
            type="button"
            className="lateral__alternar"
            onClick={() => setColapsado(!colapsado)}
            aria-label={colapsado ? 'Expandir menú' : 'Colapsar menú'}
            title={colapsado ? 'Expandir menú' : 'Colapsar menú'}
          >
            <IconoPanel />
          </button>
        </div>

        <nav className="lateral__nav" aria-label="Principal">
          {menuItems
            .filter((m) => !m.soloSala || encargado?.rol === 'encargado_sala')
            .map(({ path, label, Icono }) => {
            const activo = location.pathname === path;
            return (
              <button
                key={path}
                type="button"
                className={`lateral__item ${activo ? 'lateral__item--activo' : ''}`}
                onClick={() => navigate(path)}
                aria-current={activo ? 'page' : undefined}
                title={colapsado ? label : undefined}
              >
                <Icono />
                {!colapsado && <span>{label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="lateral__pie">
          {!colapsado && encargado?.nombre && (
            <p className="lateral__usuario">{encargado.nombre}</p>
          )}
          <button
            type="button"
            className="lateral__item lateral__item--salir"
            onClick={handleLogout}
            title={colapsado ? 'Cerrar sesión' : undefined}
          >
            <IconoSalir />
            {!colapsado && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      <main className="contenido">{children}</main>
    </div>
  );
};