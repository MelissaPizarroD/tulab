import { useState } from 'react';
import { api } from '../services/api';

interface Visitante {
  id_visitante: number;
  nombre: string;
  codigo_temporal: string;
  timestamp_expiracion: string;
  estado: string;
}

export const RegistroVisitante = () => {
  const [nombre, setNombre] = useState('');
  const [motivo, setMotivo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [visitante, setVisitante] = useState<Visitante | null>(null);
  const [error, setError] = useState('');

  const handleRegistrar = async () => {
    if (!nombre.trim()) return;
    setEnviando(true);
    setError('');
    try {
      const response = await api.post('/api/estudiantes/visitantes', {
        nombre,
        motivo_visita: motivo
      });
      setVisitante(response.data);
      setNombre('');
      setMotivo('');
    } catch (error: any) {
      setError(error.response?.data?.mensaje || 'Error al registrar visitante');
    } finally {
      setEnviando(false);
    }
  };

  const handleNuevo = () => {
    setVisitante(null);
    setError('');
  };

  return (
    <div>
      <h3 style={{ marginTop: 0, color: '#1e293b' }}>Registro de visitantes</h3>

      {visitante ? (
        <div style={{
          padding: '24px', borderRadius: '12px',
          background: '#f0fdf4', border: '1px solid #bbf7d0',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 8px', color: '#166534', fontSize: '14px' }}>
            Visitante registrado correctamente
          </p>
          <p style={{ margin: '0 0 4px', fontWeight: 'bold', color: '#1e293b', fontSize: '16px' }}>
            {visitante.nombre}
          </p>
          <div style={{
            margin: '16px auto', padding: '16px 24px',
            background: 'white', borderRadius: '8px',
            display: 'inline-block', border: '2px solid #166534'
          }}>
            <p style={{ margin: '0 0 4px', color: '#64748b', fontSize: '12px' }}>
              Código temporal
            </p>
            <p style={{ margin: 0, fontSize: '36px', fontWeight: 'bold', letterSpacing: '8px', color: '#166534' }}>
              {visitante.codigo_temporal}
            </p>
          </div>
          <p style={{ margin: '8px 0 16px', color: '#64748b', fontSize: '12px' }}>
            Válido hasta: {new Date(visitante.timestamp_expiracion).toLocaleTimeString('es-CO', {
              hour: '2-digit', minute: '2-digit'
            })}
          </p>
          <button
            onClick={handleNuevo}
            style={{
              padding: '10px 24px', borderRadius: '8px',
              border: 'none', background: '#2563eb',
              color: 'white', cursor: 'pointer',
              fontSize: '14px', fontWeight: 'bold'
            }}
          >
            Registrar otro visitante
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="text"
            placeholder="Nombre completo del visitante"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            style={{
              padding: '10px 14px', fontSize: '14px',
              borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none'
            }}
          />
          <input
            type="text"
            placeholder="Motivo de la visita (opcional)"
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            style={{
              padding: '10px 14px', fontSize: '14px',
              borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none'
            }}
          />
          {error && (
            <p style={{ margin: 0, color: '#dc2626', fontSize: '14px' }}>{error}</p>
          )}
          <button
            onClick={handleRegistrar}
            disabled={enviando || !nombre.trim()}
            style={{
              padding: '10px', borderRadius: '8px',
              border: 'none',
              background: enviando || !nombre.trim() ? '#94a3b8' : '#2563eb',
              color: 'white', cursor: enviando ? 'default' : 'pointer',
              fontSize: '14px', fontWeight: 'bold'
            }}
          >
            {enviando ? 'Registrando...' : 'Registrar y generar código'}
          </button>
        </div>
      )}
    </div>
  );
};