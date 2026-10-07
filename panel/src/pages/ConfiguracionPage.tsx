import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { api } from '../services/api';

interface Configuracion {
  id_configuracion: number;
  clave: string;
  valor: string;
  descripcion: string;
}

interface Equipo {
  id_equipo: number;
  numero_equipo: number;
  estado: string;
  descripcion: string;
}

export const ConfiguracionPage = () => {
  const [pestana, setPestana] = useState<'sistema' | 'equipos'>('sistema');
  const [configuraciones, setConfiguraciones] = useState<Configuracion[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [guardando, setGuardando] = useState<string | null>(null);
  const [valores, setValores] = useState<Record<string, string>>({});
  const [nuevoEquipo, setNuevoEquipo] = useState({ numero_equipo: '', descripcion: '' });
  const [agregando, setAgregando] = useState(false);

  const cargarConfiguraciones = async () => {
    try {
      const response = await api.get('/api/configuracion');
      setConfiguraciones(response.data);
      const vals: Record<string, string> = {};
      response.data.forEach((c: Configuracion) => {
        vals[c.clave] = c.valor;
      });
      setValores(vals);
    } catch (error) {
      console.error('Error cargando configuraciones:', error);
    }
  };

  const cargarEquipos = async () => {
    try {
      const response = await api.get('/api/equipos');
      setEquipos(response.data);
    } catch (error) {
      console.error('Error cargando equipos:', error);
    }
  };

  useEffect(() => {
    cargarConfiguraciones();
    cargarEquipos();
  }, []);

  const handleGuardarConfig = async (clave: string) => {
    setGuardando(clave);
    try {
      await api.patch(`/api/configuracion/${clave}`, { valor: valores[clave] });
    } catch (error) {
      console.error('Error guardando configuración:', error);
    } finally {
      setGuardando(null);
    }
  };

  const handleActualizarEquipo = async (id: number, estado: string) => {
    try {
      await api.patch(`/api/equipos/${id}`, { estado });
      await cargarEquipos();
    } catch (error) {
      console.error('Error actualizando equipo:', error);
    }
  };

  const handleAgregarEquipo = async () => {
    if (!nuevoEquipo.numero_equipo) return;
    setAgregando(true);
    try {
      await api.post('/api/equipos', {
        numero_equipo: Number(nuevoEquipo.numero_equipo),
        descripcion: nuevoEquipo.descripcion
      });
      setNuevoEquipo({ numero_equipo: '', descripcion: '' });
      await cargarEquipos();
    } catch (error: any) {
      alert(error.response?.data?.mensaje || 'Error al agregar equipo');
    } finally {
      setAgregando(false);
    }
  };

  const etiquetas: Record<string, string> = {
    terminal_activa: 'Terminal activa',
    gestor_sesiones_activo: 'Gestor de sesiones activo',
    tiempo_inactividad_minutos: 'Tiempo de inactividad (minutos)',
    intervalo_heartbeat_segundos: 'Intervalo de heartbeat (segundos)'
  };

  const estadosEquipo = ['disponible', 'fuera_de_servicio'];

  return (
    <Layout>
      <div style={{ padding: '24px', maxWidth: '900px' }}>
        <h2 style={{ marginTop: 0, color: '#1e293b' }}>Configuración</h2>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {(['sistema', 'equipos'] as const).map(p => (
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
              {p === 'sistema' ? 'Parámetros del sistema' : 'Equipos'}
            </button>
          ))}
        </div>

        {pestana === 'sistema' ? (
          <div style={{
            background: 'white', borderRadius: '12px', padding: '24px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
          }}>
            <h3 style={{ marginTop: 0, color: '#1e293b' }}>Parámetros del sistema</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {configuraciones.map(c => (
                <div key={c.clave} style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', gap: '16px',
                  padding: '16px', borderRadius: '8px',
                  background: '#f8fafc', border: '1px solid #e2e8f0'
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#1e293b', fontSize: '14px' }}>
                      {etiquetas[c.clave] || c.clave}
                    </p>
                    {c.descripcion && (
                      <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: '12px' }}>
                        {c.descripcion}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {c.valor === 'true' || c.valor === 'false' ? (
                      <select
                        value={valores[c.clave] || c.valor}
                        onChange={e => setValores(v => ({ ...v, [c.clave]: e.target.value }))}
                        style={{
                          padding: '8px 12px', borderRadius: '6px',
                          border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none'
                        }}
                      >
                        <option value="true">Activado</option>
                        <option value="false">Desactivado</option>
                      </select>
                    ) : (
                      <input
                        type="number"
                        value={valores[c.clave] || c.valor}
                        onChange={e => setValores(v => ({ ...v, [c.clave]: e.target.value }))}
                        style={{
                          padding: '8px 12px', borderRadius: '6px',
                          border: '1px solid #e2e8f0', fontSize: '14px',
                          width: '80px', outline: 'none', textAlign: 'center'
                        }}
                      />
                    )}
                    <button
                      onClick={() => handleGuardarConfig(c.clave)}
                      disabled={guardando === c.clave}
                      style={{
                        padding: '8px 16px', borderRadius: '6px', border: 'none',
                        background: guardando === c.clave ? '#94a3b8' : '#2563eb',
                        color: 'white', cursor: guardando === c.clave ? 'default' : 'pointer',
                        fontSize: '13px', fontWeight: 'bold'
                      }}
                    >
                      {guardando === c.clave ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{
              background: 'white', borderRadius: '12px', padding: '24px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
            }}>
              <h3 style={{ marginTop: 0, color: '#1e293b' }}>Agregar equipo</h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="number"
                  placeholder="Número de equipo"
                  value={nuevoEquipo.numero_equipo}
                  onChange={e => setNuevoEquipo(v => ({ ...v, numero_equipo: e.target.value }))}
                  style={{
                    padding: '10px 14px', fontSize: '14px',
                    borderRadius: '8px', border: '1px solid #e2e8f0',
                    outline: 'none', width: '160px'
                  }}
                />
                <input
                  type="text"
                  placeholder="Descripción (opcional)"
                  value={nuevoEquipo.descripcion}
                  onChange={e => setNuevoEquipo(v => ({ ...v, descripcion: e.target.value }))}
                  style={{
                    padding: '10px 14px', fontSize: '14px',
                    borderRadius: '8px', border: '1px solid #e2e8f0',
                    outline: 'none', flex: 1
                  }}
                />
                <button
                  onClick={handleAgregarEquipo}
                  disabled={agregando || !nuevoEquipo.numero_equipo}
                  style={{
                    padding: '10px 20px', borderRadius: '8px', border: 'none',
                    background: agregando || !nuevoEquipo.numero_equipo ? '#94a3b8' : '#2563eb',
                    color: 'white', cursor: agregando ? 'default' : 'pointer',
                    fontWeight: 'bold', fontSize: '14px'
                  }}
                >
                  {agregando ? 'Agregando...' : 'Agregar'}
                </button>
              </div>
            </div>

            <div style={{
              background: 'white', borderRadius: '12px', padding: '24px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
            }}>
              <h3 style={{ marginTop: 0, color: '#1e293b' }}>
                Equipos registrados ({equipos.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {equipos.map(e => (
                  <div key={e.id_equipo} style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', padding: '12px 16px',
                    borderRadius: '8px', border: '1px solid #e2e8f0',
                    background: '#f8fafc'
                  }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 'bold', color: '#1e293b' }}>
                        PC {e.numero_equipo}
                      </p>
                      {e.descripcion && (
                        <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: '12px' }}>
                          {e.descripcion}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{
                        padding: '2px 10px', borderRadius: '12px', fontSize: '12px',
                        background: e.estado === 'disponible' ? '#dcfce7' : e.estado === 'en_uso' ? '#fef9c3' : '#fee2e2',
                        color: e.estado === 'disponible' ? '#166534' : e.estado === 'en_uso' ? '#92400e' : '#991b1b'
                      }}>
                        {e.estado.replace('_', ' ')}
                      </span>
                      <select
                        value={e.estado}
                        onChange={ev => handleActualizarEquipo(e.id_equipo, ev.target.value)}
                        style={{
                          padding: '6px 10px', borderRadius: '6px',
                          border: '1px solid #e2e8f0', fontSize: '13px', outline: 'none'
                        }}
                      >
                        {estadosEquipo.map(s => (
                          <option key={s} value={s}>{s.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
                {equipos.length === 0 && (
                  <p style={{ color: '#94a3b8', textAlign: 'center' }}>
                    No hay equipos registrados
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};