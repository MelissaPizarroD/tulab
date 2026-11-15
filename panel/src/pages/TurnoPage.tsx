import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { RegistroVisitante } from '../components/RegistroVisitante';
import { ProgramacionRecursos } from '../components/ProgramacionRecursos';
import { Bitacora } from '../components/Bitacora';
import { VisitantesActivos } from '../components/VisitantesActivos';
import { ModalCierreTurno } from '../components/ModalCierreTurno';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Turno {
  id_turno: number;
  fecha_apertura: string;
  hora_apertura: string;
  hora_cierre: string | null;
  estado: string;
  nombre_encargado_apertura: string;
}

export const TurnoPage = () => {
  const [turno, setTurno] = useState<Turno | null>(null);
  const [cargando, setCargando] = useState(true);
  const [abriendo, setAbriendo] = useState(false);
  const [errorApertura, setErrorApertura] = useState('');
  const [cerrandoTurno, setCerrandoTurno] = useState(false);
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
    setErrorApertura('');
    try {
      await api.post('/api/turnos', {
        id_encargado_apertura: encargado.id_encargado,
        observaciones_apertura: ''
      });
      await cargarTurno();
    } catch (e: any) {
      setErrorApertura(e.response?.data?.mensaje || 'No se pudo abrir el turno.');
    } finally {
      setAbriendo(false);
    }
  };

  const alCerrarTurno = async () => {
    setCerrandoTurno(false);
    await cargarTurno();
  };

  if (cargando) {
    return (
      <Layout>
        <div className="pagina"><p className="vacio">Cargando...</p></div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pagina">
        <header className="pagina__encabezado">
          <h1 className="pagina__titulo">Gestión de turno</h1>
        </header>

        <section className="tarjeta estado-turno">
          {turno ? (
            <>
              <div className="estado-turno__info">
                <span className="insignia insignia--activa">Turno activo</span>
                <p className="estado-turno__texto">
                  Apertura el {new Date(turno.fecha_apertura).toLocaleDateString('es-CO', {
                    day: '2-digit', month: '2-digit', year: 'numeric'
                  })} a las {turno.hora_apertura?.slice(0, 5)} · {turno.nombre_encargado_apertura}
                </p>
              </div>
              <button type="button" className="btn btn--peligro" onClick={() => setCerrandoTurno(true)}>
                Cerrar turno
              </button>
            </>
          ) : (
            <>
              <div className="estado-turno__info">
                <span className="insignia insignia--neutra">Sin turno activo</span>
                {errorApertura && <p className="error-texto" role="alert">{errorApertura}</p>}
              </div>
              <button type="button" className="btn btn--primario" onClick={handleAbrirTurno} disabled={abriendo}>
                {abriendo ? 'Abriendo...' : 'Abrir turno'}
              </button>
            </>
          )}
        </section>

        {turno ? (
          <div className="rejilla-igual">
            <div className="columna">
              <RegistroVisitante />
              <VisitantesActivos id_turno={turno.id_turno} />
            </div>
            <div className="columna">
              <ProgramacionRecursos id_turno={turno.id_turno} />
              <Bitacora id_turno={turno.id_turno} />
            </div>
          </div>
        ) : (
          <section className="tarjeta tarjeta--centro">
            <p className="vacio">Abre un turno para gestionar visitantes, recursos y bitácora.</p>
          </section>
        )}
      </div>

      {cerrandoTurno && turno && encargado && (
        <ModalCierreTurno
          id_turno={turno.id_turno}
          id_encargado={encargado.id_encargado}
          onCerrar={() => setCerrandoTurno(false)}
          onConfirmado={alCerrarTurno}
        />
      )}
    </Layout>
  );
};