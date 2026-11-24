import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { api } from '../services/api';
import { ModalConfirmacion } from '../components/ModalConfirmacion';

interface Configuracion {
  id_configuracion: number;
  clave: string;
  valor: string;
  descripcion: string;
}

interface Equipo {
  id_equipo: number;
  numero_equipo: number;
  estado: string;
  descripcion: string;
}

interface Recurso {
  id_recurso: number;
  nombre: string;
  activo: boolean;
}

type Pestana = 'sistema' | 'equipos' | 'recursos';

const ETIQUETAS: Record<string, string> = {
  terminal_activa: 'Terminal activa',
  gestor_sesiones_activo: 'Gestor de sesiones activo',
  tiempo_inactividad_minutos: 'Tiempo de inactividad (minutos)',
  intervalo_heartbeat_segundos: 'Intervalo de heartbeat (segundos)'
};

const ESTADOS_EQUIPO: Record<string, { texto: string; clase: string }> = {
  disponible: { texto: 'Disponible', clase: 'insignia--activa' },
  en_uso: { texto: 'En uso', clase: 'insignia--pendiente' },
  fuera_de_servicio: { texto: 'Fuera de servicio', clase: 'insignia--aviso' }
};

// estados que se pueden elegir a mano (en_uso lo define el sistema)
const ESTADOS_EDITABLES = ['disponible', 'fuera_de_servicio'];

const esBooleano = (valor: string) => valor === 'true' || valor === 'false';

const TEXTO_PESTANA: Record<Pestana, string> = {
  sistema: 'Parámetros del sistema',
  equipos: 'Equipos',
  recursos: 'Recursos'
};

export const ConfiguracionPage = () => {
  const [pestana, setPestana] = useState<Pestana>('sistema');
  const [configuraciones, setConfiguraciones] = useState<Configuracion[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [guardando, setGuardando] = useState<string | null>(null);
  const [aviso, setAviso] = useState<{ clave: string; error: boolean; texto: string } | null>(null);
  const [valores, setValores] = useState<Record<string, string>>({});
  const [nuevoEquipo, setNuevoEquipo] = useState({ numero_equipo: '', descripcion: '' });
  const [agregando, setAgregando] = useState(false);
  const [errorEquipo, setErrorEquipo] = useState('');
  const [nuevoRecurso, setNuevoRecurso] = useState('');
  const [agregandoRecurso, setAgregandoRecurso] = useState(false);
  const [errorRecurso, setErrorRecurso] = useState('');
  const [recursoPorEliminar, setRecursoPorEliminar] = useState<Recurso | null>(null);

  const cargarConfiguraciones = async () => {
    try {
      const response = await api.get('/api/configuracion');
      setConfiguraciones(response.data);
      const vals: Record<string, string> = {};
      response.data.forEach((c: Configuracion) => {
        vals[c.clave] = c.valor;
      });
      setValores(vals);
    } catch (error) {
      console.error('Error cargando configuraciones:', error);
    }
  };

  const cargarEquipos = async () => {
    try {
      const response = await api.get('/api/equipos');
      setEquipos(response.data);
    } catch (error) {
      console.error('Error cargando equipos:', error);
    }
  };

  const cargarRecursos = async () => {
    try {
      const response = await api.get('/api/recursos');
      setRecursos(response.data);
    } catch (error) {
      console.error('Error cargando recursos:', error);
    }
  };

  useEffect(() => {
    cargarConfiguraciones();
    cargarEquipos();
    cargarRecursos();
  }, []);

  const handleGuardarConfig = async (clave: string) => {
    setGuardando(clave);
    setAviso(null);
    try {
      await api.patch(`/api/configuracion/${clave}`, { valor: valores[clave] });
      // el valor guardado pasa a ser el actual, así el botón se deshabilita de nuevo
      setConfiguraciones((lista) =>
        lista.map((c) => (c.clave === clave ? { ...c, valor: valores[clave] } : c))
      );
      setAviso({ clave, error: false, texto: 'Guardado' });
      setTimeout(() => setAviso((a) => (a?.clave === clave && !a.error ? null : a)), 2500);
    } catch (e: any) {
      setAviso({ clave, error: true, texto: e.response?.data?.mensaje || 'No se pudo guardar' });
    } finally {
      setGuardando(null);
    }
  };

  const handleActualizarEquipo = async (id: number, estado: string) => {
    try {
      await api.patch(`/api/equipos/${id}`, { estado });
      await cargarEquipos();
    } catch (error) {
      console.error('Error actualizando equipo:', error);
    }
  };

  const handleAgregarEquipo = async () => {
    if (!nuevoEquipo.numero_equipo) return;
    setAgregando(true);
    setErrorEquipo('');
    try {
      await api.post('/api/equipos', {
        numero_equipo: Number(nuevoEquipo.numero_equipo),
        descripcion: nuevoEquipo.descripcion
      });
      setNuevoEquipo({ numero_equipo: '', descripcion: '' });
      await cargarEquipos();
    } catch (e: any) {
      setErrorEquipo(e.response?.data?.mensaje || 'No se pudo agregar el equipo.');
    } finally {
      setAgregando(false);
    }
  };

  const handleAgregarRecurso = async () => {
    if (!nuevoRecurso.trim()) return;
    setAgregandoRecurso(true);
    setErrorRecurso('');
    try {
      await api.post('/api/recursos', { nombre: nuevoRecurso });
      setNuevoRecurso('');
      await cargarRecursos();
    } catch (e: any) {
      setErrorRecurso(e.response?.data?.mensaje || 'No se pudo agregar el recurso.');
    } finally {
      setAgregandoRecurso(false);
    }
  };

  // Los errores (por ejemplo, un recurso con reservas) los muestra la ventana de confirmación
  const handleEliminarRecurso = async (id: number) => {
    await api.delete(`/api/recursos/${id}`);
    await cargarRecursos();
  };

  const handleActivoRecurso = async (id: number, activo: boolean) => {
    try {
      await api.patch(`/api/recursos/${id}`, { activo });
      await cargarRecursos();
    } catch (error) {
      console.error('Error actualizando recurso:', error);
    }
  };

  return (
    <Layout>
      <div className="pagina pagina--angosta">
        <header className="pagina__encabezado">
          <h1 className="pagina__titulo">Configuración</h1>
        </header>

        <div className="pestanas" role="tablist" aria-label="Secciones de configuración">
          {(['sistema', 'equipos', 'recursos'] as const).map((p) => (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={pestana === p}
              className={`pestana ${pestana === p ? 'pestana--activa' : ''}`}
              onClick={() => setPestana(p)}
            >
              {TEXTO_PESTANA[p]}
            </button>
          ))}
        </div>

        {pestana === 'sistema' && (
          <section className="tarjeta">
            <header className="tarjeta__cabecera">
              <h2 className="tarjeta__titulo">Parámetros del sistema</h2>
            </header>

            {configuraciones.length === 0 ? (
              <p className="vacio">No hay parámetros configurados.</p>
            ) : (
              <ul className="lista">
                {configuraciones.map((c) => {
                  const actual = valores[c.clave] ?? c.valor;
                  const cambio = actual !== c.valor && actual !== '';
                  const mensaje = aviso?.clave === c.clave ? aviso : null;
                  return (
                    <li key={c.clave} className="parametro">
                      <div className="parametro__texto">
                        <span className="parametro__nombre">{ETIQUETAS[c.clave] || c.clave}</span>
                        {c.descripcion && <span className="parametro__detalle">{c.descripcion}</span>}
                      </div>

                      <div className="parametro__control">
                        {mensaje && (
                          <span
                            className={mensaje.error ? 'error-texto parametro__aviso' : 'parametro__aviso parametro__aviso--ok'}
                            role={mensaje.error ? 'alert' : 'status'}
                          >
                            {mensaje.texto}
                          </span>
                        )}

                        {esBooleano(c.valor) ? (
                          <button
                            type="button"
                            role="switch"
                            aria-checked={actual === 'true'}
                            aria-label={ETIQUETAS[c.clave] || c.clave}
                            className={`interruptor ${actual === 'true' ? 'interruptor--activo' : ''}`}
                            onClick={() =>
                              setValores((v) => ({ ...v, [c.clave]: actual === 'true' ? 'false' : 'true' }))
                            }
                          >
                            <span className="interruptor__bola" />
                          </button>
                        ) : (
                          <input
                            type="number"
                            min={1}
                            className="entrada entrada--numero"
                            aria-label={ETIQUETAS[c.clave] || c.clave}
                            value={actual}
                            onChange={(e) => setValores((v) => ({ ...v, [c.clave]: e.target.value }))}
                          />
                        )}

                        <button
                          type="button"
                          className="btn btn--primario btn--chico"
                          onClick={() => handleGuardarConfig(c.clave)}
                          disabled={!cambio || guardando === c.clave}
                        >
                          {guardando === c.clave ? 'Guardando...' : 'Guardar'}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}

        {pestana === 'equipos' && (
          <div className="columna">
            <section className="tarjeta">
              <header className="tarjeta__cabecera">
                <h2 className="tarjeta__titulo">Agregar equipo</h2>
              </header>

              <form
                className="fila-formulario fila-formulario--sin-margen"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAgregarEquipo();
                }}
              >
                <input
                  type="number"
                  min={1}
                  className="entrada entrada--numero-largo"
                  placeholder="Número de equipo"
                  aria-label="Número de equipo"
                  value={nuevoEquipo.numero_equipo}
                  onChange={(e) => setNuevoEquipo((v) => ({ ...v, numero_equipo: e.target.value }))}
                />
                <input
                  type="text"
                  className="entrada"
                  placeholder="Descripción (opcional)"
                  aria-label="Descripción del equipo"
                  value={nuevoEquipo.descripcion}
                  onChange={(e) => setNuevoEquipo((v) => ({ ...v, descripcion: e.target.value }))}
                />
                <button type="submit" className="btn btn--primario" disabled={agregando || !nuevoEquipo.numero_equipo}>
                  {agregando ? 'Agregando...' : 'Agregar'}
                </button>
              </form>
              {errorEquipo && <p className="error-texto error-texto--arriba" role="alert">{errorEquipo}</p>}
            </section>

            <section className="tarjeta">
              <header className="tarjeta__cabecera">
                <h2 className="tarjeta__titulo">
                  Equipos registrados <span className="tarjeta__conteo">{equipos.length}</span>
                </h2>
              </header>

              {equipos.length === 0 ? (
                <p className="vacio">No hay equipos registrados.</p>
              ) : (
                <ul className="lista">
                  {equipos.map((e) => {
                    const estado = ESTADOS_EQUIPO[e.estado] ?? { texto: e.estado, clase: 'insignia--sin-equipo' };
                    return (
                      <li key={e.id_equipo} className="elemento elemento--centrado">
                        <div className="elemento__cuerpo">
                          <span className="elemento__titulo">PC {e.numero_equipo}</span>
                          {e.descripcion && <span className="elemento__detalle">{e.descripcion}</span>}
                        </div>
                        <div className="elemento__acciones">
                          <span className={`insignia ${estado.clase}`}>{estado.texto}</span>
                          <select
                            className="entrada entrada--chica"
                            aria-label={`Estado del PC ${e.numero_equipo}`}
                            value={e.estado}
                            onChange={(ev) => handleActualizarEquipo(e.id_equipo, ev.target.value)}
                          >
                            {!ESTADOS_EDITABLES.includes(e.estado) && (
                              <option value={e.estado} disabled>{estado.texto}</option>
                            )}
                            {ESTADOS_EDITABLES.map((s) => (
                              <option key={s} value={s}>{ESTADOS_EQUIPO[s].texto}</option>
                            ))}
                          </select>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>
        )}

        {pestana === 'recursos' && (
          <div className="columna">
            <section className="tarjeta">
              <header className="tarjeta__cabecera">
                <h2 className="tarjeta__titulo">Agregar recurso</h2>
              </header>

              <form
                className="fila-formulario fila-formulario--sin-margen"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAgregarRecurso();
                }}
              >
                <input
                  type="text"
                  className="entrada"
                  placeholder="Nombre del recurso (ej. Auditorio)"
                  aria-label="Nombre del recurso"
                  value={nuevoRecurso}
                  onChange={(e) => setNuevoRecurso(e.target.value)}
                />
                <button type="submit" className="btn btn--primario" disabled={agregandoRecurso || !nuevoRecurso.trim()}>
                  {agregandoRecurso ? 'Agregando...' : 'Agregar'}
                </button>
              </form>
              {errorRecurso && <p className="error-texto error-texto--arriba" role="alert">{errorRecurso}</p>}
            </section>

            <section className="tarjeta">
              <header className="tarjeta__cabecera">
                <h2 className="tarjeta__titulo">
                  Recursos registrados <span className="tarjeta__conteo">{recursos.length}</span>
                </h2>
              </header>

              {recursos.length === 0 ? (
                <p className="vacio">No hay recursos registrados.</p>
              ) : (
                <ul className="lista">
                  {recursos.map((r) => (
                    <li key={r.id_recurso} className="elemento elemento--centrado">
                      <div className="elemento__cuerpo">
                        <span className="elemento__titulo">{r.nombre}</span>
                      </div>
                      <div className="elemento__acciones">
                        <span className={`insignia ${r.activo ? 'insignia--activa' : 'insignia--aviso'}`}>
                          {r.activo ? 'Activo' : 'Inactivo'}
                        </span>
                        <button
                          type="button"
                          className="btn btn--secundario btn--chico"
                          onClick={() => handleActivoRecurso(r.id_recurso, !r.activo)}
                        >
                          {r.activo ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          type="button"
                          className="btn btn--texto-peligro btn--chico"
                          onClick={() => setRecursoPorEliminar(r)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>

      {recursoPorEliminar && (
        <ModalConfirmacion
          titulo="Eliminar recurso"
          texto={<>¿Seguro que quieres eliminar <strong>{recursoPorEliminar.nombre}</strong>? Solo se pueden eliminar los recursos que nunca se han programado. Esta acción no se puede deshacer.</>}
          textoConfirmar="Eliminar"
          onConfirmar={() => handleEliminarRecurso(recursoPorEliminar.id_recurso)}
          onCerrar={() => setRecursoPorEliminar(null)}
        />
      )}
    </Layout>
  );
};