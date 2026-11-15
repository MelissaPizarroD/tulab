import { useEffect, useState } from 'react';

/** Devuelve la hora actual (ms) y se actualiza cada cierto tiempo, para tiempos transcurridos en vivo. */
export const useAhora = (cadaMs = 30000) => {
  const [ahora, setAhora] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), cadaMs);
    return () => clearInterval(t);
  }, [cadaMs]);

  return ahora;
};