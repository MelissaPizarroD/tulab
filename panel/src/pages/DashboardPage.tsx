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