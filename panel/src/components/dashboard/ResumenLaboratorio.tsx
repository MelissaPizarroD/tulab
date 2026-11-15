import type { EquipoLab, Novedad, PersonaPresente } from '../../types/laboratorio';

type Props = {
  personas: PersonaPresente[];
  equipos: EquipoLab[];
  novedades: Novedad[];
};

export const ResumenLaboratorio = ({ personas, equipos, novedades }: Props) => {
  const estudiantes = personas.filter((p) => p.tipo === 'estudiante').length;
  const visitantes = personas.length - estudiantes;
  const enUso = equipos.filter((e) => e.estado === 'en_uso').length;
  const disponibles = equipos.filter((e) => e.estado === 'disponible').length;
  const apagados = equipos.filter((e) => e.estado === 'apagado').length;

  return (
    <section className="resumen" aria-label="Resumen del laboratorio">
      <article className="dato">
        <p className="dato__titulo">Personas presentes</p>
        <p className="dato__valor">{personas.length}</p>
        <p className="dato__detalle">
          {estudiantes} {estudiantes === 1 ? 'estudiante' : 'estudiantes'} · {visitantes}{' '}
          {visitantes === 1 ? 'visitante' : 'visitantes'}
        </p>
      </article>

      <article className="dato">
        <p className="dato__titulo">Equipos en uso</p>
        <p className="dato__valor">
          {enUso}
          <span className="dato__total"> de {equipos.length}</span>
        </p>
        <p className="dato__detalle">Con sesión iniciada</p>
      </article>

      <article className="dato">
        <p className="dato__titulo">Equipos disponibles</p>
        <p className="dato__valor">{disponibles}</p>
        <p className="dato__detalle">
          {apagados} {apagados === 1 ? 'apagado' : 'apagados'}
        </p>
      </article>

      <article className={`dato ${novedades.length > 0 ? 'dato--aviso' : ''}`}>
        <p className="dato__titulo">Novedades del turno</p>
        <p className="dato__valor">{novedades.length}</p>
        <p className="dato__detalle">Reportadas desde los equipos</p>
      </article>
    </section>
  );
};