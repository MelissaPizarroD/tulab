import { useState, useEffect } from 'react';
import { api, socket } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ModalConfirmacion } from './ModalConfirmacion';

interface Entrada {
  id_entrada: number;
  id_encargado: number;
  descripcion: string;
  timestamp_registro: string;
  timestamp_edicion: string | null;
  nombre_encargado: string;
  nombre_editor: string | null;
  estado: string;
}

export const Bitacora = ({ id_turno }: { id_turno: number }) => {
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [nueva, setNueva] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [editando, setEditando] = useState<number | null>(null);
  const [textoEdicion, setTextoEdicion] = useState('');
  const [error, setError] = useState('');
  const [porEliminar, setPorEliminar] = useState<Entrada | null>(null);
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

  // Los errores los muestra la ventana de confirmación
  const handleEliminar = async (id: number) => {
    await api.delete(`/api/bitacora/${id}`);
    await cargarEntradas();
  };

  const empezarEdicion = (e: Entrada) => {
    setError('');
    setEditando(e.id_entrada);
    setTextoEdicion(e.descripcion);
  };

  const guardarEdicion = async (id: number) => {
    setError('');
    try {
      await api.patch(`/api/bitacora/${id}`, { descripcion: textoEdicion });
      setEditando(null);
      await cargarEntradas();
    } catch (e: any) {
      setError(e.response?.data?.mensaje || 'No se pudo editar la entrada.');
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

      {error && <p className="error-texto" role="alert">{error}</p>}

      {entradas.length === 0 ? (
        <p className="vacio">No hay entradas en la bitácora.</p>
      ) : (
        <ul className="lista lista--separada">
          {entradas.map((e) => {
            const esMia = encargado?.id_encargado === e.id_encargado;
            return (
              <li key={e.id_entrada} className="elemento">
                <div className="elemento__cuerpo">
                  {editando === e.id_entrada ? (
                    <input
                      className="entrada"
                      type="text"
                      aria-label="Editar entrada"
                      value={textoEdicion}
                      onChange={(ev) => setTextoEdicion(ev.target.value)}
                    />
                  ) : (
                    <span className="elemento__titulo elemento__titulo--normal">{e.descripcion}</span>
                  )}
                  <span className="elemento__detalle">
                    {e.nombre_encargado} · {formatHora(e.timestamp_registro)}
                    {e.timestamp_edicion && ` · editada por ${e.nombre_editor} a las ${formatHora(e.timestamp_edicion)}`}
                  </span>
                </div>
                <div className="elemento__acciones">
                  {editando === e.id_entrada ? (
                    <>
                      <button type="button" className="btn btn--primario btn--chico" onClick={() => guardarEdicion(e.id_entrada)}>
                        Guardar
                      </button>
                      <button type="button" className="btn btn--secundario btn--chico" onClick={() => setEditando(null)}>
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      {esMia && (
                        <button type="button" className="btn btn--secundario btn--chico" onClick={() => empezarEdicion(e)}>
                          Editar
                        </button>
                      )}
                      <button type="button" className="btn btn--texto-peligro btn--chico" onClick={() => setPorEliminar(e)}>
                        Eliminar
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {porEliminar && (
        <ModalConfirmacion
          titulo="Eliminar entrada"
          texto={<>¿Seguro que quieres eliminar la entrada <strong>"{porEliminar.descripcion}"</strong>? Esta acción no se puede deshacer.</>}
          textoConfirmar="Eliminar"
          onConfirmar={() => handleEliminar(porEliminar.id_entrada)}
          onCerrar={() => setPorEliminar(null)}
        />
      )}
    </section>
  );
};