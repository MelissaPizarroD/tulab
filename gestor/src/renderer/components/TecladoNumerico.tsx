type Props = {
  valor: string;
  onChange: (valor: string) => void;
  onConfirmar: () => void;
  onLimpiar: () => void;
  disabled?: boolean;
}

const teclas = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

export const TecladoNumerico = ({ valor, onChange, onConfirmar, onLimpiar, disabled }: Props) => {
  const handleTecla = (tecla: string) => {
    if (disabled) return;
    if (tecla === '⌫') {
      onChange(valor.slice(0, -1));
    } else if (tecla === '') {
      return;
    } else {
      if (valor.length < 10) {
        onChange(valor + tecla);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div style={{
        fontSize: '32px',
        letterSpacing: '8px',
        padding: '16px 32px',
        background: '#f0f0f0',
        borderRadius: '8px',
        minWidth: '240px',
        textAlign: 'center',
        minHeight: '64px'
      }}>
        {valor || ' '}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 80px)', gap: '8px' }}>
        {teclas.map((tecla, i) => (
          <button
            key={i}
            onClick={() => handleTecla(tecla)}
            disabled={disabled || tecla === ''}
            style={{
              height: '80px',
              fontSize: '24px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              background: tecla === '⌫' ? '#fee2e2' : tecla === '' ? 'transparent' : 'white',
              cursor: disabled || tecla === '' ? 'default' : 'pointer',
              visibility: tecla === '' ? 'hidden' : 'visible',
              opacity: disabled ? 0.5 : 1
            }}
          >
            {tecla}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <button
          onClick={onLimpiar}
          disabled={disabled}
          style={{
            padding: '12px 32px',
            fontSize: '16px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            background: '#f0f0f0',
            cursor: disabled ? 'default' : 'pointer',
            opacity: disabled ? 0.5 : 1
          }}
        >
          Limpiar
        </button>
        <button
          onClick={onConfirmar}
          disabled={disabled || valor.length === 0}
          style={{
            padding: '12px 32px',
            fontSize: '16px',
            borderRadius: '8px',
            border: 'none',
            background: disabled || valor.length === 0 ? '#ccc' : '#2563eb',
            color: 'white',
            cursor: disabled || valor.length === 0 ? 'default' : 'pointer'
          }}
        >
          Confirmar
        </button>
      </div>
    </div>
  );
};