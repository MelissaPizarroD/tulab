export const DetalleBloque = ({ titulo, children }: { titulo: string; children: React.ReactNode }) => (
  <div className="detalle">
    <h3 className="detalle__titulo">{titulo}</h3>
    <dl className="detalle__lista">{children}</dl>
  </div>
);

export const Dato = ({ etiqueta, valor, tecnico }: { etiqueta: string; valor: string | null; tecnico?: boolean }) => (
  <div className="dato-fila">
    <dt>{etiqueta}</dt>
    <dd className={tecnico ? 'dato-fila__tecnico' : undefined}>
      {valor ? valor : <span className="dato-fila__vacio">No registrada</span>}
    </dd>
  </div>
);