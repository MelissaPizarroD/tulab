import { useEffect, useState } from 'react';
import { socket } from '../services/api';

export const useSocket = () => {
  const [conectado, setConectado] = useState(socket.connected);

  useEffect(() => {
    socket.on('connect', () => setConectado(true));
    socket.on('disconnect', () => setConectado(false));

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  return { socket, conectado };
};