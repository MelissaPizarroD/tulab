import { useState, useEffect } from 'react';
import { api, socket } from '../services/api';

interface Recurso {
  id_recurso: number;
  nombre: string;
  activo: boolean;
  ocupado_ahora?: boolean;
}

interface Programacion {
  id_programacion: number;
  codigo_estudiantil: string;
  nombre_estudiante: string;
  nombre_visitante: string | null;
  nombre_recurso: string | null;
  tipo_recurso: string | null;
  descripcion_recurso: string;
  hora_estimada_disponibilidad: string;
  hora_fin: string | null;
  estado: string;
}

const ESTADOS: Record<string, { clase: string; texto: string }> = {
  pendiente: { clase: 'insignia--pendiente', texto: 'Reservado' },
  asignado: { clase: 'insignia--activa', texto: 'En uso' },
  finalizado: { clase: 'insignia--sin-equipo', texto: 'Finalizado' },
  cancelado: { clase: 'insignia--aviso', texto: 'Cancelado' }
};

export const ProgramacionRecursos = ({ id_turno }: { id_turno: number }) => {
  const [programaciones, setProgramaciones] = useState<Programacion[]>([]);
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [disponibilidad, setDisponibilidad] = useState<Recurso[]>([]);
  const [codigo, setCodigo] = useState('');
  const [idRecurso, setIdRecurso] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
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

  const cargarRecursos = async () => {
    try {
      const [lista, disp] = await Promise.all([
        api.get('/api/recursos'),
        api.get('/api/recursos/disponibilidad')
      ]);
      const activos = (lista.data as Recurso[]).filter((r) => r.activo);
      setRecursos(activos);
      setDisponibilidad(disp.data);
      setIdRecurso((actual) => actual || (activos[0] ? String(activos[0].id_recurso) : ''));
    } catch (error) {
      console.error('Error cargando recursos:', error);
    }
  };

  useEffect(() => {
    cargarProgramaciones();
    cargarRecursos();

    const refrescar = () => {
      cargarProgramaciones();
      cargarRecursos();
    };
    socket.on('programacion_actualizada', refrescar);
    socket.on('recurso_actualizado', refrescar);
    // la ocupación depende de la hora, se recalcula cada minuto
    const t = setInterval(cargarRecursos, 60000);
    return () => {
      socket.off('programacion_actualizada', refrescar);
      socket.off('recurso_actualizado', refrescar);
      clearInterval(t);
    };
  }, [id_turno]);

  const handleAgregar = async () => {
    if (!codigo.trim() || !idRecurso || !horaInicio || !horaFin) return;
    setEnviando(true);
    setError('');
    try {
      await api.post('/api/programaciones', {
        codigo,
        id_recurso: Number(idRecurso),
        descripcion_recurso: descripcion,
        hora_inicio: horaInicio,
        hora_fin: horaFin
      });
      setCodigo('');
      setDescripcion('');
      setHoraInicio('');
      setHoraFin('');
      await cargarProgramaciones();
      await cargarRecursos();
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
      await cargarRecursos();
    } catch (e: any) {
      setError(e.response?.data?.mensaje || 'No se pudo actualizar el estado.');
    }
  };

  return (
    <section className="tarjeta">
      <header className="tarjeta__cabecera">
        <h2 className="tarjeta__titulo">
          Programación de recursos <span className="tarjeta__conteo">{programaciones.length}</span>
        </h2>
      </header>

      {disponibilidad.filter((r) => r.activo).length > 0 && (
        <ul className="lista">
          {disponibilidad.filter((r) => r.activo).map((r) => (
            <li key={r.id_recurso} className="elemento">
              <div className="elemento__cuerpo">
                <span className="elemento__titulo">{r.nombre}</span>
              </div>
              <div className="elemento__acciones">
                <span className={`insignia ${r.ocupado_ahora ? 'insignia--pendiente' : 'insignia--activa'}`}>
                  {r.ocupado_ahora ? 'Ocupado ahora' : 'Disponible ahora'}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form
        className="formulario"
        onSubmit={(e) => {
          e.preventDefault();
          handleAgregar();
        }}
      >
        <label className="campo">
          <span className="campo__etiqueta">Código</span>
          <input className="entrada" type="text" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
        </label>
        <label className="campo">
          <span className="campo__etiqueta">Recurso</span>
          <select className="entrada" value={idRecurso} onChange={(e) => setIdRecurso(e.target.value)}>
            {recursos.map((r) => (
              <option key={r.id_recurso} value={r.id_recurso}>{r.nombre}</option>
            ))}
          </select>
        </label>
        <label className="campo">
          <span className="campo__etiqueta">Descripción</span>
          <input className="entrada" type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        </label>
        <label className="campo">
          <span className="campo__etiqueta">Desde</span>
          <input className="entrada" type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} />
        </label>
        <label className="campo">
          <span className="campo__etiqueta">Hasta</span>
          <input className="entrada" type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} />
        </label>

        {error && <p className="error-texto campo--ancho" role="alert">{error}</p>}

        <button
          type="submit"
          className="btn btn--primario campo--ancho"
          disabled={enviando || !codigo.trim() || !idRecurso || !horaInicio || !horaFin}
        >
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
                  <span className="elemento__titulo">
                    {p.nombre_estudiante || p.nombre_visitante || p.codigo_estudiantil}
                  </span>
                  <span className="elemento__detalle">
                    {p.nombre_recurso || p.tipo_recurso}
                    {p.descripcion_recurso && ` · ${p.descripcion_recurso}`}
                    {` · ${p.hora_estimada_disponibilidad.slice(0, 5)}`}
                    {p.hora_fin && ` a ${p.hora_fin.slice(0, 5)}`}
                  </span>
                </div>
                <div className="elemento__acciones">
                  {p.estado === 'pendiente' && (
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
                  )}
                  {p.estado === 'asignado' && (
                    <button
                      type="button"
                      className="btn btn--secundario btn--chico"
                      onClick={() => handleActualizarEstado(p.id_programacion, 'finalizado')}
                    >
                      Finalizar
                    </button>
                  )}
                  {(p.estado === 'finalizado' || p.estado === 'cancelado') && (
                    <span className={`insignia ${estado.clase}`}>{estado.texto}</span>
                  )}
                  {(p.estado === 'pendiente' || p.estado === 'asignado') && (
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