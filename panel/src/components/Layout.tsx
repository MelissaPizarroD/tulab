import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/turno', label: 'Gestión de turno', icon: '🕐' },
  { path: '/historicos', label: 'Históricos', icon: '📋' },
  { path: '/configuracion', label: 'Configuración', icon: '⚙️' },
];

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { encargado, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [colapsado, setColapsado] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{
        width: colapsado ? '64px' : '220px',
        background: '#1e293b',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.2s',
        flexShrink: 0
      }}>
        <div style={{
          padding: '20px 16px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #334155'
        }}>
          {!colapsado && (
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>
              TuLab
            </span>
          )}
          <button
            onClick={() => setColapsado(!colapsado)}
            style={{
              background: 'none', border: 'none',
              color: '#94a3b8', cursor: 'pointer',
              fontSize: '18px', padding: '4px'
            }}
          >
            {colapsado ? '→' : '←'}
          </button>
        </div>

        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {menuItems.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                width: '100%', padding: '10px 12px',
                display: 'flex', alignItems: 'center', gap: '10px',
                background: location.pathname === item.path ? '#2563eb' : 'transparent',
                border: 'none', borderRadius: '8px',
                color: location.pathname === item.path ? 'white' : '#94a3b8',
                cursor: 'pointer', fontSize: '14px',
                marginBottom: '4px', textAlign: 'left'
              }}
            >
              <span style={{ fontSize: '16px', flexShrink: 0 }}>{item.icon}</span>
              {!colapsado && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div style={{
          padding: '16px', borderTop: '1px solid #334155'
        }}>
          {!colapsado && (
            <p style={{ color: '#64748b', fontSize: '12px', margin: '0 0 8px' }}>
              {encargado?.nombre}
            </p>
          )}
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '8px',
              borderRadius: '8px', border: '1px solid #475569',
              background: 'transparent', color: '#94a3b8',
              cursor: 'pointer', fontSize: '13px'
            }}
          >
            {colapsado ? '↩' : 'Cerrar sesión'}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </div>
    </div>
  );
};