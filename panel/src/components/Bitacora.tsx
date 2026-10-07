import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Entrada {
  id_entrada: number;
  descripcion: string;
  timestamp_registro: string;
  nombre_encargado: string;
  estado: string;
}

export const Bitacora = ({ id_turno }: { id_turno: number }) => {
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [nueva, setNueva] = useState('');
  const [enviando, setEnviando] = useState(false);
  const { encargado } = useAuth();

  const cargarEntradas = async () => {
    try {
      const response = await api.get(`/api/bitacora/turno/${id_turno}`);
      setEntradas(response.data);
    } catch (error) {
      console.error('Error cargando bitácora:', error);
    }
  };

  useEffect(() => {
    cargarEntradas();
  }, [id_turno]);

  const handleAgregar = async () => {
    if (!nueva.trim() || !encargado) return;
    setEnviando(true);
    try {
      await api.post('/api/bitacora', { descripcion: nueva });
      setNueva('');
      await cargarEntradas();
    } catch (error) {
      console.error('Error agregando entrada:', error);
    } finally {
      setEnviando(false);
    }
  };

  const handleEliminar = async (id: number) => {
    try {
      await api.delete(`/api/bitacora/${id}`);
      await cargarEntradas();
    } catch (error) {
      console.error('Error eliminando entrada:', error);
    }
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleTimeString('es-CO', {
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div>
      <h3 style={{ marginTop: 0, color: '#1e293b' }}>Bitácora del turno</h3>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Nueva entrada en bitácora..."
          value={nueva}
          onChange={e => setNueva(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAgregar()}
          style={{
            flex: 1, padding: '10px 14px', fontSize: '14px',
            borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none'
          }}
        />
        <button
          onClick={handleAgregar}
          disabled={enviando || !nueva.trim()}
          style={{
            padding: '10px 20px', borderRadius: '8px', border: 'none',
            background: enviando || !nueva.trim() ? '#94a3b8' : '#2563eb',
            color: 'white', cursor: enviando ? 'default' : 'pointer',
            fontSize: '14px', fontWeight: 'bold'
          }}
        >
          Agregar
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {entradas.map(e => (
          <div key={e.id_entrada} style={{
            display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between', padding: '12px 16px',
            background: '#f8fafc', borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <div>
              <p style={{ margin: 0, color: '#1e293b', fontSize: '14px' }}>
                {e.descripcion}
              </p>
              <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '12px' }}>
                {e.nombre_encargado} · {formatFecha(e.timestamp_registro)}
              </p>
            </div>
            <button
              onClick={() => handleEliminar(e.id_entrada)}
              style={{
                padding: '4px 10px', borderRadius: '6px',
                border: '1px solid #fecaca', background: 'white',
                color: '#dc2626', cursor: 'pointer', fontSize: '12px',
                marginLeft: '12px', flexShrink: 0
              }}
            >
              Eliminar
            </button>
          </div>
        ))}
        {entradas.length === 0 && (
          <p style={{ color: '#94a3b8', textAlign: 'center', fontSize: '14px' }}>
            No hay entradas en la bitácora
          </p>
        )}
      </div>
    </div>
  );
};