import type { Novedad } from '../../types/laboratorio';
import { formatHora } from '../../utils/formato';

export const NovedadesTurno = ({ novedades }: { novedades: Novedad[] }) => (
  <section className="tarjeta">
    <header className="tarjeta__cabecera">
      <h2 className="tarjeta__titulo">
        Novedades de equipos <span className="tarjeta__conteo">{novedades.length}</span>
      </h2>
    </header>

    {novedades.length === 0 ? (
      <p className="vacio">No se han reportado novedades en este turno.</p>
    ) : (
      <ul className="novedades">
        {novedades.map((n) => (
          <li key={n.id_novedad} className="novedad">
            <div className="novedad__cabecera">
              <span className="insignia insignia--aviso">PC {n.numero_equipo}</span>
              <span className="novedad__hora">{formatHora(n.timestamp_reporte)}</span>
            </div>
            <p className="novedad__texto">{n.descripcion}</p>
            <p className="novedad__autor">{n.nombre_estudiante || n.nombre_visitante || n.codigo_estudiantil}</p>
          </li>
        ))}
      </ul>
    )}
  </section>
);