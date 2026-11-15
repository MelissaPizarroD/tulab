import { useState, useEffect } from 'react';
import { Countdown } from './Countdown';
import { api, socket } from '../services/api';

interface Visitante {
  id_visitante: number;
  nombre: string;
  codigo_temporal: string;
  timestamp_expiracion: string;
  email: string | null;
  telefono: string | null;
  institucion: string | null;
  motivo_visita: string | null;
  ha_ingresado: boolean;
}

export const VisitantesActivos = ({ id_turno }: { id_turno: number }) => {
  const [visitantes, setVisitantes] = useState<Visitante[]>([]);
  const [nuevaHora, setNuevaHora] = useState<Record<number, string>>({});
  const [error, setError] = useState('');

  const cargarVisitantes = async () => {
    try {
      const response = await api.get('/api/visitantes/vigentes');
      setVisitantes(response.data);
    } catch (error) {
      console.error('Error cargando visitantes:', error);
    }
  };

  useEffect(() => {
    cargarVisitantes();

    const handler = () => cargarVisitantes();
    socket.on('visitante_actualizado', handler);
    socket.on('entrada_registrada', handler);
    socket.on('salida_registrada', handler);

    const intervalo = setInterval(cargarVisitantes, 30000);

    return () => {
      socket.off('visitante_actualizado', handler);
      socket.off('entrada_registrada', handler);
      socket.off('salida_registrada', handler);
      clearInterval(intervalo);
    };
  }, [id_turno]);

  const handleCambiarExpiracion = async (id_visitante: number) => {
    const hora = nuevaHora[id_visitante];
    if (!hora) return;
    const hoy = new Date().toLocaleDateString('en-CA');
    const nuevaExpiracion = new Date(`${hoy}T${hora}:00`);
    setError('');
    try {
      await api.patch(`/api/visitantes/${id_visitante}/expiracion`, {
        timestamp_expiracion: nuevaExpiracion.toISOString()
      });
      await cargarVisitantes();
      setNuevaHora((h) => ({ ...h, [id_visitante]: '' }));
    } catch (e: any) {
      setError(e.response?.data?.mensaje || 'No se pudo actualizar la expiración.');
    }
  };

  return (
    <section className="tarjeta">
      <header className="tarjeta__cabecera">
        <h2 className="tarjeta__titulo">
          Visitantes con código vigente <span className="tarjeta__conteo">{visitantes.length}</span>
        </h2>
      </header>

      {error && <p className="error-texto" role="alert">{error}</p>}

      {visitantes.length === 0 ? (
        <p className="vacio">No hay visitantes con código vigente.</p>
      ) : (
        <ul className="lista">
          {visitantes.map((v) => (
            <li key={v.id_visitante} className="visitante">
              <div className="visitante__datos">
                <div className="visitante__cabecera">
                  <span className="visitante__nombre">{v.nombre}</span>
                  <span className={`insignia ${v.ha_ingresado ? 'insignia--activa' : 'insignia--pendiente'}`}>
                    {v.ha_ingresado ? 'Ya ingresó' : 'Aún no ingresa'}
                  </span>
                </div>
                {v.institucion && <span className="visitante__detalle">{v.institucion}</span>}
                <div className="visitante__codigo-fila">
                  <span className="codigo-chip">{v.codigo_temporal}</span>
                  <Countdown timestamp_expiracion={v.timestamp_expiracion} />
                </div>
              </div>

              <div className="visitante__expiracion">
                <input
                  type="time"
                  className="entrada entrada--chica"
                  aria-label={`Nueva hora de expiración para ${v.nombre}`}
                  value={nuevaHora[v.id_visitante] || ''}
                  onChange={(e) => setNuevaHora((h) => ({ ...h, [v.id_visitante]: e.target.value }))}
                />
                <button
                  type="button"
                  className="btn btn--secundario btn--chico"
                  onClick={() => handleCambiarExpiracion(v.id_visitante)}
                  disabled={!nuevaHora[v.id_visitante]}
                >
                  Cambiar expiración
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};