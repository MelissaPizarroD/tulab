import { useState, useEffect } from 'react';
import { api, socket } from '../services/api';

interface Programacion {
  id_programacion: number;
  codigo_estudiantil: string;
  nombre_estudiante: string;
  tipo_recurso: string;
  descripcion_recurso: string;
  hora_estimada_disponibilidad: string;
  estado: string;
}

const TIPOS: Record<string, string> = {
  sala_estudio: 'Sala de estudio',
  sala_television: 'Sala de televisión',
  otro: 'Otro'
};

const ESTADOS: Record<string, { clase: string; texto: string }> = {
  pendiente: { clase: 'insignia--pendiente', texto: 'Pendiente' },
  asignado: { clase: 'insignia--activa', texto: 'Asignado' },
  cancelado: { clase: 'insignia--aviso', texto: 'Cancelado' }
};

export const ProgramacionRecursos = ({ id_turno }: { id_turno: number }) => {
  const [programaciones, setProgramaciones] = useState<Programacion[]>([]);
  const [codigo, setCodigo] = useState('');
  const [tipoRecurso, setTipoRecurso] = useState('sala_estudio');
  const [descripcion, setDescripcion] = useState('');
  const [hora, setHora] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const cargarProgramaciones = async () => {
    try {
      const response = await api.get(`/api/programaciones/turno/${id_turno}`);
      setProgramaciones(response.data);
    } catch (error) {
      console.error('Error cargando programaciones:', error);
    }
  };

  useEffect(() => {
    cargarProgramaciones();
    socket.on('programacion_actualizada', cargarProgramaciones);
    return () => {
      socket.off('programacion_actualizada', cargarProgramaciones);
    };
  }, [id_turno]);

  const handleAgregar = async () => {
    if (!codigo.trim()) return;
    setEnviando(true);
    setError('');
    try {
      await api.post('/api/programaciones', {
        codigo,
        tipo_recurso: tipoRecurso,
        descripcion_recurso: descripcion,
        hora_estimada_disponibilidad: hora || undefined
      });
      setCodigo('');
      setDescripcion('');
      setHora('');
      await cargarProgramaciones();
    } catch (e: any) {
      setError(e.response?.data?.mensaje || 'No se pudo programar el recurso.');
    } finally {
      setEnviando(false);
    }
  };

  const handleActualizarEstado = async (id: number, estado: string) => {
    try {
      await api.patch(`/api/programaciones/${id}/estado`, { estado });
      await cargarProgramaciones();
    } catch (error) {
      console.error('Error actualizando estado:', error);
    }
  };

  return (
    <section className="tarjeta">
      <header className="tarjeta__cabecera">
        <h2 className="tarjeta__titulo">
          Programación de recursos <span className="tarjeta__conteo">{programaciones.length}</span>
        </h2>
      </header>

      <form
        className="formulario"
        onSubmit={(e) => {
          e.preventDefault();
          handleAgregar();
        }}
      >
        <label className="campo">
          <span className="campo__etiqueta">Código estudiantil</span>
          <input className="entrada" type="text" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
        </label>
        <label className="campo">
          <span className="campo__etiqueta">Recurso</span>
          <select className="entrada" value={tipoRecurso} onChange={(e) => setTipoRecurso(e.target.value)}>
            {Object.entries(TIPOS).map(([valor, texto]) => (
              <option key={valor} value={valor}>{texto}</option>
            ))}
          </select>
        </label>
        <label className="campo">
          <span className="campo__etiqueta">Descripción</span>
          <input className="entrada" type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        </label>
        <label className="campo">
          <span className="campo__etiqueta">Hora estimada</span>
          <input className="entrada" type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
        </label>

        {error && <p className="error-texto campo--ancho" role="alert">{error}</p>}

        <button type="submit" className="btn btn--primario campo--ancho" disabled={enviando || !codigo.trim()}>
          {enviando ? 'Programando...' : 'Programar recurso'}
        </button>
      </form>

      {programaciones.length === 0 ? (
        <p className="vacio">No hay recursos programados.</p>
      ) : (
        <ul className="lista lista--separada">
          {programaciones.map((p) => {
            const estado = ESTADOS[p.estado] ?? { clase: 'insignia--sin-equipo', texto: p.estado };
            return (
              <li key={p.id_programacion} className="elemento">
                <div className="elemento__cuerpo">
                  <span className="elemento__titulo">{p.nombre_estudiante || p.codigo_estudiantil}</span>
                  <span className="elemento__detalle">
                    {TIPOS[p.tipo_recurso] ?? p.tipo_recurso}
                    {p.descripcion_recurso && ` · ${p.descripcion_recurso}`}
                    {p.hora_estimada_disponibilidad && ` · ${p.hora_estimada_disponibilidad.slice(0, 5)}`}
                  </span>
                </div>
                <div className="elemento__acciones">
                  {p.estado === 'pendiente' ? (
                    <>
                      <button
                        type="button"
                        className="btn btn--secundario btn--chico"
                        onClick={() => handleActualizarEstado(p.id_programacion, 'asignado')}
                      >
                        Asignar
                      </button>
                      <button
                        type="button"
                        className="btn btn--texto-peligro btn--chico"
                        onClick={() => handleActualizarEstado(p.id_programacion, 'cancelado')}
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <span className={`insignia ${estado.clase}`}>{estado.texto}</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};