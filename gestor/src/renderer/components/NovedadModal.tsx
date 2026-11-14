import { useState } from 'react';
import { reportarNovedad } from '../services/sesionService';

type Props = {
  id_equipo: number;
  onCerrar: () => void;
}

export const NovedadModal = ({ id_equipo, onCerrar }: Props) => {
  const [descripcion, setDescripcion] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState('');

  const handleEnviar = async () => {
    if (!descripcion.trim() || enviando) return;
    setEnviando(true);
    setError('');
    const resultado = await reportarNovedad(id_equipo, descripcion);
    if (resultado.exito) {
      setExito(true);
      setTimeout(onCerrar, 2000);
    } else {
      setError(resultado.mensaje || 'Error al reportar');
      setEnviando(false);
    }
  };

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="titulo-novedad">
      <div className="modal__caja">
        {exito ? (
          <div className="modal__exito" role="status">
            <div className="resultado__icono" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12.5l5 5L20 6.5" />
              </svg>
            </div>
            <h2 className="resultado__titulo" id="titulo-novedad">¡Novedad reportada!</h2>
            <p className="resultado__texto">Gracias por avisar. El encargado de sala ya puede verla.</p>
          </div>
        ) : (
          <>
            <h2 className="modal__titulo" id="titulo-novedad">Reportar novedad</h2>
            <p className="modal__texto">Cuéntanos qué pasa con este equipo.</p>

            <textarea
              className="campo campo--area"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe el problema del equipo..."
              rows={5}
              autoFocus
            />

            {error && <p className="mensaje-error" role="alert">{error}</p>}

            <div className="acciones">
              <button type="button" className="boton boton--neutro" onClick={onCerrar}>
                Cancelar
              </button>
              <button
                type="button"
                className="boton boton--primario"
                onClick={handleEnviar}
                disabled={enviando || !descripcion.trim()}
              >
                {enviando ? 'Enviando...' : 'Reportar'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};