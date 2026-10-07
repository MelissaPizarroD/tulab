import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { socket } from '../services/api';
import { DetallePersonaModal } from './DetallePersonaModal';

interface Registro {
  id_registro: number;
  codigo_estudiantil: string | null;
  nombre_estudiante: string | null;
  nombre_visitante: string | null;
  codigo_temporal: string | null;
  hora_entrada: string;
  hora_salida: string | null;
  estado: string;
  origen_registro: string;
  programa_academico: string | null;
  semestre: number | null;
  correo_institucional: string | null;
  telefono_contacto: string | null;
  motivo_visita: string | null;
  email: string | null;
  telefono: string | null;
  institucion: string | null;
  timestamp_expiracion: string | null;
}

export const RegistrosAcceso = ({ id_turno }: { id_turno: number }) => {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [seleccionado, setSeleccionado] = useState<Registro | null>(null);

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

  const getPersonaModal = (r: Registro) => {
    if (r.codigo_estudiantil) {
      return {
        tipo: 'estudiante' as const,
        codigo_estudiantil: r.codigo_estudiantil,
        nombre: r.nombre_estudiante || '',
        programa_academico: r.programa_academico || '',
        semestre: r.semestre || 0,
        correo_institucional: r.correo_institucional || '',
        telefono_contacto: r.telefono_contacto
      };
    }
    return {
      tipo: 'visitante' as const,
      nombre: r.nombre_visitante || 'Visitante',
      codigo_temporal: r.codigo_temporal || '',
      email: r.email,
      telefono: r.telefono,
      institucion: r.institucion,
      motivo_visita: r.motivo_visita,
      timestamp_expiracion: r.timestamp_expiracion || ''
    };
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
                <td style={{ padding: '10px 12px', color: '#1e293b' }}>
                  {r.codigo_estudiantil || r.codigo_temporal || '-'}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <button
                    onClick={() => setSeleccionado(r)}
                    style={{
                      background: 'none', border: 'none',
                      color: '#2563eb', cursor: 'pointer',
                      fontSize: '14px', padding: 0,
                      textDecoration: 'underline'
                    }}
                  >
                    {r.nombre_estudiante || r.nombre_visitante || 'Visitante'}
                  </button>
                </td>
                <td style={{ padding: '10px 12px', color: '#64748b' }}>
                  {formatHora(r.hora_entrada)}
                </td>
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

      {seleccionado && (
        <DetallePersonaModal
          persona={getPersonaModal(seleccionado)}
          onCerrar={() => setSeleccionado(null)}
        />
      )}
    </div>
  );
};