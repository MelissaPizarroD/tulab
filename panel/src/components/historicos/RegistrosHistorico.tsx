import { useEffect, useRef, useState } from 'react';
import { api } from '../../services/api';
import type { RegistroHistorico } from '../../types/historico';
import { duracion, fechaCorta, formatHora, hoyISO, nombreOrigen } from '../../utils/formato';
import { exportarRegistrosExcel } from '../../services/exportService';
import { IconoBuscar, IconoChevron } from '../Iconos';
import { DetalleBloque, Dato } from '../Detalle';

const POR_PAGINA = 25;

export const RegistrosHistorico = () => {
  const [desde, setDesde] = useState(hoyISO());
  const [hasta, setHasta] = useState(hoyISO());
  const [busqueda, setBusqueda] = useState('');
  const [q, setQ] = useState('');
  const [tipo, setTipo] = useState('');
  const [pagina, setPagina] = useState(0);
  const [registros, setRegistros] = useState<RegistroHistorico[]>([]);
  const [total, setTotal] = useState(0);
  const [abierto, setAbierto] = useState<number | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [exportando, setExportando] = useState(false);
  const peticion = useRef(0);

  // la búsqueda por texto espera un momento después de dejar de escribir
  useEffect(() => {
    const t = setTimeout(() => setQ(busqueda.trim()), 350);
    return () => clearTimeout(t);
  }, [busqueda]);

  useEffect(() => {
    setPagina(0);
  }, [desde, hasta, q, tipo]);

  const parametros = (extra: Record<string, string | number> = {}) => {
    const p = new URLSearchParams();
    if (desde) p.append('desde', desde);
    if (hasta) p.append('hasta', hasta);
    if (q) p.append('q', q);
    if (tipo) p.append('tipo', tipo);
    Object.entries(extra).forEach(([k, v]) => p.append(k, String(v)));
    return p;
  };

  useEffect(() => {
    const numero = ++peticion.current;
    const cargar = async () => {
      setCargando(true);
      setError('');
      try {
        const r = await api.get(
          `/api/registros-acceso/historico?${parametros({ limit: POR_PAGINA, offset: pagina * POR_PAGINA })}`
        );
        if (numero !== peticion.current) return;
        setRegistros(r.data.registros);
        setTotal(r.data.total);
        setAbierto(null);
      } catch {
        if (numero === peticion.current) setError('No se pudieron cargar los registros.');
      } finally {
        if (numero === peticion.current) setCargando(false);
      }
    };
    cargar();
  }, [desde, hasta, q, tipo, pagina]);

  const exportar = async () => {
    setExportando(true);
    try {
      // se exporta todo lo que coincide con los filtros, no solo la página visible
      const r = await api.get(`/api/registros-acceso/historico?${parametros({ limit: 20000 })}`);
      exportarRegistrosExcel(r.data.registros, `registros_${desde || 'inicio'}_${hasta || 'hoy'}`);
    } catch {
      setError('No se pudo exportar.');
    } finally {
      setExportando(false);
    }
  };

  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const primero = total === 0 ? 0 : pagina * POR_PAGINA + 1;
  const ultimo = Math.min(total, (pagina + 1) * POR_PAGINA);

  return (
    <section className="tarjeta">
      <header className="tarjeta__cabecera">
        <h2 className="tarjeta__titulo">
          Registros de acceso <span className="tarjeta__conteo">{total}</span>
        </h2>
        <button type="button" className="btn btn--secundario btn--chico" onClick={exportar} disabled={exportando || total === 0}>
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
        <label className="campo">
          <span className="campo__etiqueta">Tipo</span>
          <select className="entrada" value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Todos</option>
            <option value="estudiante">Estudiantes</option>
            <option value="visitante">Visitantes</option>
          </select>
        </label>
        <label className="campo campo--crece">
          <span className="campo__etiqueta">Buscar</span>
          <span className="buscador">
            <IconoBuscar size={18} />
            <input
              type="search"
              placeholder="Nombre o código"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar por nombre o código"
            />
          </span>
        </label>
      </div>

      {error && <p className="error-texto" role="alert">{error}</p>}

      {registros.length === 0 ? (
        <p className="vacio">{cargando ? 'Buscando...' : 'No hay registros con esos filtros.'}</p>
      ) : (
        <ul className="personas">
          {registros.map((r) => {
            const esEstudiante = !!r.codigo_estudiantil;
            const abierta = abierto === r.id_registro;
            const nombre = r.nombre_estudiante || r.nombre_visitante || 'Visitante';
            const codigo = r.codigo_estudiantil || r.codigo_temporal || '-';
            return (
              <li key={r.id_registro} className={`persona ${abierta ? 'persona--abierta' : ''}`}>
                <button
                  type="button"
                  className="persona__cabecera"
                  aria-expanded={abierta}
                  onClick={() => setAbierto(abierta ? null : r.id_registro)}
                >
                  <span className="persona__identidad">
                    <span className="persona__nombre">{nombre}</span>
                    <span className="persona__codigo">{codigo}</span>
                  </span>
                  <span className={`insignia insignia--${esEstudiante ? 'estudiante' : 'visitante'}`}>
                    {esEstudiante ? 'Estudiante' : 'Visitante'}
                  </span>
                  <span className="persona__entrada">
                    {fechaCorta(r.fecha_turno)} · {formatHora(r.hora_entrada)} a {r.hora_salida ? formatHora(r.hora_salida) : 'en curso'}
                    <span className="persona__tiempo">
                      {r.hora_salida ? duracion(r.hora_entrada, new Date(r.hora_salida).getTime()) : 'Sigue en el laboratorio'}
                    </span>
                  </span>
                  {r.equipos ? (
                    <span className="insignia insignia--equipo">PC {r.equipos}</span>
                  ) : (
                    <span className="insignia insignia--sin-equipo">Sin equipo</span>
                  )}
                  <span className="chip-origen">{nombreOrigen(r.origen_registro)}</span>
                  <span className="persona__flecha" aria-hidden="true"><IconoChevron size={18} /></span>
                </button>

                {abierta && (
                  <div className="persona__detalle">
                    <DetalleBloque titulo="Datos de la persona">
                      {esEstudiante ? (
                        <>
                          <Dato etiqueta="Programa" valor={r.programa_academico} />
                          <Dato etiqueta="Semestre" valor={r.semestre ? `${r.semestre}°` : null} />
                          <Dato etiqueta="Correo" valor={r.correo_institucional} />
                          <Dato etiqueta="Teléfono" valor={r.telefono_contacto} />
                        </>
                      ) : (
                        <>
                          <Dato etiqueta="Institución" valor={r.institucion} />
                          <Dato etiqueta="Motivo" valor={r.motivo_visita} />
                          <Dato etiqueta="Correo" valor={r.email} />
                          <Dato etiqueta="Teléfono" valor={r.telefono} />
                        </>
                      )}
                    </DetalleBloque>

                    <DetalleBloque titulo="Equipo">
                      <Dato etiqueta="PC usado" valor={r.equipos ? `PC ${r.equipos}` : null} />
                      <Dato etiqueta="IP del equipo" valor={r.ips_equipo} tecnico />
                    </DetalleBloque>

                    <DetalleBloque titulo="Registro">
                      <Dato etiqueta="Origen" valor={nombreOrigen(r.origen_registro)} />
                      <Dato etiqueta="IP del dispositivo" valor={r.ip_origen} tecnico />
                      <Dato etiqueta="Turno" valor={`#${r.id_turno}`} />
                      <Dato etiqueta="Encargado de apertura" valor={r.nombre_encargado_apertura} />
                      <Dato etiqueta="Encargado de cierre" valor={r.nombre_encargado_cierre} />
                    </DetalleBloque>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {total > POR_PAGINA && (
        <nav className="paginacion" aria-label="Paginación">
          <span className="paginacion__texto">Mostrando {primero} a {ultimo} de {total}</span>
          <div className="paginacion__botones">
            <button type="button" className="btn btn--secundario btn--chico" onClick={() => setPagina((p) => p - 1)} disabled={pagina === 0 || cargando}>
              Anterior
            </button>
            <span className="paginacion__texto">Página {pagina + 1} de {paginas}</span>
            <button type="button" className="btn btn--secundario btn--chico" onClick={() => setPagina((p) => p + 1)} disabled={pagina + 1 >= paginas || cargando}>
              Siguiente
            </button>
          </div>
        </nav>
      )}
    </section>
  );
};