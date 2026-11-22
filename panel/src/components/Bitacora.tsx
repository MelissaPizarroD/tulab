import { useState, useEffect } from 'react';
import { api, socket } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Entrada {
  id_entrada: number;
  descripcion: string;
  timestamp_registro: string;
  nombre_encargado: string;
  estado: string;
}

export const Bitacora = ({ id_turno }: { id_turno: number }) => {
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [nueva, setNueva] = useState('');
  const [enviando, setEnviando] = useState(false);
  const { encargado } = useAuth();

  const cargarEntradas = async () => {
    try {
      const response = await api.get(`/api/bitacora/turno/${id_turno}`);
      setEntradas(response.data);
    } catch (error) {
      console.error('Error cargando bitácora:', error);
    }
  };

  useEffect(() => {
    cargarEntradas();
    socket.on('bitacora_actualizada', cargarEntradas);
    return () => {
      socket.off('bitacora_actualizada', cargarEntradas);
    };
  }, [id_turno]);

  const handleAgregar = async () => {
    if (!nueva.trim() || !encargado) return;
    setEnviando(true);
    try {
      await api.post('/api/bitacora', { descripcion: nueva });
      setNueva('');
      await cargarEntradas();
    } catch (error) {
      console.error('Error agregando entrada:', error);
    } finally {
      setEnviando(false);
    }
  };

  const handleEliminar = async (id: number) => {
    try {
      await api.delete(`/api/bitacora/${id}`);
      await cargarEntradas();
    } catch (error) {
      console.error('Error eliminando entrada:', error);
    }
  };

  const formatHora = (fecha: string) =>
    new Date(fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

  return (
    <section className="tarjeta">
      <header className="tarjeta__cabecera">
        <h2 className="tarjeta__titulo">
          Bitácora del turno <span className="tarjeta__conteo">{entradas.length}</span>
        </h2>
      </header>

      <form
        className="fila-formulario"
        onSubmit={(e) => {
          e.preventDefault();
          handleAgregar();
        }}
      >
        <input
          className="entrada"
          type="text"
          placeholder="Nueva entrada en la bitácora"
          aria-label="Nueva entrada en la bitácora"
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
        />
        <button type="submit" className="btn btn--primario" disabled={enviando || !nueva.trim()}>
          Agregar
        </button>
      </form>

      {entradas.length === 0 ? (
        <p className="vacio">No hay entradas en la bitácora.</p>
      ) : (
        <ul className="lista lista--separada">
          {entradas.map((e) => (
            <li key={e.id_entrada} className="elemento">
              <div className="elemento__cuerpo">
                <span className="elemento__titulo elemento__titulo--normal">{e.descripcion}</span>
                <span className="elemento__detalle">
                  {e.nombre_encargado} · {formatHora(e.timestamp_registro)}
                </span>
              </div>
              <div className="elemento__acciones">
                <button type="button" className="btn btn--texto-peligro btn--chico" onClick={() => handleEliminar(e.id_entrada)}>
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};