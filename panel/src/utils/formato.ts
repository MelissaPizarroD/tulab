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

/** "2026-11-14" -> "14/11/2026" */
export const fechaCorta = (fecha: string) => fecha.slice(0, 10).split('-').reverse().join('/');

export const fechaLarga = (fecha: string) =>
  new Date(`${fecha.slice(0, 10)}T12:00:00`).toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

export const hoyISO = () => new Date().toLocaleDateString('en-CA');

export const mesActualISO = () => hoyISO().slice(0, 7);

/** "2026-11" -> { desde: "2026-11-01", hasta: "2026-11-30" } */
export const rangoDelMes = (mes: string) => {
  const [anio, m] = mes.split('-').map(Number);
  const ultimo = new Date(anio, m, 0).getDate();
  return { desde: `${mes}-01`, hasta: `${mes}-${String(ultimo).padStart(2, '0')}` };
};

export const nombreMes = (mes: string) => {
  const [anio, m] = mes.split('-').map(Number);
  const nombre = new Date(anio, m - 1, 1).toLocaleDateString('es-CO', { month: 'long' });
  return `${nombre} de ${anio}`;
};

export const formatMinutos = (min: number | null) => {
  if (min === null) return '-';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
};

export const formatHoraTexto = (hora: string | null | undefined) => (hora ? hora.slice(0, 5) : '-');

export const nombreMotivoCierre = (motivo: string | null) => {
  const nombres: Record<string, string> = {
    manual: 'Cerrada por la persona',
    inactividad: 'Por inactividad',
    cierre_turno: 'Cierre de turno',
    apagado_equipo: 'Apagado del equipo',
    salida_terminal: 'Salida registrada en la terminal'
  };
  return motivo ? nombres[motivo] ?? motivo : null;
};

export const nombreRecurso = (p: { nombre_recurso?: string | null; tipo_recurso?: string | null }) =>
  p.nombre_recurso || (p.tipo_recurso ? p.tipo_recurso.replace('_', ' ') : 'Recurso');

export const franjaRecurso = (p: { hora_estimada_disponibilidad: string | null; hora_fin?: string | null }) =>
  `${formatHoraTexto(p.hora_estimada_disponibilidad)}${p.hora_fin ? ' a ' + formatHoraTexto(p.hora_fin) : ''}`;