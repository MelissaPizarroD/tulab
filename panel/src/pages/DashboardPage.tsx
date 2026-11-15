import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ResumenLaboratorio } from '../components/dashboard/ResumenLaboratorio';
import { PersonasLaboratorio } from '../components/dashboard/PersonasLaboratorio';
import { MapaEquipos } from '../components/dashboard/MapaEquipos';
import { NovedadesTurno } from '../components/dashboard/NovedadesTurno';
import { useEstadoLaboratorio } from '../hooks/useEstadoLaboratorio';
import { useAhora } from '../hooks/useAhora';
import { duracion } from '../utils/formato';
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

  useEffect(() => {
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
    cargarTurno();
  }, []);

  if (cargando) {
    return (
      <Layout>
        <div className="pagina">
          <p className="vacio">Cargando...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pagina">
        {turno ? <PanelTurno turno={turno} /> : <SinTurno />}
      </div>
    </Layout>
  );
};

const SinTurno = () => {
  const navigate = useNavigate();
  return (
    <>
      <header className="pagina__encabezado">
        <h1 className="pagina__titulo">Estado del laboratorio</h1>
      </header>
      <section className="tarjeta tarjeta--centro">
        <p className="vacio">No hay un turno activo.</p>
        <button type="button" className="boton-primario" onClick={() => navigate('/turno')}>
          Ir a Gestión de turno
        </button>
      </section>
    </>
  );
};

const PanelTurno = ({ turno }: { turno: Turno }) => {
  const { personas, equipos, novedades, cargando, error, enVivo, actualizado, recargar } =
    useEstadoLaboratorio(turno.id_turno);
  const [abierto, setAbierto] = useState<number | null>(null);
  const ahora = useAhora();

  // fecha y hora de apertura juntas, para calcular cuánto lleva el turno
  const apertura = `${turno.fecha_apertura.slice(0, 10)}T${turno.hora_apertura}`;
  const aperturaValida = !isNaN(new Date(apertura).getTime());

  return (
    <>
      <header className="pagina__encabezado">
        <div>
          <h1 className="pagina__titulo">Estado del laboratorio</h1>
          <p className="pagina__subtitulo">
            <span className="insignia insignia--activa">Turno activo</span>
            {turno.nombre_encargado_apertura} · desde las {turno.hora_apertura?.slice(0, 5)}
            {aperturaValida && ` (${duracion(apertura, ahora)})`}
          </p>
        </div>

        <div className="en-vivo">
          <span className={`en-vivo__estado ${enVivo ? '' : 'en-vivo__estado--caido'}`}>
            <span className="en-vivo__punto" />
            {enVivo ? 'En vivo' : 'Sin conexión en tiempo real'}
          </span>
          {actualizado && (
            <span className="en-vivo__hora">
              Actualizado {actualizado.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
        </div>
      </header>

      {error && (
        <div className="aviso-error" role="alert">
          No se pudo cargar la información del laboratorio.
          <button type="button" onClick={recargar}>Reintentar</button>
        </div>
      )}

      {cargando ? (
        <p className="vacio">Cargando información del turno...</p>
      ) : (
        <>
          <ResumenLaboratorio personas={personas} equipos={equipos} novedades={novedades} />

          <div className="rejilla">
            <PersonasLaboratorio personas={personas} abierto={abierto} onAbrir={setAbierto} />
            <div className="columna-lateral">
              <MapaEquipos equipos={equipos} onSeleccionarRegistro={setAbierto} />
              <NovedadesTurno novedades={novedades} />
            </div>
          </div>
        </>
      )}
    </>
  );
};