type Props = {
  conectado: boolean;
  /** Texto extra cuando no hay conexión (por ejemplo, la URL del servidor). */
  detalle?: string;
};

export const IndicadorConexion = ({ conectado, detalle }: Props) => (
  <div
    className={`conexion ${conectado ? '' : 'conexion--offline'}`}
    role="status"
    aria-live="polite"
  >
    <span className="conexion__punto" aria-hidden="true" />
    {conectado ? 'En línea' : detalle ? `Sin conexión (${detalle})` : 'Sin conexión'}
  </div>
);