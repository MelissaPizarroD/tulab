import { useEffect, useRef } from 'react';

type Props = {
  titulo: string;
  onCerrar: () => void;
  bloqueado?: boolean;
  children: React.ReactNode;
};

export const Modal = ({ titulo, onCerrar, bloqueado = false, children }: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !bloqueado) onCerrar();
    };
    document.addEventListener('keydown', alTeclear);
    return () => document.removeEventListener('keydown', alTeclear);
  }, [onCerrar, bloqueado]);

  return (
    <div className="modal-fondo" onMouseDown={(e) => e.target === e.currentTarget && !bloqueado && onCerrar()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={titulo} tabIndex={-1} ref={ref}>
        <h2 className="modal__titulo">{titulo}</h2>
        {children}
      </div>
    </div>
  );
};