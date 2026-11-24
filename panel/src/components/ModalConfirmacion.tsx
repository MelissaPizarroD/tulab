import { useState } from 'react';
import { Modal } from './Modal';

type Props = {
  titulo: string;
  texto: React.ReactNode;
  textoConfirmar: string;
  onConfirmar: () => Promise<void>;
  onCerrar: () => void;
};

// Ventana para confirmar acciones que no se pueden deshacer, como eliminar
export const ModalConfirmacion = ({ titulo, texto, textoConfirmar, onConfirmar, onCerrar }: Props) => {
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');

  const confirmar = async () => {
    setProcesando(true);
    setError('');
    try {
      await onConfirmar();
      onCerrar();
    } catch (e: any) {
      setError(e.response?.data?.mensaje || 'No se pudo completar la acción.');
      setProcesando(false);
    }
  };

  return (
    <Modal titulo={titulo} onCerrar={onCerrar} bloqueado={procesando}>
      <p className="modal__texto">{texto}</p>
      {error && <p className="error-texto" role="alert">{error}</p>}
      <div className="modal__acciones">
        <button type="button" className="btn btn--secundario" onClick={onCerrar} disabled={procesando}>
          Cancelar
        </button>
        <button type="button" className="btn btn--peligro" onClick={confirmar} disabled={procesando}>
          {procesando ? 'Eliminando...' : textoConfirmar}
        </button>
      </div>
    </Modal>
  );
};
