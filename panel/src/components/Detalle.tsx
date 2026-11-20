import { Fragment } from 'react';
import type { SesionRegistro } from '../types/laboratorio';
import { duracion, formatHora, nombreMotivoCierre } from '../utils/formato';


export const DetalleBloque = ({ titulo, children }: { titulo: string; children: React.ReactNode }) => (
  <div className="detalle">
    <h3 className="detalle__titulo">{titulo}</h3>
    <dl className="detalle__lista">{children}</dl>
  </div>
);

export const Dato = ({ etiqueta, valor, tecnico }: { etiqueta: string; valor: string | null; tecnico?: boolean }) => (
  <div className="dato-fila">
    <dt>{etiqueta}</dt>
    <dd className={tecnico ? 'dato-fila__tecnico' : undefined}>
      {valor ? valor : <span className="dato-fila__vacio">No registrada</span>}
    </dd>
  </div>
);

export const FilasSesiones = ({ sesiones, ahora }: { sesiones: SesionRegistro[]; ahora: number }) => (
  <>
    {sesiones.map((s) => {
      const fin = s.hora_cierre ? new Date(s.hora_cierre).getTime() : ahora;
      return (
        <Fragment key={s.id_sesion}>
          <Dato
            etiqueta={`PC ${s.numero_equipo}`}
            valor={`${formatHora(s.hora_inicio)} a ${s.hora_cierre ? formatHora(s.hora_cierre) : 'en curso'} · ${duracion(s.hora_inicio, fin)}`}
          />
          {s.hora_cierre && (
            <Dato etiqueta="Motivo de cierre" valor={nombreMotivoCierre(s.motivo_cierre)} />
          )}
          <Dato etiqueta="IP del equipo" valor={s.ip_origen} tecnico />
        </Fragment>
      );
    })}
  </>
);