import { useState } from 'react';
import { reportarNovedad } from '../services/sesionService';

type Props = {
  id_equipo: number;
  onCerrar: () => void;
}

export const NovedadModal = ({ id_equipo, onCerrar }: Props) => {
  const [descripcion, setDescripcion] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const handleEnviar = async () => {
    if (!descripcion.trim()) return;
    setEnviando(true);
    const resultado = await reportarNovedad(id_equipo, descripcion);
    if (resultado.exito) {
      setMensaje('Novedad reportada correctamente');
      setTimeout(onCerrar, 2000);
    } else {
      setMensaje(resultado.mensaje || 'Error al reportar');
      setEnviando(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100
    }}>
      <div style={{
        background: 'white', borderRadius: '12px',
        padding: '32px', width: '400px'
      }}>
        <h2 style={{ marginTop: 0 }}>Reportar novedad</h2>
        {mensaje ? (
          <p style={{ color: '#166534' }}>{mensaje}</p>
        ) : (
          <>
            <textarea
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              placeholder="Describe el problema del equipo..."
              rows={4}
              style={{
                width: '100%', padding: '12px',
                borderRadius: '8px', border: '1px solid #ccc',
                fontSize: '16px', resize: 'none',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button
                onClick={onCerrar}
                style={{
                  flex: 1, padding: '12px',
                  borderRadius: '8px', border: '1px solid #ccc',
                  background: '#f0f0f0', cursor: 'pointer', fontSize: '16px'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleEnviar}
                disabled={enviando || !descripcion.trim()}
                style={{
                  flex: 1, padding: '12px',
                  borderRadius: '8px', border: 'none',
                  background: enviando || !descripcion.trim() ? '#ccc' : '#dc2626',
                  color: 'white', cursor: enviando ? 'default' : 'pointer',
                  fontSize: '16px'
                }}
              >
                {enviando ? 'Enviando...' : 'Reportar'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};