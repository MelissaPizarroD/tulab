import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { RegistroVisitante } from '../components/RegistroVisitante';
import { ProgramacionRecursos } from '../components/ProgramacionRecursos';
import { Bitacora } from '../components/Bitacora';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Turno {
  id_turno: number;
  hora_apertura: string;
  estado: string;
}

export const TurnoPage = () => {
  const [turno, setTurno] = useState<Turno | null>(null);
  const [cargando, setCargando] = useState(true);
  const [abriendo, setAbriendo] = useState(false);
  const { encargado } = useAuth();

  const cargarTurno = async () => {
    try {
      const response = await api.get('/api/turnos/activo');
      setTurno(response.data);
    } catch {
      setTurno(null);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarTurno();
  }, []);

  const handleAbrirTurno = async () => {
    if (!encargado) return;
    setAbriendo(true);
    try {
      await api.post('/api/turnos', {
        id_encargado_apertura: encargado.id_encargado,
        observaciones_apertura: ''
      });
      await cargarTurno();
    } catch (error: any) {
      alert(error.response?.data?.mensaje || 'Error al abrir turno');
    } finally {
      setAbriendo(false);
    }
  };

  const handleCerrarTurno = async () => {
    if (!turno || !encargado) return;
    if (!confirm('¿Estás segura de cerrar el turno? Se cerrarán todas las sesiones activas.')) return;
    try {
      await api.patch(`/api/turnos/${turno.id_turno}/cerrar`, {
        id_encargado_cierre: encargado.id_encargado,
        observaciones_cierre: ''
      });
      await cargarTurno();
    } catch (error: any) {
      alert(error.response?.data?.mensaje || 'Error al cerrar turno');
    }
  };

  if (cargando) return <Layout><div style={{ padding: '24px' }}>Cargando...</div></Layout>;

  return (
    <Layout>
      <div style={{ padding: '24px', maxWidth: '900px' }}>
        <h2 style={{ marginTop: 0, color: '#1e293b' }}>Gestión de turno</h2>

        <div style={{
          background: 'white', borderRadius: '12px', padding: '20px 24px',
          marginBottom: '24px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
        }}>
          {turno ? (
            <>
              <div>
                <span style={{
                  display: 'inline-block', padding: '4px 12px',
                  borderRadius: '20px', background: '#dcfce7',
                  color: '#166534', fontSize: '14px', fontWeight: 'bold',
                  marginBottom: '4px'
                }}>
                  Turno activo
                </span>
                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                  Apertura: {new Date(`1970-01-01T${turno.hora_apertura}`).toLocaleTimeString('es-CO', {
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
              <button
                onClick={handleCerrarTurno}
                style={{
                  padding: '10px 24px', borderRadius: '8px',
                  border: 'none', background: '#dc2626',
                  color: 'white', cursor: 'pointer',
                  fontWeight: 'bold', fontSize: '14px'
                }}
              >
                Cerrar turno
              </button>
            </>
          ) : (
            <>
              <span style={{
                display: 'inline-block', padding: '4px 12px',
                borderRadius: '20px', background: '#fee2e2',
                color: '#991b1b', fontSize: '14px', fontWeight: 'bold'
              }}>
                Sin turno activo
              </span>
              <button
                onClick={handleAbrirTurno}
                disabled={abriendo}
                style={{
                  padding: '10px 24px', borderRadius: '8px',
                  border: 'none', background: abriendo ? '#94a3b8' : '#2563eb',
                  color: 'white', cursor: abriendo ? 'default' : 'pointer',
                  fontWeight: 'bold', fontSize: '14px'
                }}
              >
                {abriendo ? 'Abriendo...' : 'Abrir turno'}
              </button>
            </>
          )}
        </div>

        {turno ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{
              background: 'white', borderRadius: '12px', padding: '24px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
            }}>
              <RegistroVisitante />
            </div>
            <div style={{
              background: 'white', borderRadius: '12px', padding: '24px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
            }}>
              <ProgramacionRecursos id_turno={turno.id_turno} />
            </div>
            <div style={{
              background: 'white', borderRadius: '12px', padding: '24px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
            }}>
              <Bitacora id_turno={turno.id_turno} />
            </div>
          </div>
        ) : (
          <div style={{
            background: 'white', borderRadius: '12px', padding: '48px',
            textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
          }}>
            <p style={{ color: '#94a3b8' }}>Abre un turno para gestionar visitantes, recursos y bitácora</p>
          </div>
        )}
      </div>
    </Layout>
  );
};