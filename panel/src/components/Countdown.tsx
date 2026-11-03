import { useState, useEffect } from 'react';

export const Countdown = ({ timestamp_expiracion }: { timestamp_expiracion: string }) => {
  const calcularRestante = () => {
    const diff = new Date(timestamp_expiracion).getTime() - Date.now();
    if (diff <= 0) return null;
    const horas = Math.floor(diff / 3600000);
    const minutos = Math.floor((diff % 3600000) / 60000);
    const segundos = Math.floor((diff % 60000) / 1000);
    return { horas, minutos, segundos };
  };

  const [restante, setRestante] = useState(calcularRestante());

  useEffect(() => {
    const intervalo = setInterval(() => {
      setRestante(calcularRestante());
    }, 1000);
    return () => clearInterval(intervalo);
  }, [timestamp_expiracion]);

  if (!restante) {
    return (
      <span style={{ color: '#dc2626', fontSize: '13px', fontWeight: 'bold' }}>
        Código expirado
      </span>
    );
  }

  const urgente = restante.horas === 0 && restante.minutos < 30;

  return (
    <span style={{ color: urgente ? '#dc2626' : '#64748b', fontSize: '13px' }}>
      {restante.horas > 0 && `${restante.horas}h `}
      {String(restante.minutos).padStart(2, '0')}m {String(restante.segundos).padStart(2, '0')}s
      {' · '}
      Válido hasta: {new Date(timestamp_expiracion).toLocaleTimeString('es-CO', {
        hour: '2-digit', minute: '2-digit'
      })}
    </span>
  );
};