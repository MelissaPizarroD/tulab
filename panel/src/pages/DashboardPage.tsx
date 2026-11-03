import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { EstadoLaboratorio } from '../components/EstadoLaboratorio';
import { RegistrosAcceso } from '../components/RegistrosAcceso';
import { Novedades } from '../components/Novedades';
import { api } from '../services/api';

interface Turno {
  id_turno: number;
  fecha_apertura: string;
  hora_apertura: string;
  estado: string;
  nombre_encargado_apertura: string;
}

export const DashboardPage = () => {
  const [turno, setTurno] = useState<Turno | null>(null);
  const [cargando, setCargando] = useState(true);

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

  if (cargando) return <Layout><div style={{ padding: '24px' }}>Cargando...</div></Layout>;

  return (
    <Layout>
      <div style={{ padding: '24px', maxWidth: '1200px' }}>
        <h2 style={{ marginTop: 0, color: '#1e293b' }}>Dashboard</h2>

        {turno ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{
              background: 'white', borderRadius: '12px', padding: '20px 24px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{
                  padding: '4px 12px', borderRadius: '20px',
                  background: '#dcfce7', color: '#166534',
                  fontSize: '13px', fontWeight: 'bold'
                }}>
                  Turno activo
                </span>
                <div>
                  <p style={{ margin: 0, fontWeight: 'bold', color: '#1e293b', fontSize: '15px' }}>
                    {turno.nombre_encargado_apertura}
                  </p>
                  <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '13px' }}>
                    {new Date(turno.fecha_apertura).toLocaleDateString('es-CO', {
                      day: '2-digit', month: '2-digit', year: 'numeric'
                    })} · desde las {turno.hora_apertura?.slice(0, 5)}
                  </p>
                </div>
              </div>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>
                Turno #{turno.id_turno}
              </p>
            </div>

            <div style={{
              background: 'white', borderRadius: '12px', padding: '24px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
            }}>
              <EstadoLaboratorio id_turno={turno.id_turno} />
            </div>
            <div style={{
              background: 'white', borderRadius: '12px', padding: '24px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
            }}>
              <RegistrosAcceso id_turno={turno.id_turno} />
            </div>
            <div style={{
              background: 'white', borderRadius: '12px', padding: '24px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
            }}>
              <Novedades id_turno={turno.id_turno} />
            </div>
          </div>
        ) : (
          <div style={{
            background: 'white', borderRadius: '12px', padding: '48px',
            textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
          }}>
            <p style={{ color: '#94a3b8', fontSize: '16px' }}>
              No hay turno activo. Ve a <strong>Gestión de turno</strong> para abrir uno.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};