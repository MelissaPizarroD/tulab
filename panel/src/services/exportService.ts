import * as XLSX from 'xlsx';
import logoSvg from '../assets/tulab_logo.svg?raw';
import type { DatosReporte, RegistroHistorico, SesionHistorico, TurnoHistorico } from '../types/historico';
import { fechaCorta, fechaLarga, formatMinutos, formatHoraTexto, nombreMotivoCierre } from '../utils/formato';
import type { Estadisticas } from '../utils/estadisticas';
import { calcularEntregas } from '../utils/estadisticas';

const hora = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : '-';

const minutos = (a: string, b: string | null) =>
  b ? Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000)) : null;

const nombreDe = (r: RegistroHistorico) => r.nombre_estudiante || r.nombre_visitante || 'Visitante';
const codigoDe = (r: RegistroHistorico) => r.codigo_estudiantil || r.codigo_temporal || '-';
const tipoDe = (r: RegistroHistorico) => (r.codigo_estudiantil ? 'Estudiante' : 'Visitante');

const textoSesiones = (r: RegistroHistorico) =>
  (r.sesiones ?? [])
    .map((s) => {
      const fin = s.hora_cierre ? hora(s.hora_cierre) : 'en curso';
      const dur = s.hora_cierre ? ` (${formatMinutos(minutos(s.hora_inicio, s.hora_cierre))})` : '';
      return `PC ${s.numero_equipo}: ${hora(s.hora_inicio)} a ${fin}${dur}`;
    })
    .join(' | ') || '-';

const textoMotivos = (r: RegistroHistorico) =>
  (r.sesiones ?? [])
    .filter((s) => s.motivo_cierre)
    .map((s) => nombreMotivoCierre(s.motivo_cierre))
    .join(' | ') || '-';

const filasSesiones = (sesiones: SesionHistorico[]) =>
  sesiones.map((s) => ({
    'Fecha': fechaCorta(s.fecha_turno),
    'Turno': `#${s.id_turno}`,
    'PC': s.numero_equipo,
    'Persona': s.nombre_estudiante || s.nombre_visitante || '-',
    'Código': s.codigo_estudiantil || s.codigo_temporal || '-',
    'Hora inicio': hora(s.hora_inicio),
    'Hora cierre': s.hora_cierre ? hora(s.hora_cierre) : 'En curso',
    'Duración': formatMinutos(minutos(s.hora_inicio, s.hora_cierre)),
    'Motivo de cierre': nombreMotivoCierre(s.motivo_cierre) || '-',
    'IP del equipo': s.ip_origen || '-'
  }));

const hojaDesde = (datos: Record<string, any>[]) => {
  const ws = XLSX.utils.json_to_sheet(datos.length ? datos : [{ Sin_datos: '' }]);
  const columnas = Object.keys(datos[0] || { Sin_datos: '' });
  ws['!cols'] = columnas.map((c) => ({
    wch: Math.min(60, Math.max(c.length + 2, ...datos.map((d) => String(d[c] ?? '').length + 2)))
  }));
  return ws;
};

const filasRegistros = (registros: RegistroHistorico[]) =>
  registros.map((r) => ({
    'Fecha del turno': fechaCorta(r.fecha_turno),
    'Turno': `#${r.id_turno}`,
    'Código': codigoDe(r),
    'Nombre': nombreDe(r),
    'Tipo': tipoDe(r),
    'Programa': r.programa_academico || '-',
    'Semestre': r.semestre ?? '-',
    'Institución': r.institucion || '-',
    'Hora entrada': hora(r.hora_entrada),
    'Hora salida': hora(r.hora_salida),
    'Permanencia': formatMinutos(minutos(r.hora_entrada, r.hora_salida)),
    'PC usado': r.equipos || '-',
    'Sesiones de equipo': textoSesiones(r),
    'Motivo de cierre de sesión': textoMotivos(r),
    'IP del dispositivo de registro': r.ip_origen || '-',
    'IP del equipo': r.ips_equipo || '-',
    'Origen': r.origen_registro,
    'Encargado apertura': r.nombre_encargado_apertura,
    'Encargado cierre': r.nombre_encargado_cierre || '-'
  }));

const filasTurnos = (turnos: TurnoHistorico[]) =>
  turnos.map((t) => ({
    'Turno': `#${t.id_turno}`,
    'Fecha': fechaCorta(t.fecha_turno),
    'Hora apertura': formatHoraTexto(t.hora_apertura),
    'Hora cierre': t.hora_cierre ? formatHoraTexto(t.hora_cierre) : 'En curso',
    'Encargado apertura': t.nombre_encargado_apertura,
    'Encargado cierre': t.nombre_encargado_cierre || '-',
    'Personas registradas': t.total_registros,
    'Observaciones apertura': t.observaciones_apertura || '-',
    'Observaciones cierre': t.observaciones_cierre || '-'
  }));

export const exportarRegistrosExcel = (registros: RegistroHistorico[], nombreArchivo: string) => {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, hojaDesde(filasRegistros(registros)), 'Registros');
  XLSX.writeFile(wb, `${nombreArchivo}.xlsx`);
};

export const exportarTurnosExcel = (
  datos: Pick<DatosReporte, 'turnos' | 'bitacora' | 'novedades' | 'programaciones' | 'sesiones'>,
  nombreArchivo: string
) => {
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, hojaDesde(filasTurnos(datos.turnos)), 'Turnos');

  XLSX.utils.book_append_sheet(
    wb,
    hojaDesde(datos.bitacora.map((b) => ({
      'Fecha': fechaCorta(b.fecha_turno || ''),
      'Turno': `#${b.id_turno}`,
      'Hora': hora(b.timestamp_registro),
      'Encargado': b.nombre_encargado,
      'Descripción': b.descripcion,
      'Última edición': b.timestamp_edicion ? `${b.nombre_editor} (${hora(b.timestamp_edicion)})` : '-'
    }))),
    'Bitácora'
  );

  XLSX.utils.book_append_sheet(wb, hojaDesde(filasSesiones(datos.sesiones)), 'Sesiones de equipos');

  XLSX.utils.book_append_sheet(
    wb,
    hojaDesde(datos.novedades.map((n) => ({
      'Fecha': fechaCorta(n.fecha_turno || ''),
      'Turno': n.id_turno ? `#${n.id_turno}` : '-',
      'Hora': hora(n.timestamp_reporte),
      'PC': n.numero_equipo,
      'Reportó': n.nombre_estudiante || n.nombre_visitante || '-',
      'Código estudiantil': n.codigo_estudiantil || '-',
      'Descripción': n.descripcion
    }))),
    'Novedades de equipos'
  );

  XLSX.utils.book_append_sheet(
    wb,
    hojaDesde(datos.programaciones.map((p) => ({
      'Fecha': fechaCorta(p.fecha_turno || ''),
      'Turno': `#${p.id_turno}`,
      'Persona': p.nombre_estudiante || p.nombre_visitante || p.codigo_estudiantil || '-',
      'Recurso': p.tipo_recurso.replace('_', ' '),
      'Descripción': p.descripcion_recurso || '-',
      'Hora estimada': formatHoraTexto(p.hora_estimada_disponibilidad),
      'Estado': p.estado
    }))),
    'Recursos programados'
  );

  XLSX.writeFile(wb, `${nombreArchivo}.xlsx`);
};

/** Excel del resumen (día o mes): una hoja por sección. */
export const exportarResumenExcel = (datos: DatosReporte, est: Estadisticas, titulo: string, nombreArchivo: string) => {
  const wb = XLSX.utils.book_new();

  const resumen: (string | number)[][] = [
    ['Laboratorio de Informática - TuLab UdeC'],
    [titulo],
    [],
    ['Turnos', est.turnos],
    ['Personas registradas', est.totalRegistros],
    ['Estudiantes', est.estudiantes],
    ['Visitantes', est.visitantes],
    ['Permanencia promedio', formatMinutos(est.promedioMin)],
    ['Hora de mayor afluencia', est.horaPico ? `${est.horaPico.hora}:00 (${est.horaPico.cantidad} entradas)` : '-'],
    ['Entradas de bitácora', est.entradasBitacora],
    ['Novedades de equipos', est.novedades]
  ];
  const entregas = calcularEntregas(datos.turnos);
  if (entregas.length) {
    resumen.push([], ['Entregas de turno']);
    entregas.forEach((e) =>
      resumen.push([fechaCorta(e.fecha), `Entregó ${e.entrega} (${formatHoraTexto(e.horaEntrega)}) y recibió ${e.recibe} (${formatHoraTexto(e.horaRecibe)})`])
    );
  }
  const wsResumen = XLSX.utils.aoa_to_sheet(resumen);
  wsResumen['!cols'] = [{ wch: 28 }, { wch: 70 }];
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

  XLSX.utils.book_append_sheet(wb, hojaDesde(filasTurnos(datos.turnos)), 'Turnos');

  XLSX.utils.book_append_sheet(
    wb,
    hojaDesde(est.porDia.map((d) => ({
      'Fecha': fechaCorta(d.fecha),
      'Turnos': d.turnos,
      'Personas': d.registros,
      'Estudiantes': d.estudiantes,
      'Visitantes': d.visitantes,
      'Permanencia promedio': formatMinutos(d.promedioMin)
    }))),
    'Por día'
  );

  XLSX.utils.book_append_sheet(
    wb,
    hojaDesde(datos.bitacora.map((b) => ({
      'Fecha': fechaCorta(b.fecha_turno || ''),
      'Turno': `#${b.id_turno}`,
      'Hora': hora(b.timestamp_registro),
      'Encargado': b.nombre_encargado,
      'Descripción': b.descripcion,
      'Última edición': b.timestamp_edicion ? `${b.nombre_editor} (${hora(b.timestamp_edicion)})` : '-'
    }))),
    'Bitácora'
  );

  XLSX.utils.book_append_sheet(
    wb,
    hojaDesde(datos.novedades.map((n) => ({
      'Fecha': fechaCorta(n.fecha_turno || ''),
      'Turno': n.id_turno ? `#${n.id_turno}` : '-',
      'Hora': hora(n.timestamp_reporte),
      'PC': n.numero_equipo,
      'Reportó': n.nombre_estudiante || n.nombre_visitante || '-',
      'Código estudiantil': n.codigo_estudiantil || '-',
      'Descripción': n.descripcion
    }))),
    'Novedades de equipos'
  );

  XLSX.utils.book_append_sheet(
    wb,
    hojaDesde(datos.programaciones.map((p) => ({
      'Fecha': fechaCorta(p.fecha_turno || ''),
      'Turno': `#${p.id_turno}`,
      'Persona': p.nombre_estudiante || p.nombre_visitante || p.codigo_estudiantil || '-',
      'Recurso': p.tipo_recurso.replace('_', ' '),
      'Descripción': p.descripcion_recurso || '-',
      'Hora estimada': formatHoraTexto(p.hora_estimada_disponibilidad),
      'Estado': p.estado
    }))),
    'Recursos programados'
  );

  XLSX.utils.book_append_sheet(wb, hojaDesde(filasSesiones(datos.sesiones)), 'Sesiones de equipos');

  XLSX.utils.book_append_sheet(
    wb,
    hojaDesde(est.porEquipo.map((e) => ({
      'PC': e.numero_equipo,
      'Sesiones': e.sesiones,
      'Tiempo de uso': formatMinutos(Math.round(e.minutos))
    }))),
    'Uso de equipos'
  );

  XLSX.utils.book_append_sheet(
    wb,
    hojaDesde(est.porPrograma.map((p) => ({ 'Programa académico': p.programa, 'Estudiantes': p.cantidad }))),
    'Por programa'
  );

  XLSX.utils.book_append_sheet(
    wb,
    hojaDesde(est.porHora.map((c, h) => ({ 'Hora': `${String(h).padStart(2, '0')}:00`, 'Entradas': c })).filter((f) => f.Entradas > 0)),
    'Por hora'
  );

  XLSX.utils.book_append_sheet(wb, hojaDesde(filasRegistros(datos.registros)), 'Registros');

  XLSX.writeFile(wb, `${nombreArchivo}.xlsx`);
};

const esc = (valor: unknown) =>
  String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const tabla = (cabeceras: string[], filas: (string | number)[][], vacio: string) =>
  filas.length
    ? `<table><thead><tr>${cabeceras.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${filas
        .map((f) => `<tr>${f.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`)
        .join('')}</tbody></table>`
    : `<p class="vacio">${esc(vacio)}</p>`;

/** Abre una versión imprimible (guardar como PDF) del resumen. */
export const imprimirResumen = (
  datos: DatosReporte,
  est: Estadisticas,
  titulo: string,
  opciones: { incluirRegistros: boolean }
) => {
  const entregas = calcularEntregas(datos.turnos);
  const maxHora = Math.max(1, ...est.porHora);

  const barrasHora = est.porHora
    .map((c, h) => ({ c, h }))
    .filter((x) => x.c > 0)
    .map(
      (x) =>
        `<div class="barra-fila"><span class="barra-etiqueta">${String(x.h).padStart(2, '0')}:00</span><span class="barra"><span style="width:${Math.round((x.c / maxHora) * 100)}%"></span></span><span class="barra-valor">${x.c}</span></div>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${esc(titulo)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #1a1a1a; padding: 28px; font-size: 12px; }
  header { display: flex; align-items: center; gap: 16px; border-bottom: 3px solid #D49901; padding-bottom: 12px; margin-bottom: 18px; }
  .logo svg { height: 46px; width: auto; display: block; }
  h1 { font-size: 18px; margin: 0; }
  header p { margin: 2px 0 0; color: #6B6860; }
  h2 { font-size: 14px; margin: 22px 0 8px; padding-bottom: 4px; border-bottom: 1px solid #E4E2DC; }
  .cifras { display: flex; gap: 10px; flex-wrap: wrap; }
  .cifra { background: #FFF8E6; border: 1px solid #F8DD8A; border-radius: 8px; padding: 8px 12px; min-width: 110px; }
  .cifra span { display: block; font-size: 11px; color: #6B6860; }
  .cifra strong { font-size: 18px; }
  table { width: 100%; border-collapse: collapse; margin-top: 4px; }
  th { background: #F3F2EE; text-align: left; padding: 6px 8px; border-bottom: 2px solid #E4E2DC; font-size: 11px; }
  td { padding: 6px 8px; border-bottom: 1px solid #F3F2EE; vertical-align: top; }
  .vacio { color: #6B6860; font-style: italic; margin: 4px 0; }
  .barra-fila { display: flex; align-items: center; gap: 8px; margin: 2px 0; }
  .barra-etiqueta { width: 44px; color: #6B6860; }
  .barra { flex: 1; background: #F3F2EE; height: 10px; border-radius: 5px; overflow: hidden; }
  .barra span { display: block; height: 100%; background: #D49901; }
  .barra-valor { width: 28px; text-align: right; }
  .firma { display: flex; gap: 40px; margin-top: 48px; }
  .firma div { flex: 1; border-top: 1px solid #1a1a1a; padding-top: 4px; text-align: center; color: #6B6860; }
  @media print { body { padding: 0; } h2 { break-after: avoid; } tr { break-inside: avoid; } }
</style>
</head>
<body>
<header>
  <div class="logo">${logoSvg}</div>
  <div>
    <h1>${esc(titulo)}</h1>
    <p>Laboratorio de Informática · Generado el ${esc(new Date().toLocaleDateString('es-CO'))} a las ${esc(hora(new Date().toISOString()))}</p>
  </div>
</header>

<div class="cifras">
  <div class="cifra"><span>Turnos</span><strong>${est.turnos}</strong></div>
  <div class="cifra"><span>Personas</span><strong>${est.totalRegistros}</strong></div>
  <div class="cifra"><span>Estudiantes</span><strong>${est.estudiantes}</strong></div>
  <div class="cifra"><span>Visitantes</span><strong>${est.visitantes}</strong></div>
  <div class="cifra"><span>Permanencia promedio</span><strong>${esc(formatMinutos(est.promedioMin))}</strong></div>
  <div class="cifra"><span>Hora de mayor afluencia</span><strong>${est.horaPico ? esc(`${est.horaPico.hora}:00`) : '-'}</strong></div>
</div>

<h2>Turnos</h2>
${tabla(
  ['Turno', 'Fecha', 'Horario', 'Abrió', 'Cerró', 'Personas', 'Observaciones'],
  datos.turnos.map((t) => [
    `#${t.id_turno}`,
    fechaCorta(t.fecha_turno),
    `${formatHoraTexto(t.hora_apertura)} - ${t.hora_cierre ? formatHoraTexto(t.hora_cierre) : 'en curso'}`,
    t.nombre_encargado_apertura,
    t.nombre_encargado_cierre || '-',
    t.total_registros,
    [t.observaciones_apertura && `Apertura: ${t.observaciones_apertura}`, t.observaciones_cierre && `Cierre: ${t.observaciones_cierre}`]
      .filter(Boolean)
      .join(' | ') || '-'
  ]),
  'No hubo turnos en este periodo.'
)}

${entregas.length
  ? `<h2>Entregas de turno</h2>${tabla(
      ['Fecha', 'Entregó', 'Recibió'],
      entregas.map((e) => [
        fechaCorta(e.fecha),
        `${e.entrega} (${formatHoraTexto(e.horaEntrega)})`,
        `${e.recibe} (${formatHoraTexto(e.horaRecibe)})`
      ]),
      ''
    )}`
  : ''}

${est.porDia.length > 1
  ? `<h2>Por día</h2>${tabla(
      ['Fecha', 'Turnos', 'Personas', 'Estudiantes', 'Visitantes', 'Permanencia promedio'],
      est.porDia.map((d) => [fechaCorta(d.fecha), d.turnos, d.registros, d.estudiantes, d.visitantes, formatMinutos(d.promedioMin)]),
      ''
    )}`
  : ''}

<h2>Bitácora</h2>
${tabla(
  ['Fecha', 'Hora', 'Encargado', 'Descripción'],
  datos.bitacora.map((b) => [fechaCorta(b.fecha_turno || ''), hora(b.timestamp_registro), b.nombre_encargado, b.descripcion]),
  'No hay entradas de bitácora en este periodo.'
)}

<h2>Novedades de equipos</h2>
${tabla(
  ['Fecha', 'Hora', 'PC', 'Reportó', 'Descripción'],
  datos.novedades.map((n) => [
    fechaCorta(n.fecha_turno || ''),
    hora(n.timestamp_reporte),
    n.numero_equipo,
    n.nombre_estudiante || n.codigo_estudiantil || '-',
    n.descripcion
  ]),
  'No se reportaron novedades de equipos.'
)}

<h2>Recursos programados</h2>
${tabla(
  ['Fecha', 'Persona', 'Recurso', 'Hora estimada', 'Estado'],
  datos.programaciones.map((p) => [
    fechaCorta(p.fecha_turno || ''),
    p.nombre_estudiante || p.nombre_visitante || p.codigo_estudiantil || '-',
    `${p.tipo_recurso.replace('_', ' ')}${p.descripcion_recurso ? ` · ${p.descripcion_recurso}` : ''}`,
    formatHoraTexto(p.hora_estimada_disponibilidad),
    p.estado
  ]),
  'No hubo recursos programados.'
)}

<h2>Uso de equipos</h2>
${tabla(
  ['PC', 'Sesiones', 'Tiempo de uso'],
  est.porEquipo.map((e) => [e.numero_equipo, e.sesiones, formatMinutos(Math.round(e.minutos))]),
  'No hubo sesiones de equipos.'
)}

<h2>Entradas por hora</h2>
${barrasHora || '<p class="vacio">Sin entradas.</p>'}

${est.porPrograma.length
  ? `<h2>Estudiantes por programa</h2>${tabla(['Programa', 'Estudiantes'], est.porPrograma.map((p) => [p.programa, p.cantidad]), '')}`
  : ''}

${opciones.incluirRegistros
  ? `<h2>Registro de personas</h2>${tabla(
      ['Código', 'Nombre', 'Tipo', 'Entrada', 'Salida', 'PC', 'IP dispositivo', 'IP equipo'],
      datos.registros.map((r) => [
        codigoDe(r),
        nombreDe(r),
        tipoDe(r),
        hora(r.hora_entrada),
        hora(r.hora_salida),
        r.equipos || '-',
        r.ip_origen || '-',
        r.ips_equipo || '-'
      ]),
      'No hay registros en este periodo.'
    )}`
  : ''}

<div class="firma"><div>Encargado que entrega</div><div>Encargado que recibe</div></div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const ventana = window.open(url, '_blank');
  if (ventana) {
    ventana.onload = () => ventana.print();
  }
};

export const tituloDia = (fecha: string) => `Resumen del día ${fechaLarga(fecha)}`;