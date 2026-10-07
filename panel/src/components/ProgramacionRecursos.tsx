import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface Programacion {
  id_programacion: number;
  codigo_estudiantil: string;
  nombre_estudiante: string;
  tipo_recurso: string;
  descripcion_recurso: string;
  hora_estimada_disponibilidad: string;
  estado: string;
}

export const ProgramacionRecursos = ({ id_turno }: { id_turno: number }) => {
  const [programaciones, setProgramaciones] = useState<Programacion[]>([]);
  const [codigo, setCodigo] = useState('');
  const [tipoRecurso, setTipoRecurso] = useState('sala_estudio');
  const [descripcion, setDescripcion] = useState('');
  const [hora, setHora] = useState('');
  const [enviando, setEnviando] = useState(false);

  const cargarProgramaciones = async () => {
    try {
      const response = await api.get(`/api/programaciones/turno/${id_turno}`);
      setProgramaciones(response.data);
    } catch (error) {
      console.error('Error cargando programaciones:', error);
    }
  };

  useEffect(() => {
    cargarProgramaciones();
  }, [id_turno]);

  const handleAgregar = async () => {
    if (!codigo.trim()) return;
    setEnviando(true);
    try {
      await api.post('/api/programaciones', {
        codigo,
        tipo_recurso: tipoRecurso,
        descripcion_recurso: descripcion,
        hora_estimada_disponibilidad: hora || undefined
      });
      setCodigo('');
      setDescripcion('');
      setHora('');
      await cargarProgramaciones();
    } catch (error: any) {
      alert(error.response?.data?.mensaje || 'Error al programar recurso');
    } finally {
      setEnviando(false);
    }
  };

  const handleActualizarEstado = async (id: number, estado: string) => {
    try {
      await api.patch(`/api/programaciones/${id}/estado`, { estado });
      await cargarProgramaciones();
    } catch (error) {
      console.error('Error actualizando estado:', error);
    }
  };

  const coloresEstado: Record<string, string> = {
    pendiente: '#fef9c3',
    asignado: '#dcfce7',
    cancelado: '#fee2e2'
  };

  return (
    <div>
      <h3 style={{ marginTop: 0, color: '#1e293b' }}>Programación de recursos</h3>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '8px', marginBottom: '16px'
      }}>
        <input
          type="text"
          placeholder="Código estudiantil"
          value={codigo}
          onChange={e => setCodigo(e.target.value)}
          style={{
            padding: '10px 14px', fontSize: '14px',
            borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none'
          }}
        />
        <select
          value={tipoRecurso}
          onChange={e => setTipoRecurso(e.target.value)}
          style={{
            padding: '10px 14px', fontSize: '14px',
            borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none'
          }}
        >
          <option value="sala_estudio">Sala de estudio</option>
          <option value="sala_television">Sala de televisión</option>
          <option value="otro">Otro</option>
        </select>
        <input
          type="text"
          placeholder="Descripción del recurso"
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          style={{
            padding: '10px 14px', fontSize: '14px',
            borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none'
          }}
        />
        <input
          type="time"
          value={hora}
          onChange={e => setHora(e.target.value)}
          style={{
            padding: '10px 14px', fontSize: '14px',
            borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none'
          }}
        />
        <button
          onClick={handleAgregar}
          disabled={enviando || !codigo.trim()}
          style={{
            gridColumn: '1 / -1', padding: '10px', borderRadius: '8px',
            border: 'none', background: enviando || !codigo.trim() ? '#94a3b8' : '#2563eb',
            color: 'white', cursor: enviando ? 'default' : 'pointer',
            fontSize: '14px', fontWeight: 'bold'
          }}
        >
          Programar recurso
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {programaciones.map(p => (
          <div key={p.id_programacion} style={{
            padding: '12px 16px', borderRadius: '8px',
            border: '1px solid #e2e8f0',
            background: coloresEstado[p.estado] || 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#1e293b', fontSize: '14px' }}>
                  {p.nombre_estudiante || p.codigo_estudiantil}
                </p>
                <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '13px' }}>
                  {p.tipo_recurso.replace('_', ' ')} {p.descripcion_recurso && `· ${p.descripcion_recurso}`}
                  {p.hora_estimada_disponibilidad && ` · ${p.hora_estimada_disponibilidad}`}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '6px', marginLeft: '12px' }}>
                {p.estado === 'pendiente' && (
                  <>
                    <button
                      onClick={() => handleActualizarEstado(p.id_programacion, 'asignado')}
                      style={{
                        padding: '4px 10px', borderRadius: '6px',
                        border: '1px solid #bbf7d0', background: 'white',
                        color: '#166534', cursor: 'pointer', fontSize: '12px'
                      }}
                    >
                      Asignar
                    </button>
                    <button
                      onClick={() => handleActualizarEstado(p.id_programacion, 'cancelado')}
                      style={{
                        padding: '4px 10px', borderRadius: '6px',
                        border: '1px solid #fecaca', background: 'white',
                        color: '#dc2626', cursor: 'pointer', fontSize: '12px'
                      }}
                    >
                      Cancelar
                    </button>
                  </>
                )}
                {p.estado !== 'pendiente' && (
                  <span style={{
                    padding: '4px 10px', borderRadius: '6px', fontSize: '12px',
                    color: p.estado === 'asignado' ? '#166534' : '#dc2626',
                    fontWeight: 'bold'
                  }}>
                    {p.estado}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {programaciones.length === 0 && (
          <p style={{ color: '#94a3b8', textAlign: 'center', fontSize: '14px' }}>
            No hay recursos programados
          </p>
        )}
      </div>
    </div>
  );
};