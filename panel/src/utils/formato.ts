export const formatHora = (iso: string) =>
  new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

/** Duración legible entre una fecha y ahora: "5 min", "1 h 20 min". */
export const duracion = (iso: string, ahora: number) => {
  const min = Math.max(0, Math.floor((ahora - new Date(iso).getTime()) / 60000));
  if (min < 1) return 'menos de 1 min';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
};

export const hace = (iso: string, ahora: number) => {
  const d = duracion(iso, ahora);
  return d === 'menos de 1 min' ? 'hace un momento' : `hace ${d}`;
};

export const nombreOrigen = (origen: string) => {
  if (!origen) return 'Desconocido';
  if (origen === 'terminal') return 'Terminal';
  return origen.charAt(0).toUpperCase() + origen.slice(1);
};