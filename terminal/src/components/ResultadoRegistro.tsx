type Props = {
  tipo: 'exito' | 'error';
  /** Mensaje del servidor (error) o aviso de guardado local (éxito offline). */
  mensaje?: string;
  onCerrar: () => void;
};

const TEXTO_EXITO = 'Tu registro se guardó correctamente.';
const TEXTO_ERROR = 'No pudimos guardar tu registro. Inténtalo de nuevo.';

export const ResultadoRegistro = ({ tipo, mensaje, onCerrar }: Props) => {
  const esExito = tipo === 'exito';

  return (
    <>
      <p className="terminal__subtitulo terminal__subtitulo--resultado">
        Consulta el resultado de tu registro.
      </p>

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

        <h2 className="resultado__titulo">
          {esExito ? '¡Registro exitoso!' : 'El registro falló'}
        </h2>

        <p className="resultado__texto">
          {esExito ? (mensaje ?? TEXTO_EXITO) : (mensaje || TEXTO_ERROR)}
          {esExito && !mensaje && (
            <>
              <br />
              Ya puedes continuar.
            </>
          )}
        </p>
      </section>

      {!esExito && (
        <p className="terminal__ayuda">
          Si el problema continúa, contacta al administrador.
        </p>
      )}
    </>
  );
};