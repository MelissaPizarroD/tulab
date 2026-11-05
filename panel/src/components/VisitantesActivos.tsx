import { useState, useEffect } from 'react';
import { Countdown } from './Countdown';
import { api, socket } from '../services/api';

interface Visitante {
  id_visitante: number;
  nombre: string;
  codigo_temporal: string;
  timestamp_expiracion: string;
  email: string | null;
  telefono: string | null;
  institucion: string | null;
  motivo_visita: string | null;
  ha_ingresado: boolean;
}

export const VisitantesActivos = ({ id_turno }: { id_turno: number }) => {
  const [visitantes, setVisitantes] = useState<Visitante[]>([]);
  const [nuevaHora, setNuevaHora] = useState<Record<number, string>>({});

  const cargarVisitantes = async () => {
    try {
      const response = await api.get('/api/visitantes/vigentes');
      setVisitantes(response.data);
    } catch (error) {
      console.error('Error cargando visitantes:', error);
    }
  };

    useEffect(() => {
    cargarVisitantes();

    const handler = () => cargarVisitantes();
    socket.on('visitante_actualizado', handler);
    socket.on('entrada_registrada', handler);
    socket.on('salida_registrada', handler);

    const intervalo = setInterval(cargarVisitantes, 30000);

    return () => {
        socket.off('visitante_actualizado', handler);
        socket.off('entrada_registrada', handler);
        socket.off('salida_registrada', handler);
        clearInterval(intervalo);
    };
    }, [id_turno]);

  const handleCambiarExpiracion = async (id_visitante: number) => {
    const hora = nuevaHora[id_visitante];
    if (!hora) return;
    const hoy = new Date().toLocaleDateString('en-CA');
    const nuevaExpiracion = new Date(`${hoy}T${hora}:00`);
    try {
      await api.patch(`/api/visitantes/${id_visitante}/expiracion`, {
        timestamp_expiracion: nuevaExpiracion.toISOString()
      });
      await cargarVisitantes();
      setNuevaHora(h => ({ ...h, [id_visitante]: '' }));
    } catch (error: any) {
      alert(error.response?.data?.mensaje || 'Error al actualizar expiración');
    }
  };

  if (visitantes.length === 0) return null;

  return (
    <div>
      <h3 style={{ marginTop: 0, color: '#1e293b' }}>
        Visitantes activos ({visitantes.length})
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {visitantes.map(v => (
          <div key={v.id_visitante} style={{
            padding: '16px', borderRadius: '8px',
            border: '1px solid #e2e8f0', background: '#f8fafc'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#1e293b' }}>
                  {v.nombre}
                  <span style={{
                    marginLeft: '8px', padding: '2px 8px', borderRadius: '12px', fontSize: '11px',
                    background: v.ha_ingresado ? '#dcfce7' : '#fef9c3',
                    color: v.ha_ingresado ? '#166534' : '#92400e'
                    }}>
                    {v.ha_ingresado ? 'Ya ingresó' : 'Aún no ingresa'}
                </span>
                </p>
                {v.institucion && (
                  <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '13px' }}>
                    {v.institucion}
                  </p>
                )}
                <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    padding: '2px 10px', borderRadius: '12px',
                    background: '#dbeafe', color: '#1d4ed8',
                    fontSize: '16px', fontWeight: 'bold', letterSpacing: '4px'
                  }}>
                    {v.codigo_temporal}
                  </span>
                  <Countdown timestamp_expiracion={v.timestamp_expiracion} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="time"
                  value={nuevaHora[v.id_visitante] || ''}
                  onChange={e => setNuevaHora(h => ({ ...h, [v.id_visitante]: e.target.value }))}
                  style={{
                    padding: '6px 10px', borderRadius: '6px',
                    border: '1px solid #e2e8f0', fontSize: '13px', outline: 'none'
                  }}
                />
                <button
                  onClick={() => handleCambiarExpiracion(v.id_visitante)}
                  disabled={!nuevaHora[v.id_visitante]}
                  style={{
                    padding: '6px 14px', borderRadius: '6px', border: 'none',
                    background: !nuevaHora[v.id_visitante] ? '#94a3b8' : '#f59e0b',
                    color: 'white', cursor: !nuevaHora[v.id_visitante] ? 'default' : 'pointer',
                    fontSize: '13px', fontWeight: 'bold'
                  }}
                >
                  Cambiar expiración
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};