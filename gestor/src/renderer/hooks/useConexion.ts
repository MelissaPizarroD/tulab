import { useState, useEffect, useRef } from 'react';
import { verificarConexion } from '../services/api';
import { sincronizarPendientes } from '../services/sincronizacion';

export const useConexion = () => {
  const [conectado, setConectado] = useState(true);
  const estabaConectado = useRef(false);

  useEffect(() => {
    const verificar = async () => {
      const estado = await verificarConexion();
      // Sincroniza al volver la conexión y también al abrir la app con pendientes guardados
      if (estado && !estabaConectado.current) {
        await sincronizarPendientes();
      }
      estabaConectado.current = estado;
      setConectado(estado);
    };

    verificar();
    const intervalo = setInterval(verificar, 10000);
    return () => clearInterval(intervalo);
  }, []);

  return { conectado };
};