import { useState } from 'react';
import { api } from '../services/api';

interface Visitante {
  id_visitante: number;
  nombre: string;
  codigo_temporal: string;
  timestamp_expiracion: string;
  email: string | null;
  telefono: string | null;
  institucion: string | null;
}

export const RegistroVisitante = () => {
  const [form, setForm] = useState({
    nombre: '',
    motivo_visita: '',
    email: '',
    telefono: '',
    institucion: ''
  });
  const [enviando, setEnviando] = useState(false);
  const [visitante, setVisitante] = useState<Visitante | null>(null);
  const [error, setError] = useState('');

  const handleChange = (campo: string, valor: string) => {
    setForm(f => ({ ...f, [campo]: valor }));
  };

  const handleRegistrar = async () => {
    if (!form.nombre.trim()) return;
    setEnviando(true);
    setError('');
    try {
      const response = await api.post('/api/estudiantes/visitantes', {
        nombre: form.nombre,
        motivo_visita: form.motivo_visita || undefined,
        email: form.email || undefined,
        telefono: form.telefono || undefined,
        institucion: form.institucion || undefined
      });
      setVisitante(response.data);
      setForm({ nombre: '', motivo_visita: '', email: '', telefono: '', institucion: '' });
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
          {visitante.institucion && (
            <p style={{ margin: '0 0 4px', color: '#64748b', fontSize: '13px' }}>
              {visitante.institucion}
            </p>
          )}
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <input
            type="text"
            placeholder="Nombre completo *"
            value={form.nombre}
            onChange={e => handleChange('nombre', e.target.value)}
            style={{
              gridColumn: '1 / -1', padding: '10px 14px', fontSize: '14px',
              borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none'
            }}
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={e => handleChange('email', e.target.value)}
            style={{
              padding: '10px 14px', fontSize: '14px',
              borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none'
            }}
          />
          <input
            type="tel"
            placeholder="Teléfono"
            value={form.telefono}
            onChange={e => handleChange('telefono', e.target.value)}
            style={{
              padding: '10px 14px', fontSize: '14px',
              borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none'
            }}
          />
          <input
            type="text"
            placeholder="Institución"
            value={form.institucion}
            onChange={e => handleChange('institucion', e.target.value)}
            style={{
              padding: '10px 14px', fontSize: '14px',
              borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none'
            }}
          />
          <input
            type="text"
            placeholder="Motivo de la visita"
            value={form.motivo_visita}
            onChange={e => handleChange('motivo_visita', e.target.value)}
            style={{
              padding: '10px 14px', fontSize: '14px',
              borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none'
            }}
          />
          {error && (
            <p style={{ gridColumn: '1 / -1', margin: 0, color: '#dc2626', fontSize: '14px' }}>
              {error}
            </p>
          )}
          <button
            onClick={handleRegistrar}
            disabled={enviando || !form.nombre.trim()}
            style={{
              gridColumn: '1 / -1', padding: '10px', borderRadius: '8px',
              border: 'none',
              background: enviando || !form.nombre.trim() ? '#94a3b8' : '#2563eb',
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