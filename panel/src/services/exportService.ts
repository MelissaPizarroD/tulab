import * as XLSX from 'xlsx';

export const exportarRegistrosExcel = (registros: any[], nombreArchivo: string) => {
  const datos = registros.map(r => ({
    'Código': r.codigo_estudiantil || r.codigo_temporal || '-',
    'Nombre': r.nombre_estudiante || r.nombre_visitante || 'Visitante',
    'Tipo': r.codigo_estudiantil ? 'Estudiante' : 'Visitante',
    'Fecha': new Date(r.hora_entrada).toLocaleDateString('es-CO'),
    'Hora entrada': new Date(r.hora_entrada).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
    'Hora salida': r.hora_salida ? new Date(r.hora_salida).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : '-',
    'Estado': r.estado,
    'Origen': r.origen_registro
  }));

  const ws = XLSX.utils.json_to_sheet(datos);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Registros');
  XLSX.writeFile(wb, `${nombreArchivo}.xlsx`);
};

export const exportarTurnosExcel = (turnos: any[], nombreArchivo: string) => {
  const datos = turnos.map(t => ({
    'Turno': `#${t.id_turno}`,
    'Fecha': new Date(t.fecha_apertura).toLocaleDateString('es-CO'),
    'Hora apertura': t.hora_apertura?.slice(0, 5),
    'Hora cierre': t.hora_cierre?.slice(0, 5) || 'En curso',
    'Estado': t.estado,
    'Observaciones apertura': t.observaciones_apertura || '-',
    'Observaciones cierre': t.observaciones_cierre || '-'
  }));

  const ws = XLSX.utils.json_to_sheet(datos);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Turnos');
  XLSX.writeFile(wb, `${nombreArchivo}.xlsx`);
};

export const exportarResumenHTML = (registros: any[], turno: any) => {
  const fecha = new Date().toLocaleDateString('es-CO', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });

  const filas = registros.map(r => `
    <tr>
      <td>${r.codigo_estudiantil || r.codigo_temporal || '-'}</td>
      <td>${r.nombre_estudiante || r.nombre_visitante || 'Visitante'}</td>
      <td>${r.codigo_estudiantil ? 'Estudiante' : 'Visitante'}</td>
      <td>${new Date(r.hora_entrada).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</td>
      <td>${r.hora_salida ? new Date(r.hora_salida).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
      <td>${r.estado}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Reporte TuLab - ${fecha}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; color: #1e293b; }
        h1 { font-size: 20px; margin-bottom: 4px; }
        p { color: #64748b; font-size: 13px; margin: 0 0 24px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { background: #f8fafc; padding: 8px 12px; text-align: left; color: #64748b; border-bottom: 2px solid #e2e8f0; }
        td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; }
        .resumen { display: flex; gap: 24px; margin-bottom: 24px; }
        .card { background: #f8fafc; border-radius: 8px; padding: 12px 16px; }
        .card-label { font-size: 12px; color: #64748b; }
        .card-value { font-size: 20px; font-weight: bold; color: #1e293b; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      <h1>Reporte de uso - Laboratorio de Informática</h1>
      <p>Fecha: ${fecha} · Turno #${turno?.id_turno || '-'} · Generado: ${new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</p>
      
      <div class="resumen">
        <div class="card">
          <div class="card-label">Total registros</div>
          <div class="card-value">${registros.length}</div>
        </div>
        <div class="card">
          <div class="card-label">Estudiantes</div>
          <div class="card-value">${registros.filter(r => r.codigo_estudiantil).length}</div>
        </div>
        <div class="card">
          <div class="card-label">Visitantes</div>
          <div class="card-value">${registros.filter(r => r.id_visitante).length}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Entrada</th>
            <th>Salida</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>${filas}</tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const ventana = window.open(url, '_blank');
  ventana?.print();
};