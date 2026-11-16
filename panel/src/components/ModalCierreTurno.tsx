import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { api } from '../services/api';

type Props = {
  id_turno: number;
  id_encargado: number;
  onCerrar: () => void;
  onConfirmado: () => void;
};

export const ModalCierreTurno = ({ id_turno, id_encargado, onCerrar, onConfirmado }: Props) => {
  const [personas, setPersonas] = useState<number | null>(null);
  const [sesiones, setSesiones] = useState<number | null>(null);
  const [observaciones, setObservaciones] = useState('');
  const [cerrando, setCerrando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarResumen = async () => {
      try {
        const [r, s] = await Promise.all([
          api.get(`/api/registros-acceso/turno/${id_turno}`),
          api.get(`/api/sesiones/turno/${id_turno}`)
        ]);
        setPersonas(r.data.length);
        setSesiones(s.data.length);
      } catch {
        // si no se puede cargar el resumen, igual se puede cerrar el turno
      }
    };
    cargarResumen();
  }, [id_turno]);

  const confirmar = async () => {
    setCerrando(true);
    setError('');
    try {
      await api.patch(`/api/turnos/${id_turno}/cerrar`, {
        id_encargado_cierre: id_encargado,
        observaciones_cierre: observaciones.trim()
      });
      onConfirmado();
    } catch (e: any) {
      setError(e.response?.data?.mensaje || 'No se pudo cerrar el turno.');
      setCerrando(false);
    }
  };

  return (
    <Modal titulo="Cerrar turno" onCerrar={onCerrar} bloqueado={cerrando}>
      <p className="modal__texto">
        Al cerrar el turno se terminan todas las sesiones activas y se registra la salida de las personas que siguen en el laboratorio.
      </p>

      <div className="modal__cifras">
        <div className="modal__cifra">
          <span className="modal__valor">{personas ?? '-'}</span>
          <span className="modal__etiqueta">Personas en el laboratorio</span>
        </div>
        <div className="modal__cifra">
          <span className="modal__valor">{sesiones ?? '-'}</span>
          <span className="modal__etiqueta">Sesiones abiertas</span>
        </div>
      </div>

      <label className="campo">
        <span className="campo__etiqueta">Observaciones del cierre (opcional)</span>
        <textarea
          className="entrada"
          rows={3}
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Notas para el siguiente turno"
        />
      </label>

      {error && <p className="error-texto" role="alert">{error}</p>}

      <div className="modal__acciones">
        <button type="button" className="btn btn--secundario" onClick={onCerrar} disabled={cerrando}>
          Cancelar
        </button>
        <button type="button" className="btn btn--peligro" onClick={confirmar} disabled={cerrando}>
          {cerrando ? 'Cerrando...' : 'Cerrar turno'}
        </button>
      </div>
    </Modal>
  );
};