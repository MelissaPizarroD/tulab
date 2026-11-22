import { useState } from 'react';
import { Modal } from './Modal';
import { api } from '../services/api';

type Props = {
  id_encargado: number;
  nombre_encargado: string;
  onCerrar: () => void;
  onConfirmado: () => void;
};

export const ModalAperturaTurno = ({ nombre_encargado, onCerrar, onConfirmado }: Props) => {
  const [observaciones, setObservaciones] = useState('');
  const [abriendo, setAbriendo] = useState(false);
  const [error, setError] = useState('');

  const confirmar = async () => {
    setAbriendo(true);
    setError('');
    try {
      await api.post('/api/turnos', {
        observaciones_apertura: observaciones.trim()
      });
      onConfirmado();
    } catch (e: any) {
      setError(e.response?.data?.mensaje || 'No se pudo abrir el turno.');
      setAbriendo(false);
    }
  };

  return (
    <Modal titulo="Abrir turno" onCerrar={onCerrar} bloqueado={abriendo}>
      <p className="modal__texto">
        El turno quedará a nombre de <strong>{nombre_encargado}</strong>. Todo lo que se registre mientras esté abierto se asocia a tu cuenta.
      </p>

      <label className="campo">
        <span className="campo__etiqueta">Observaciones de apertura (opcional)</span>
        <textarea
          className="entrada"
          rows={3}
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Estado del laboratorio al recibirlo, pendientes del turno anterior"
          autoFocus
        />
      </label>

      {error && <p className="error-texto" role="alert">{error}</p>}

      <div className="modal__acciones">
        <button type="button" className="btn btn--secundario" onClick={onCerrar} disabled={abriendo}>
          Cancelar
        </button>
        <button type="button" className="btn btn--primario" onClick={confirmar} disabled={abriendo}>
          {abriendo ? 'Abriendo...' : 'Abrir turno'}
        </button>
      </div>
    </Modal>
  );
};