import { useState } from 'react';
import { Layout } from '../components/Layout';
import { RegistrosHistorico } from '../components/historicos/RegistrosHistorico';
import { TurnosHistorico } from '../components/historicos/TurnosHistorico';
import { ResumenesHistorico } from '../components/historicos/ResumenesHistorico';

type Pestana = 'registros' | 'turnos' | 'resumenes';

const PESTANAS: { id: Pestana; texto: string }[] = [
  { id: 'registros', texto: 'Registros de acceso' },
  { id: 'turnos', texto: 'Turnos y bitácora' },
  { id: 'resumenes', texto: 'Resúmenes' }
];

export const HistoricosPage = () => {
  const [pestana, setPestana] = useState<Pestana>('registros');

  return (
    <Layout>
      <div className="pagina">
        <header className="pagina__encabezado">
          <h1 className="pagina__titulo">Históricos</h1>
        </header>

        <div className="pestanas" role="tablist" aria-label="Secciones de históricos">
          {PESTANAS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={pestana === p.id}
              className={`pestana ${pestana === p.id ? 'pestana--activa' : ''}`}
              onClick={() => setPestana(p.id)}
            >
              {p.texto}
            </button>
          ))}
        </div>

        {pestana === 'registros' && <RegistrosHistorico />}
        {pestana === 'turnos' && <TurnosHistorico />}
        {pestana === 'resumenes' && <ResumenesHistorico />}
      </div>
    </Layout>
  );
};