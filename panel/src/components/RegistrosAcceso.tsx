import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { socket } from '../services/api';

interface Registro {
  id_registro: number;
  codigo_estudiantil: string;
  nombre_estudiante: string;
  hora_entrada: string;
  hora_salida: string | null;
  estado: string;
  origen_registro: string;
}

export const RegistrosAcceso = ({ id_turno }: { id_turno: number }) => {
  const [registros, setRegistros] = useState<Registro[]>([]);

  const cargarRegistros = async () => {
    try {
      const response = await api.get(`/api/registros-acceso/turno/${id_turno}`);
      setRegistros(response.data);
    } catch (error) {
      console.error('Error cargando registros:', error);
    }
  };

  useEffect(() => {
    cargarRegistros();
    socket.on('entrada_registrada', () => cargarRegistros());
    socket.on('salida_registrada', () => cargarRegistros());

    return () => {
      socket.off('entrada_registrada');
      socket.off('salida_registrada');
    };
  }, [id_turno]);

  const formatHora = (hora: string) => {
    return new Date(hora).toLocaleTimeString('es-CO', {
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div>
      <h3 style={{ marginTop: 0, color: '#1e293b' }}>
        Registros de acceso activos ({registros.length})
      </h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', color: '#64748b', fontWeight: '600' }}>Código</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', color: '#64748b', fontWeight: '600' }}>Nombre</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', color: '#64748b', fontWeight: '600' }}>Entrada</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', color: '#64748b', fontWeight: '600' }}>Origen</th>
            </tr>
          </thead>
          <tbody>
            {registros.map(r => (
              <tr key={r.id_registro} style={{ borderTop: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px 12px', color: '#1e293b' }}>{r.codigo_estudiantil}</td>
                <td style={{ padding: '10px 12px', color: '#1e293b' }}>{r.nombre_estudiante || 'Visitante'}</td>
                <td style={{ padding: '10px 12px', color: '#64748b' }}>{formatHora(r.hora_entrada)}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: '12px', fontSize: '12px',
                    background: r.origen_registro === 'terminal' ? '#dbeafe' : '#f0fdf4',
                    color: r.origen_registro === 'terminal' ? '#1d4ed8' : '#166534'
                  }}>
                    {r.origen_registro}
                  </span>
                </td>
              </tr>
            ))}
            {registros.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                  No hay registros activos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};