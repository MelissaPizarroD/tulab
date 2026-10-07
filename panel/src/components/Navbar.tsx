import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const { encargado, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{
      height: '60px', background: '#1e293b',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 24px'
    }}>
      <h2 style={{ color: 'white', margin: 0, fontSize: '18px' }}>
        TuLab Panel
      </h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ color: '#94a3b8', fontSize: '14px' }}>
          {encargado?.nombre}
        </span>
        <button
          onClick={handleLogout}
          style={{
            padding: '6px 16px', borderRadius: '6px',
            border: '1px solid #475569', background: 'transparent',
            color: '#94a3b8', cursor: 'pointer', fontSize: '14px'
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};