import { useEffect } from 'react';

type Props = {
  valor: string;
  onChange: (valor: string) => void;
  onConfirmar: () => void;
  onLimpiar: () => void;
  disabled?: boolean;
  textoConfirmar?: string;
};

const LONGITUD_MAXIMA = 10;
const DIGITOS_SUPERIORES = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

export const TecladoNumerico = ({
  valor,
  onChange,
  onConfirmar,
  onLimpiar,
  disabled = false,
  textoConfirmar = 'Iniciar sesión'
}: Props) => {
  const agregar = (digito: string) => {
    if (valor.length < LONGITUD_MAXIMA) onChange(valor + digito);
  };
  const borrar = () => onChange(valor.slice(0, -1));

  // Teclado físico del computador
  useEffect(() => {
    if (disabled) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) agregar(e.key);
      else if (e.key === 'Backspace') borrar();
      else if (e.key === 'Escape') onLimpiar();
      else if (e.key === 'Enter' && valor) onConfirmar();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  return (
    <div>
      <span className="codigo__etiqueta" id="etiqueta-codigo">
        Código estudiantil o de visitante.
      </span>
      <output className="codigo__valor" aria-labelledby="etiqueta-codigo">
        {valor}
      </output>

      <div className="teclado">
        {DIGITOS_SUPERIORES.map((d) => (
          <button key={d} type="button" className="tecla" disabled={disabled} onClick={() => agregar(d)}>
            {d}
          </button>
        ))}
        <button type="button" className="tecla tecla--accion" disabled={disabled} onClick={onLimpiar}>
          Limpiar
        </button>
        <button type="button" className="tecla" disabled={disabled} onClick={() => agregar('0')}>
          0
        </button>
        <button type="button" className="tecla tecla--accion" disabled={disabled} onClick={borrar}>
          Borrar
        </button>
      </div>

      <button
        type="button"
        className="boton boton--primario boton--grande"
        onClick={onConfirmar}
        disabled={disabled || valor.length === 0}
      >
        {disabled ? 'Procesando...' : textoConfirmar}
      </button>
    </div>
  );
};