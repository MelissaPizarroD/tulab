import { useState, useEffect } from 'react';
import { verificarConexion } from '../services/api';

export const useConexion = () => {
  const [conectado, setConectado] = useState(true);

  useEffect(() => {
    const verificar = async () => {
      const estado = await verificarConexion();
      setConectado(estado);
    };

    verificar();
    const intervalo = setInterval(verificar, 10000);
    return () => clearInterval(intervalo);
  }, []);

  return { conectado };
};