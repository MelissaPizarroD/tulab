import { useMemo, useState } from 'react';
import type { PersonaPresente } from '../../types/laboratorio';
import { useAhora } from '../../hooks/useAhora';
import { duracion, formatHora, hace, nombreOrigen } from '../../utils/formato';
import { IconoBuscar, IconoChevron } from '../Iconos';

type Filtro = 'todos' | 'estudiante' | 'visitante' | 'sin_equipo';

const FILTROS: { id: Filtro; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'estudiante', label: 'Estudiantes' },
  { id: 'visitante', label: 'Visitantes' },
  { id: 'sin_equipo', label: 'Sin equipo' }
];

type Props = {
  personas: PersonaPresente[];
  abierto: number | null;
  onAbrir: (id_registro: number | null) => void;
};

export const PersonasLaboratorio = ({ personas, abierto, onAbrir }: Props) => {
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const ahora = useAhora();

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return personas.filter((p) => {
      if (filtro === 'estudiante' && p.tipo !== 'estudiante') return false;
      if (filtro === 'visitante' && p.tipo !== 'visitante') return false;
      if (filtro === 'sin_equipo' && p.sesion) return false;
      if (!texto) return true;
      return p.nombre.toLowerCase().includes(texto) || p.codigo.toLowerCase().includes(texto);
    });
  }, [personas, busqueda, filtro]);

  return (
    <section className="tarjeta">
      <header className="tarjeta__cabecera">
        <h2 className="tarjeta__titulo">
          Personas en el laboratorio <span className="tarjeta__conteo">{personas.length}</span>
        </h2>
      </header>

      <div className="herramientas">
        <label className="buscador">
          <IconoBuscar size={18} />
          <input
            type="search"
            placeholder="Buscar por nombre o código"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar persona"
          />
        </label>
        <div className="filtros" role="group" aria-label="Filtrar personas">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`filtro ${filtro === f.id ? 'filtro--activo' : ''}`}
              aria-pressed={filtro === f.id}
              onClick={() => setFiltro(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {visibles.length === 0 ? (
        <p className="vacio">
          {personas.length === 0
            ? 'Todavía no hay personas en el laboratorio.'
            : 'Ninguna persona coincide con la búsqueda.'}
        </p>
      ) : (
        <ul className="personas">
          {visibles.map((p) => {
            const id = p.registro.id_registro;
            const estaAbierto = abierto === id;
            const r = p.registro;
            return (
              <li key={id} className={`persona ${estaAbierto ? 'persona--abierta' : ''}`}>
                <button
                  type="button"
                  className="persona__cabecera"
                  aria-expanded={estaAbierto}
                  aria-controls={`detalle-${id}`}
                  onClick={() => onAbrir(estaAbierto ? null : id)}
                >
                  <span className="persona__identidad">
                    <span className="persona__nombre">{p.nombre}</span>
                    <span className="persona__codigo">{p.codigo}</span>
                  </span>

                  <span className={`insignia insignia--${p.tipo}`}>
                    {p.tipo === 'estudiante' ? 'Estudiante' : 'Visitante'}
                  </span>

                  <span className="persona__entrada">
                    Entró {formatHora(r.hora_entrada)}
                    <span className="persona__tiempo">{hace(r.hora_entrada, ahora)}</span>
                  </span>

                  {p.sesion ? (
                    <span className="insignia insignia--equipo">PC {p.sesion.numero_equipo}</span>
                  ) : (
                    <span className="insignia insignia--sin-equipo">Sin equipo</span>
                  )}

                  <span className="chip-origen">{nombreOrigen(r.origen_registro)}</span>

                  <span className="persona__flecha" aria-hidden="true">
                    <IconoChevron size={18} />
                  </span>
                </button>

                {estaAbierto && (
                  <div className="persona__detalle" id={`detalle-${id}`}>
                    <DetalleBloque titulo="Datos de la persona">
                      {p.tipo === 'estudiante' ? (
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
                          <Dato
                            etiqueta="Código válido hasta"
                            valor={r.timestamp_expiracion ? formatHora(r.timestamp_expiracion) : null}
                          />
                        </>
                      )}
                    </DetalleBloque>

                    <DetalleBloque titulo="Equipo">
                      {p.sesion ? (
                        <>
                          <Dato etiqueta="Equipo" valor={`PC ${p.sesion.numero_equipo}`} />
                          <Dato
                            etiqueta="Sesión iniciada"
                            valor={`${formatHora(p.sesion.hora_inicio)} (${duracion(p.sesion.hora_inicio, ahora)})`}
                          />
                          <Dato etiqueta="IP del equipo" valor={p.sesion.ip_origen} tecnico />
                        </>
                      ) : (
                        <p className="detalle__nota">No tiene una sesión iniciada en ningún equipo.</p>
                      )}
                    </DetalleBloque>

                    <DetalleBloque titulo="Registro de entrada">
                      <Dato etiqueta="Origen" valor={nombreOrigen(r.origen_registro)} />
                      <Dato etiqueta="IP del dispositivo" valor={r.ip_origen} tecnico />
                      <Dato etiqueta="Hora de entrada" valor={formatHora(r.hora_entrada)} />
                    </DetalleBloque>
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

const DetalleBloque = ({ titulo, children }: { titulo: string; children: React.ReactNode }) => (
  <div className="detalle">
    <h3 className="detalle__titulo">{titulo}</h3>
    <dl className="detalle__lista">{children}</dl>
  </div>
);

const Dato = ({ etiqueta, valor, tecnico }: { etiqueta: string; valor: string | null; tecnico?: boolean }) => (
  <div className="dato-fila">
    <dt>{etiqueta}</dt>
    <dd className={tecnico ? 'dato-fila__tecnico' : undefined}>
      {valor ? valor : <span className="dato-fila__vacio">No registrada</span>}
    </dd>
  </div>
);