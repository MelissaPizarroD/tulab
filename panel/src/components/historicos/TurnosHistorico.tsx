import { useEffect, useRef, useState } from 'react';
import { api } from '../../services/api';
import type {
  EntradaBitacoraHistorico, NovedadHistorico, ProgramacionHistorico, SesionTurno, TurnoHistorico
} from '../../types/historico';
import {
  duracion, fechaCorta, formatHora, formatHoraTexto, hoyISO, nombreMotivoCierre, nombreRecurso, franjaRecurso
} from '../../utils/formato';
import { exportarTurnosExcel } from '../../services/exportService';
import { IconoChevron } from '../Iconos';

interface Detalle {
  bitacora: EntradaBitacoraHistorico[];
  novedades: NovedadHistorico[];
  programaciones: ProgramacionHistorico[];
  sesiones: SesionTurno[];
}

const haceDias = (dias: number) => {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  return d.toLocaleDateString('en-CA');
};

export const TurnosHistorico = () => {
  const [desde, setDesde] = useState(haceDias(30));
  const [hasta, setHasta] = useState(hoyISO());
  const [turnos, setTurnos] = useState<TurnoHistorico[]>([]);
  const [cargando, setCargando] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [error, setError] = useState('');
  const [abierto, setAbierto] = useState<number | null>(null);
  const [detalles, setDetalles] = useState<Record<number, Detalle | 'cargando' | 'error'>>({});
  const peticion = useRef(0);

  useEffect(() => {
    const numero = ++peticion.current;
    const cargar = async () => {
      setCargando(true);
      setError('');
      try {
        const p = new URLSearchParams();
        if (desde) p.append('desde', desde);
        if (hasta) p.append('hasta', hasta);
        const r = await api.get(`/api/turnos/historico?${p}`);
        if (numero !== peticion.current) return;
        setTurnos(r.data);
        setAbierto(null);
      } catch {
        if (numero === peticion.current) setError('No se pudieron cargar los turnos.');
      } finally {
        if (numero === peticion.current) setCargando(false);
      }
    };
    cargar();
  }, [desde, hasta]);

  const alternar = async (id: number) => {
    if (abierto === id) {
      setAbierto(null);
      return;
    }
    setAbierto(id);
    if (detalles[id] && detalles[id] !== 'error') return;
    setDetalles((d) => ({ ...d, [id]: 'cargando' }));
    try {
      const r = await api.get(`/api/turnos/${id}/detalle`);
      setDetalles((d) => ({ ...d, [id]: r.data }));
    } catch {
      setDetalles((d) => ({ ...d, [id]: 'error' }));
    }
  };

  // el Excel incluye turnos, bitácora, novedades de equipos y recursos programados del rango
  const exportar = async () => {
    if (!desde || !hasta) {
      setError('Selecciona las dos fechas para exportar.');
      return;
    }
    setExportando(true);
    setError('');
    try {
      const r = await api.get(`/api/reportes?desde=${desde}&hasta=${hasta}`);
      exportarTurnosExcel(r.data, `turnos_${desde}_${hasta}`);
    } catch (e: any) {
      setError(e.response?.data?.mensaje || 'No se pudo exportar.');
    } finally {
      setExportando(false);
    }
  };

  return (
    <section className="tarjeta">
      <header className="tarjeta__cabecera">
        <h2 className="tarjeta__titulo">
          Turnos <span className="tarjeta__conteo">{turnos.length}</span>
        </h2>
        <button
          type="button"
          className="btn btn--secundario btn--chico"
          onClick={exportar}
          disabled={exportando || turnos.length === 0}
        >
          {exportando ? 'Exportando...' : 'Exportar Excel'}
        </button>
      </header>

      <div className="filtros-barra">
        <label className="campo">
          <span className="campo__etiqueta">Desde</span>
          <input className="entrada" type="date" value={desde} max={hasta || undefined} onChange={(e) => setDesde(e.target.value)} />
        </label>
        <label className="campo">
          <span className="campo__etiqueta">Hasta</span>
          <input className="entrada" type="date" value={hasta} min={desde || undefined} onChange={(e) => setHasta(e.target.value)} />
        </label>
      </div>

      {error && <p className="error-texto" role="alert">{error}</p>}

      {turnos.length === 0 ? (
        <p className="vacio">{cargando ? 'Buscando...' : 'No hay turnos en ese periodo.'}</p>
      ) : (
        <ul className="personas">
          {turnos.map((t) => {
            const abierta = abierto === t.id_turno;
            const detalle = detalles[t.id_turno];
            const enCurso = t.estado === 'activo';
            return (
              <li key={t.id_turno} className={`persona ${abierta ? 'persona--abierta' : ''}`}>
                <button
                  type="button"
                  className="turno__cabecera"
                  aria-expanded={abierta}
                  onClick={() => alternar(t.id_turno)}
                >
                  <span className="persona__identidad">
                    <span className="persona__nombre">Turno #{t.id_turno} · {fechaCorta(t.fecha_turno)}</span>
                    <span className="persona__codigo">
                      {formatHoraTexto(t.hora_apertura)} a {t.hora_cierre ? formatHoraTexto(t.hora_cierre) : 'en curso'}
                    </span>
                  </span>
                  <span className="turno__encargados">
                    Abrió {t.nombre_encargado_apertura}
                    <span className="persona__tiempo">
                      {t.nombre_encargado_cierre ? `Cerró ${t.nombre_encargado_cierre}` : 'Sin cerrar'}
                    </span>
                  </span>
                  <span className="chip-origen">{t.total_registros} {t.total_registros === 1 ? 'persona' : 'personas'}</span>
                  <span className={`insignia ${enCurso ? 'insignia--activa' : 'insignia--neutra'}`}>
                    {enCurso ? 'En curso' : 'Cerrado'}
                  </span>
                  <span className="persona__flecha" aria-hidden="true"><IconoChevron size={18} /></span>
                </button>

                {abierta && (
                  <div className="turno__detalle">
                    <div className="turno__seccion">
                      <h3 className="detalle__titulo">Apertura · {formatHoraTexto(t.hora_apertura)} · {t.nombre_encargado_apertura}</h3>
                      <p className={t.observaciones_apertura ? 'turno__texto' : 'turno__texto turno__texto--vacio'}>
                        {t.observaciones_apertura || 'Sin observaciones.'}
                      </p>
                    </div>

                    {detalle === 'cargando' && <p className="vacio">Cargando detalle...</p>}
                    {detalle === 'error' && <p className="error-texto" role="alert">No se pudo cargar el detalle del turno.</p>}

                    {detalle && typeof detalle === 'object' && (
                      <>
                        <div className="turno__seccion">
                          <h3 className="detalle__titulo">Bitácora ({detalle.bitacora.length})</h3>
                          {detalle.bitacora.length === 0 ? (
                            <p className="turno__texto turno__texto--vacio">Sin entradas en la bitácora.</p>
                          ) : (
                            <ul className="turno__lista">
                              {[...detalle.bitacora].reverse().map((b) => (
                                <li key={b.id_entrada}>
                                  <span className="turno__hora">{formatHora(b.timestamp_registro)}</span>
                                  <span>
                                    {b.descripcion}
                                    <span className="turno__autor">
                                      {' '}· {b.nombre_encargado}
                                      {b.timestamp_edicion && ` · editada por ${b.nombre_editor} a las ${formatHora(b.timestamp_edicion)}`}
                                    </span>
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        <div className="turno__seccion">
                          <h3 className="detalle__titulo">Sesiones de equipos ({detalle.sesiones.length})</h3>
                          {detalle.sesiones.length === 0 ? (
                            <p className="turno__texto turno__texto--vacio">Sin sesiones de equipos.</p>
                          ) : (
                            <ul className="turno__lista">
                              {detalle.sesiones.map((s) => {
                                const fin = s.hora_cierre ? new Date(s.hora_cierre).getTime() : Date.now();
                                return (
                                  <li key={s.id_sesion}>
                                    <span className="turno__hora">{formatHora(s.hora_inicio)}</span>
                                    <span>
                                      <span className="insignia insignia--equipo">PC {s.numero_equipo}</span>{' '}
                                      {s.nombre_estudiante || s.nombre_visitante || s.codigo_estudiantil}
                                      <span className="turno__autor">
                                        {' '}· {s.hora_cierre ? `hasta ${formatHora(s.hora_cierre)}` : 'en curso'}
                                        {' '}· {duracion(s.hora_inicio, fin)}
                                        {s.hora_cierre && s.motivo_cierre ? ` · ${nombreMotivoCierre(s.motivo_cierre)}` : ''}
                                      </span>
                                    </span>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>

                        <div className="turno__seccion">
                          <h3 className="detalle__titulo">Novedades de equipos ({detalle.novedades.length})</h3>
                          {detalle.novedades.length === 0 ? (
                            <p className="turno__texto turno__texto--vacio">Sin novedades de equipos.</p>
                          ) : (
                            <ul className="turno__lista">
                              {[...detalle.novedades].reverse().map((n) => (
                                <li key={n.id_novedad}>
                                  <span className="turno__hora">{formatHora(n.timestamp_reporte)}</span>
                                  <span>
                                    <span className="insignia insignia--aviso">PC {n.numero_equipo}</span> {n.descripcion}
                                    <span className="turno__autor"> · {n.nombre_estudiante || n.nombre_visitante || n.codigo_estudiantil}</span>
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {detalle.programaciones.length > 0 && (
                          <div className="turno__seccion">
                            <h3 className="detalle__titulo">Recursos programados ({detalle.programaciones.length})</h3>
                            <ul className="turno__lista">
                              {detalle.programaciones.map((p) => (
                              <li key={p.id_programacion}>
                                <span className="turno__hora">{franjaRecurso(p)}</span>
                                <span>
                                  {p.nombre_estudiante || p.nombre_visitante || p.codigo_estudiantil} · {nombreRecurso(p)}
                                  {p.descripcion_recurso && ` · ${p.descripcion_recurso}`}
                                  <span className="turno__autor"> · {p.estado}</span>
                                </span>
                              </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    )}

                    <div className="turno__seccion">
                      <h3 className="detalle__titulo">
                        {t.hora_cierre
                          ? `Cierre · ${formatHoraTexto(t.hora_cierre)} · ${t.nombre_encargado_cierre ?? ''}`
                          : 'Cierre'}
                      </h3>
                      <p className={t.observaciones_cierre ? 'turno__texto' : 'turno__texto turno__texto--vacio'}>
                        {t.hora_cierre ? t.observaciones_cierre || 'Sin observaciones.' : 'El turno todavía no se ha cerrado.'}
                      </p>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};