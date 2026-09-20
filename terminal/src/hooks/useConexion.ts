import { useState, useEffect } from 'react';
import { verificarConexion } from '../services/api';
import { sincronizarPendientes } from '../services/sincronizacion';

export const useConexion = () => {
  const [conectado, setConectado] = useState(true);

  useEffect(() => {
    const verificar = async () => {
      const estado = await verificarConexion();
      if (estado && !conectado) {
        await sincronizarPendientes();
      }
      setConectado(estado);
    };

    verificar();
    const intervalo = setInterval(verificar, 10000);
    return () => clearInterval(intervalo);
  }, [conectado]);

  return { conectado };
};