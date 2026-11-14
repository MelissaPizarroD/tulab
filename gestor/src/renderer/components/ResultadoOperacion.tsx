type Props = {
  tipo: 'exito' | 'error';
  titulo: string;
  mensaje: string;
  subtitulo?: string;
  /** Texto pequeño bajo la tarjeta (se usa en errores). */
  pie?: string;
  onCerrar: () => void;
};

export const ResultadoOperacion = ({
  tipo,
  titulo,
  mensaje,
  subtitulo = 'Consulta el resultado de tu sesión.',
  pie,
  onCerrar
}: Props) => {
  const esExito = tipo === 'exito';

  return (
    <>
      <p className="gestor__subtitulo gestor__subtitulo--resultado">{subtitulo}</p>

      {/* Tocar la tarjeta la cierra antes de que termine el temporizador */}
      <section
        className={`resultado ${esExito ? '' : 'resultado--error'}`}
        role="alert"
        onClick={onCerrar}
      >
        <div className="resultado__icono" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            {esExito ? <path d="M4 12.5l5 5L20 6.5" /> : <path d="M6 6l12 12M18 6L6 18" />}
          </svg>
        </div>
        <h2 className="resultado__titulo">{titulo}</h2>
        <p className="resultado__texto">{mensaje}</p>
      </section>

      {pie && <p className="gestor__ayuda">{pie}</p>}
    </>
  );
};