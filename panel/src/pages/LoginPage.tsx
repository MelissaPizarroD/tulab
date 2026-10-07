import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const [codigo, setCodigo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!codigo || !contrasena) {
      setError('Ingresa tu código y contraseña');
      return;
    }
    setCargando(true);
    setError('');
    try {
      await login(codigo, contrasena);
      navigate('/dashboard');
    } catch {
      setError('Credenciales inválidas');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#f8fafc'
    }}>
      <div style={{
        background: 'white', borderRadius: '12px',
        padding: '48px', width: '360px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
      }}>
        <h1 style={{ marginTop: 0, marginBottom: '8px', color: '#1e293b' }}>
          TuLab
        </h1>
        <p style={{ color: '#64748b', marginBottom: '32px' }}>
          Panel Administrativo
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="text"
            placeholder="Código de identificación"
            value={codigo}
            onChange={e => setCodigo(e.target.value)}
            style={{
              padding: '12px 16px', fontSize: '16px',
              borderRadius: '8px', border: '1px solid #e2e8f0',
              outline: 'none'
            }}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={contrasena}
            onChange={e => setContrasena(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{
              padding: '12px 16px', fontSize: '16px',
              borderRadius: '8px', border: '1px solid #e2e8f0',
              outline: 'none'
            }}
          />

          {error && (
            <p style={{ color: '#dc2626', fontSize: '14px', margin: 0 }}>
              {error}
            </p>
          )}

          <button
            onClick={handleLogin}
            disabled={cargando}
            style={{
              padding: '12px', fontSize: '16px',
              borderRadius: '8px', border: 'none',
              background: cargando ? '#94a3b8' : '#2563eb',
              color: 'white', cursor: cargando ? 'default' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </div>
      </div>
    </div>
  );
};