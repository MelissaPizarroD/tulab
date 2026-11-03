import { useState } from 'react';
import { Layout } from '../components/Layout';
import { api } from '../services/api';
import { DetallePersonaModal } from '../components/DetallePersonaModal';
import { exportarRegistrosExcel, exportarTurnosExcel, exportarResumenHTML } from '../services/exportService';

interface RegistroHistorico {
  id_registro: number;
  codigo_estudiantil: string | null;
  nombre_estudiante: string | null;
  nombre_visitante: string | null;
  codigo_temporal: string | null;
  hora_entrada: string;
  hora_salida: string | null;
  origen_registro: string;
  estado: string;
  id_turno: number;
  programa_academico: string | null;
  semestre: number | null;
  correo_institucional: string | null;
  telefono_contacto: string | null;
  motivo_visita: string | null;
  email: string | null;
  telefono: string | null;
  institucion: string | null;
  timestamp_expiracion: string | null;
  id_visitante: number | null;
}

interface Turno {
  id_turno: number;
  fecha_apertura: string;
  hora_apertura: string;
  hora_cierre: string | null;
  estado: string;
  observaciones_apertura: string;
  observaciones_cierre: string | null;
  nombre_encargado_apertura: string;
  nombre_encargado_cierre: string | null;
}

export const HistoricosPage = () => {
  const [pestana, setPestana] = useState<'registros' | 'turnos'>('registros');
  const [fecha, setFecha] = useState('');
  const [codigo, setCodigo] = useState('');
  const [registros, setRegistros] = useState<RegistroHistorico[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [seleccionado, setSeleccionado] = useState<RegistroHistorico | null>(null);

  const buscarRegistros = async () => {
    setBuscando(true);
    try {
      const params = new URLSearchParams();
      if (fecha) params.append('fecha', fecha);
      if (codigo) params.append('codigo', codigo);
      const response = await api.get(`/api/registros-acceso/historico?${params}`);
      setRegistros(response.data);
    } catch (error) {
      console.error('Error buscando registros:', error);
    } finally {
      setBuscando(false);
    }
  };

  const buscarTurnos = async () => {
    setBuscando(true);
    try {
      const params = new URLSearchParams();
      if (fecha) params.append('fecha', fecha);
      const response = await api.get(`/api/turnos/historico?${params}`);
      setTurnos(response.data);
    } catch (error) {
      console.error('Error buscando turnos:', error);
    } finally {
      setBuscando(false);
    }
  };

  const handleBuscar = () => {
    if (pestana === 'registros') buscarRegistros();
    else buscarTurnos();
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  const formatHora = (hora: string) => {
    return new Date(hora).toLocaleTimeString('es-CO', {
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getPersonaModal = (r: RegistroHistorico) => {
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
    <Layout>
      <div style={{ padding: '24px', maxWidth: '1000px' }}>
        <h2 style={{ marginTop: 0, color: '#1e293b' }}>Históricos</h2>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {(['registros', 'turnos'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPestana(p)}
              style={{
                padding: '8px 20px', borderRadius: '8px', border: 'none',
                background: pestana === p ? '#2563eb' : '#e2e8f0',
                color: pestana === p ? 'white' : '#475569',
                cursor: 'pointer', fontWeight: 'bold', fontSize: '14px'
              }}
            >
              {p === 'registros' ? 'Registros de acceso' : 'Turnos'}
            </button>
          ))}
        </div>

        <div style={{
          background: 'white', borderRadius: '12px', padding: '20px',
          marginBottom: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap'
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
              Fecha
            </label>
            <input
              type="date"
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              style={{
                padding: '10px 14px', fontSize: '14px',
                borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none'
              }}
            />
          </div>
          {pestana === 'registros' && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
                Código estudiantil
              </label>
              <input
                type="text"
                placeholder="Ej: 2020101001"
                value={codigo}
                onChange={e => setCodigo(e.target.value)}
                style={{
                  padding: '10px 14px', fontSize: '14px',
                  borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none'
                }}
              />
            </div>
          )}
          <button
            onClick={handleBuscar}
            disabled={buscando}
            style={{
              padding: '10px 24px', borderRadius: '8px', border: 'none',
              background: buscando ? '#94a3b8' : '#2563eb',
              color: 'white', cursor: buscando ? 'default' : 'pointer',
              fontWeight: 'bold', fontSize: '14px'
            }}
          >
            {buscando ? 'Buscando...' : 'Buscar'}
          </button>

          {registros.length > 0 && pestana === 'registros' && (
            <>
              <button
                onClick={() => exportarRegistrosExcel(registros, `registros_${fecha || 'todos'}`)}
                style={{
                  padding: '10px 20px', borderRadius: '8px', border: 'none',
                  background: '#166534', color: 'white', cursor: 'pointer',
                  fontWeight: 'bold', fontSize: '14px'
                }}
              >
                Exportar Excel
              </button>
              <button
                onClick={() => exportarResumenHTML(registros, turnos[0])}
                style={{
                  padding: '10px 20px', borderRadius: '8px', border: 'none',
                  background: '#1d4ed8', color: 'white', cursor: 'pointer',
                  fontWeight: 'bold', fontSize: '14px'
                }}
              >
                Imprimir PDF
              </button>
            </>
          )}
          {turnos.length > 0 && pestana === 'turnos' && (
            <button
              onClick={() => exportarTurnosExcel(turnos, `turnos_${fecha || 'todos'}`)}
              style={{
                padding: '10px 20px', borderRadius: '8px', border: 'none',
                background: '#166534', color: 'white', cursor: 'pointer',
                fontWeight: 'bold', fontSize: '14px'
              }}
            >
              Exportar Excel
            </button>
          )}
        </div>

        <div style={{
          background: 'white', borderRadius: '12px', padding: '24px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
        }}>
          {pestana === 'registros' ? (
            <>
              <h3 style={{ marginTop: 0, color: '#1e293b' }}>
                Registros de acceso {registros.length > 0 && `(${registros.length})`}
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left', color: '#64748b' }}>Código</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', color: '#64748b' }}>Nombre</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', color: '#64748b' }}>Fecha</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', color: '#64748b' }}>Entrada</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', color: '#64748b' }}>Salida</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', color: '#64748b' }}>Estado</th>
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
                          {formatFecha(r.hora_entrada)}
                        </td>
                        <td style={{ padding: '10px 12px', color: '#64748b' }}>
                          {formatHora(r.hora_entrada)}
                        </td>
                        <td style={{ padding: '10px 12px', color: '#64748b' }}>
                          {r.hora_salida ? formatHora(r.hora_salida) : '-'}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{
                            padding: '2px 8px', borderRadius: '12px', fontSize: '12px',
                            background: r.estado === 'activo' ? '#dcfce7' : '#f1f5f9',
                            color: r.estado === 'activo' ? '#166534' : '#64748b'
                          }}>
                            {r.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {registros.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                          Usa los filtros para buscar registros
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              <h3 style={{ marginTop: 0, color: '#1e293b' }}>
                Turnos {turnos.length > 0 && `(${turnos.length})`}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {turnos.map(t => (
                  <div key={t.id_turno} style={{
                    padding: '16px', borderRadius: '8px',
                    border: '1px solid #e2e8f0', background: '#f8fafc'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 'bold', color: '#1e293b' }}>
                          Turno #{t.id_turno} · {formatFecha(t.fecha_apertura)}
                        </p>
                        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>
                          {t.hora_apertura?.slice(0, 5)} - {t.hora_cierre?.slice(0, 5) || 'En curso'}
                        </p>
                        <p style={{ margin: '4px 0 0', color: '#475569', fontSize: '13px' }}>
                          Abrió: {t.nombre_encargado_apertura}
                          {t.nombre_encargado_cierre && ` · Cerró: ${t.nombre_encargado_cierre}`}
                        </p>
                        {t.observaciones_apertura && (
                          <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '12px' }}>
                            {t.observaciones_apertura}
                          </p>
                        )}
                      </div>
                      <span style={{
                        padding: '4px 12px', borderRadius: '20px', fontSize: '13px',
                        background: t.estado === 'activo' ? '#dcfce7' : '#f1f5f9',
                        color: t.estado === 'activo' ? '#166534' : '#64748b',
                        fontWeight: 'bold'
                      }}>
                        {t.estado}
                      </span>
                    </div>
                  </div>
                ))}
                {turnos.length === 0 && (
                  <p style={{ color: '#94a3b8', textAlign: 'center' }}>
                    Usa los filtros para buscar turnos
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {seleccionado && (
        <DetallePersonaModal
          persona={getPersonaModal(seleccionado)}
          onCerrar={() => setSeleccionado(null)}
        />
      )}
    </Layout>
  );
};