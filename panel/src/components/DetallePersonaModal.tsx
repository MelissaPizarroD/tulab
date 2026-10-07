interface Estudiante {
  tipo: 'estudiante';
  codigo_estudiantil: string;
  nombre: string;
  programa_academico: string;
  semestre: number;
  correo_institucional: string;
  telefono_contacto: string | null;
}

interface Visitante {
  tipo: 'visitante';
  nombre: string;
  codigo_temporal: string;
  email: string | null;
  telefono: string | null;
  institucion: string | null;
  motivo_visita: string | null;
  timestamp_expiracion: string;
}

type Persona = Estudiante | Visitante;

interface Props {
  persona: Persona;
  onCerrar: () => void;
}

export const DetallePersonaModal = ({ persona, onCerrar }: Props) => {
  const formatExpiracion = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('es-CO', {
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 100
    }}>
      <div style={{
        background: 'white', borderRadius: '12px',
        padding: '32px', width: '400px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', marginBottom: '24px'
        }}>
          <div>
            <span style={{
              display: 'inline-block', padding: '3px 10px',
              borderRadius: '12px', fontSize: '12px', fontWeight: 'bold',
              background: persona.tipo === 'estudiante' ? '#dbeafe' : '#f0fdf4',
              color: persona.tipo === 'estudiante' ? '#1d4ed8' : '#166534',
              marginBottom: '8px'
            }}>
              {persona.tipo === 'estudiante' ? 'Estudiante' : 'Visitante'}
            </span>
            <h3 style={{ margin: 0, color: '#1e293b' }}>{persona.nombre}</h3>
          </div>
          <button
            onClick={onCerrar}
            style={{
              background: 'none', border: 'none',
              fontSize: '20px', cursor: 'pointer',
              color: '#94a3b8', padding: '4px'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {persona.tipo === 'estudiante' ? (
            <>
              <Campo label="Código" valor={persona.codigo_estudiantil} />
              <Campo label="Programa" valor={persona.programa_academico} />
              <Campo label="Semestre" valor={String(persona.semestre)} />
              <Campo label="Correo" valor={persona.correo_institucional} />
              {persona.telefono_contacto && (
                <Campo label="Teléfono" valor={persona.telefono_contacto} />
              )}
            </>
          ) : (
            <>
              <Campo label="Código temporal" valor={persona.codigo_temporal} destacado />
              {persona.institucion && <Campo label="Institución" valor={persona.institucion} />}
              {persona.email && <Campo label="Correo" valor={persona.email} />}
              {persona.telefono && <Campo label="Teléfono" valor={persona.telefono} />}
              {persona.motivo_visita && <Campo label="Motivo" valor={persona.motivo_visita} />}
              <Campo
                label="Código válido hasta"
                valor={formatExpiracion(persona.timestamp_expiracion)}
              />
            </>
          )}
        </div>

        <button
          onClick={onCerrar}
          style={{
            width: '100%', marginTop: '24px', padding: '10px',
            borderRadius: '8px', border: '1px solid #e2e8f0',
            background: '#f8fafc', cursor: 'pointer',
            fontSize: '14px', color: '#475569'
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

const Campo = ({ label, valor, destacado }: { label: string; valor: string; destacado?: boolean }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '10px 12px',
    background: '#f8fafc', borderRadius: '8px'
  }}>
    <span style={{ color: '#64748b', fontSize: '13px' }}>{label}</span>
    <span style={{
      color: destacado ? '#166534' : '#1e293b',
      fontWeight: destacado ? 'bold' : 'normal',
      fontSize: destacado ? '18px' : '14px',
      letterSpacing: destacado ? '4px' : 'normal'
    }}>
      {valor}
    </span>
  </div>
);