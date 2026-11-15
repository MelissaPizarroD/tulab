import type { EquipoLab, EstadoEquipo } from '../../types/laboratorio';
import { IconoAlerta } from '../Iconos';

const ETIQUETAS: Record<EstadoEquipo, string> = {
  disponible: 'Disponible',
  en_uso: 'En uso',
  apagado: 'Apagado'
};

type Props = {
  equipos: EquipoLab[];
  onSeleccionarRegistro: (id_registro: number) => void;
};

export const MapaEquipos = ({ equipos, onSeleccionarRegistro }: Props) => (
  <section className="tarjeta">
    <header className="tarjeta__cabecera">
      <h2 className="tarjeta__titulo">Equipos</h2>
    </header>

    <ul className="leyenda">
      {(Object.keys(ETIQUETAS) as EstadoEquipo[]).map((estado) => (
        <li key={estado}>
          <span className={`leyenda__punto leyenda__punto--${estado}`} />
          {ETIQUETAS[estado]}
        </li>
      ))}
    </ul>

    {equipos.length === 0 ? (
      <p className="vacio">No hay equipos registrados.</p>
    ) : (
      <div className="equipos">
        {equipos.map((e) => {
          const contenido = (
            <>
              <span className="equipo__numero">PC {e.numero_equipo}</span>
              <span className="equipo__estado">{ETIQUETAS[e.estado]}</span>
              {e.tieneNovedad && (
                <span className="equipo__aviso" title="Tiene una novedad reportada en este turno">
                  <IconoAlerta size={14} />
                </span>
              )}
            </>
          );

          // si está en uso, al tocarlo se abre el detalle de la persona en la lista
          if (e.persona) {
            return (
              <button
                key={e.id_dispositivo}
                type="button"
                className={`equipo equipo--${e.estado} equipo--clic`}
                onClick={() => onSeleccionarRegistro(e.persona!.registro.id_registro)}
                title={`PC ${e.numero_equipo} en uso por ${e.persona.nombre}`}
                aria-label={`PC ${e.numero_equipo}, en uso por ${e.persona.nombre}. Ver detalle`}
              >
                {contenido}
              </button>
            );
          }
          return (
            <div key={e.id_dispositivo} className={`equipo equipo--${e.estado}`}>
              {contenido}
            </div>
          );
        })}
      </div>
    )}
  </section>
);