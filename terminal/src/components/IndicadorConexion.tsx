type Props = {
  conectado: boolean;
};

export const IndicadorConexion = ({ conectado }: Props) => (
  <div
    className={`conexion ${conectado ? '' : 'conexion--offline'}`}
    role="status"
    aria-live="polite"
  >
    <span className="conexion__punto" aria-hidden="true" />
    {conectado ? 'En línea' : 'Sin conexión'}
  </div>
);