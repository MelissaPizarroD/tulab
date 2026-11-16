import type { DatosReporte, TurnoHistorico } from '../types/historico';

export interface FilaDia {
  fecha: string;
  turnos: number;
  registros: number;
  estudiantes: number;
  visitantes: number;
  promedioMin: number | null;
}

export interface Estadisticas {
  totalRegistros: number;
  estudiantes: number;
  visitantes: number;
  turnos: number;
  novedades: number;
  entradasBitacora: number;
  promedioMin: number | null;
  porHora: number[];
  horaPico: { hora: number; cantidad: number } | null;
  porPrograma: { programa: string; cantidad: number }[];
  porEquipo: { numero_equipo: number; sesiones: number; minutos: number }[];
  novedadesPorEquipo: { numero_equipo: number; cantidad: number }[];
  porDia: FilaDia[];
}

const minutosEntre = (a: string, b: string) =>
  Math.max(0, (new Date(b).getTime() - new Date(a).getTime()) / 60000);

const promedio = (valores: number[]) =>
  valores.length ? Math.round(valores.reduce((s, v) => s + v, 0) / valores.length) : null;

export const calcularEstadisticas = (d: DatosReporte): Estadisticas => {
  const regs = d.registros;
  const estudiantes = regs.filter((r) => r.codigo_estudiantil).length;
  const duraciones = regs.filter((r) => r.hora_salida).map((r) => minutosEntre(r.hora_entrada, r.hora_salida!));

  const porHora = Array(24).fill(0) as number[];
  regs.forEach((r) => {
    porHora[new Date(r.hora_entrada).getHours()]++;
  });
  const max = Math.max(...porHora);
  const horaPico = max > 0 ? { hora: porHora.indexOf(max), cantidad: max } : null;

  const programas = new Map<string, number>();
  regs.forEach((r) => {
    if (r.codigo_estudiantil) {
      const p = r.programa_academico || 'Sin programa';
      programas.set(p, (programas.get(p) || 0) + 1);
    }
  });

  const equipos = new Map<number, { sesiones: number; minutos: number }>();
  d.sesiones.forEach((s) => {
    const actual = equipos.get(s.numero_equipo) || { sesiones: 0, minutos: 0 };
    actual.sesiones++;
    if (s.hora_cierre) actual.minutos += minutosEntre(s.hora_inicio, s.hora_cierre);
    equipos.set(s.numero_equipo, actual);
  });

  const novEquipo = new Map<number, number>();
  d.novedades.forEach((n) => novEquipo.set(n.numero_equipo, (novEquipo.get(n.numero_equipo) || 0) + 1));

  const fechas = new Set<string>([...d.turnos.map((t) => t.fecha_turno), ...regs.map((r) => r.fecha_turno)]);
  const porDia: FilaDia[] = [...fechas].sort().map((fecha) => {
    const delDia = regs.filter((r) => r.fecha_turno === fecha);
    const est = delDia.filter((r) => r.codigo_estudiantil).length;
    return {
      fecha,
      turnos: d.turnos.filter((t) => t.fecha_turno === fecha).length,
      registros: delDia.length,
      estudiantes: est,
      visitantes: delDia.length - est,
      promedioMin: promedio(delDia.filter((r) => r.hora_salida).map((r) => minutosEntre(r.hora_entrada, r.hora_salida!)))
    };
  });

  return {
    totalRegistros: regs.length,
    estudiantes,
    visitantes: regs.length - estudiantes,
    turnos: d.turnos.length,
    novedades: d.novedades.length,
    entradasBitacora: d.bitacora.length,
    promedioMin: promedio(duraciones),
    porHora,
    horaPico,
    porPrograma: [...programas].map(([programa, cantidad]) => ({ programa, cantidad })).sort((a, b) => b.cantidad - a.cantidad),
    porEquipo: [...equipos]
      .map(([numero_equipo, v]) => ({ numero_equipo, ...v }))
      .sort((a, b) => b.sesiones - a.sesiones),
    novedadesPorEquipo: [...novEquipo]
      .map(([numero_equipo, cantidad]) => ({ numero_equipo, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad),
    porDia
  };
};

/** Entregas entre turnos consecutivos del mismo día: quién cerró y quién abrió después. */
export const calcularEntregas = (turnos: TurnoHistorico[]) => {
  const ordenados = [...turnos].sort((a, b) =>
    `${a.fecha_turno} ${a.hora_apertura}`.localeCompare(`${b.fecha_turno} ${b.hora_apertura}`)
  );
  const entregas: { fecha: string; entrega: string; horaEntrega: string | null; recibe: string; horaRecibe: string }[] = [];
  for (let i = 0; i < ordenados.length - 1; i++) {
    const actual = ordenados[i];
    const siguiente = ordenados[i + 1];
    if (actual.fecha_turno !== siguiente.fecha_turno || !actual.nombre_encargado_cierre) continue;
    entregas.push({
      fecha: actual.fecha_turno,
      entrega: actual.nombre_encargado_cierre,
      horaEntrega: actual.hora_cierre,
      recibe: siguiente.nombre_encargado_apertura,
      horaRecibe: siguiente.hora_apertura
    });
  }
  return entregas;
};