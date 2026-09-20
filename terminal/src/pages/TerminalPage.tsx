import { useState } from 'react';
import { TecladoNumerico } from '../components/TecladoNumerico';
import { registrarEntrada, registrarSalida } from '../services/registroService';
import { useConexion } from '../hooks/useConexion';

type Modo = 'entrada' | 'salida';
type EstadoOperacion = 'idle' | 'cargando' | 'exito' | 'error';

export const TerminalPage = () => {
  const [codigo, setCodigo] = useState('');
  const [modo, setModo] = useState<Modo>('entrada');
  const [estado, setEstado] = useState<EstadoOperacion>('idle');
  const [mensaje, setMensaje] = useState('');
  const { conectado } = useConexion();

  const handleConfirmar = async () => {
    if (!codigo) return;
    setEstado('cargando');

    const resultado = modo === 'entrada'
      ? await registrarEntrada(codigo)
      : await registrarSalida(codigo);

    if (resultado.exito) {
      setEstado('exito');
      setMensaje(resultado.offline
        ? 'Registrado localmente. Se sincronizará cuando haya conexión.'
        : modo === 'entrada' ? '¡Entrada registrada!' : '¡Salida registrada!'
      );
    } else {
      setEstado('error');
      setMensaje(resultado.mensaje || 'Error al procesar');
    }

    setCodigo('');
    setTimeout(() => {
      setEstado('idle');
      setMensaje('');
    }, 3000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc',
      padding: '24px'
    }}>
      <div style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        padding: '6px 12px',
        borderRadius: '20px',
        background: conectado ? '#dcfce7' : '#fee2e2',
        color: conectado ? '#166534' : '#991b1b',
        fontSize: '14px',
        fontWeight: 'bold'
      }}>
        {conectado ? 'En línea' : 'Sin conexión'}
      </div>

      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#1e293b' }}>
        Laboratorio de Informática
      </h1>
      <p style={{ color: '#64748b', marginBottom: '32px' }}>
        Ingresa tu código para registrar tu {modo === 'entrada' ? 'entrada' : 'salida'}
      </p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
        <button
          onClick={() => setModo('entrada')}
          style={{
            padding: '10px 24px',
            borderRadius: '8px',
            border: 'none',
            background: modo === 'entrada' ? '#2563eb' : '#e2e8f0',
            color: modo === 'entrada' ? 'white' : '#475569',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Entrada
        </button>
        <button
          onClick={() => setModo('salida')}
          style={{
            padding: '10px 24px',
            borderRadius: '8px',
            border: 'none',
            background: modo === 'salida' ? '#2563eb' : '#e2e8f0',
            color: modo === 'salida' ? 'white' : '#475569',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Salida
        </button>
      </div>

      {estado === 'idle' || estado === 'cargando' ? (
        <TecladoNumerico
          valor={codigo}
          onChange={setCodigo}
          onConfirmar={handleConfirmar}
          onLimpiar={() => setCodigo('')}
        />
      ) : (
        <div style={{
          padding: '32px 48px',
          borderRadius: '12px',
          background: estado === 'exito' ? '#dcfce7' : '#fee2e2',
          color: estado === 'exito' ? '#166534' : '#991b1b',
          fontSize: '20px',
          fontWeight: 'bold',
          textAlign: 'center',
          maxWidth: '320px'
        }}>
          {estado === 'exito' ? '✓' : '✗'} {mensaje}
        </div>
      )}

      {estado === 'cargando' && (
        <p style={{ marginTop: '16px', color: '#64748b' }}>Procesando...</p>
      )}
    </div>
  );
};