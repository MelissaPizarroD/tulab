import { useState } from 'react';
import { api } from '../../services/api';
import type { DatosReporte } from '../../types/historico';
import { calcularEntregas, calcularEstadisticas, type Estadisticas } from '../../utils/estadisticas';
import {
  fechaCorta, fechaLarga, formatHoraTexto, formatMinutos, hoyISO, mesActualISO, nombreMes, rangoDelMes
} from '../../utils/formato';
import { exportarResumenExcel, imprimirResumen } from '../../services/exportService';

type Modo = 'dia' | 'mes';

interface Resultado {
  modo: Modo;
  titulo: string;
  archivo: string;
  datos: DatosReporte;
  est: Estadisticas;
}

export const ResumenesHistorico = () => {
  const [modo, setModo] = useState<Modo>('dia');
  const [dia, setDia] = useState(hoyISO());
  const [mes, setMes] = useState(mesActualISO());
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const generar = async () => {
    const valor = modo === 'dia' ? dia : mes;
    if (!valor) return;
    setCargando(true);
    setError('');
    try {
      const { desde, hasta } = modo === 'dia' ? { desde: dia, hasta: dia } : rangoDelMes(mes);
      const r = await api.get(`/api/reportes?desde=${desde}&hasta=${hasta}`);
      const datos: DatosReporte = r.data;
      setResultado({
        modo,
        titulo: modo === 'dia' ? `Resumen del día ${fechaLarga(dia)}` : `Resumen de ${nombreMes(mes)}`,
        archivo: modo === 'dia' ? `resumen_dia_${dia}` : `resumen_mes_${mes}`,
        datos,
        est: calcularEstadisticas(datos)
      });
    } catch (e: any) {
      setError(e.response?.data?.mensaje || 'No se pudo generar el resumen.');
      setResultado(null);
    } finally {
      setCargando(false);
    }
  };

  const entregas = resultado ? calcularEntregas(resultado.datos.turnos) : [];
  const maxEquipo = resultado ? Math.max(1, ...resultado.est.porEquipo.map((e) => e.sesiones)) : 1;

  return (
    <div className="columna">
      <section className="tarjeta">
        <header className="tarjeta__cabecera">
          <h2 className="tarjeta__titulo">Generar resumen</h2>
        </header>

        <div className="filtros-barra">
          <div className="pestanas pestanas--compacta" role="group" aria-label="Tipo de resumen">
            {(['dia', 'mes'] as const).map((m) => (
              <button
                key={m}
                type="button"
                className={`pestana ${modo === m ? 'pestana--activa' : ''}`}
                aria-pressed={modo === m}
                onClick={() => setModo(m)}
              >
                {m === 'dia' ? 'Diario' : 'Mensual'}
              </button>
            ))}
          </div>

          {modo === 'dia' ? (
            <label className="campo">
              <span className="campo__etiqueta">Día</span>
              <input className="entrada" type="date" value={dia} onChange={(e) => setDia(e.target.value)} />
            </label>
          ) : (
            <label className="campo">
              <span className="campo__etiqueta">Mes</span>
              <input className="entrada" type="month" value={mes} onChange={(e) => setMes(e.target.value)} />
            </label>
          )}

          <button type="button" className="btn btn--primario" onClick={generar} disabled={cargando || !(modo === 'dia' ? dia : mes)}>
            {cargando ? 'Generando...' : 'Generar'}
          </button>
        </div>

        {error && <p className="error-texto" role="alert">{error}</p>}
      </section>

      {resultado && (
        <>
          <section className="tarjeta">
            <header className="tarjeta__cabecera">
              <h2 className="tarjeta__titulo">{resultado.titulo}</h2>
              <div className="elemento__acciones">
                <button
                  type="button"
                  className="btn btn--secundario btn--chico"
                  onClick={() => exportarResumenExcel(resultado.datos, resultado.est, resultado.titulo, resultado.archivo)}
                >
                  Descargar Excel
                </button>
                <button
                  type="button"
                  className="btn btn--primario btn--chico"
                  onClick={() => imprimirResumen(resultado.datos, resultado.est, resultado.titulo, { incluirRegistros: resultado.modo === 'dia' })}
                >
                  Imprimir PDF
                </button>
              </div>
            </header>

            <div className="resumen resumen--compacto">
              <article className="dato"><p className="dato__titulo">Turnos</p><p className="dato__valor">{resultado.est.turnos}</p></article>
              <article className="dato"><p className="dato__titulo">Personas</p><p className="dato__valor">{resultado.est.totalRegistros}</p>
                <p className="dato__detalle">{resultado.est.estudiantes} estudiantes · {resultado.est.visitantes} visitantes</p></article>
              <article className="dato"><p className="dato__titulo">Permanencia promedio</p><p className="dato__valor dato__valor--medio">{formatMinutos(resultado.est.promedioMin)}</p></article>
              <article className="dato"><p className="dato__titulo">Mayor afluencia</p>
                <p className="dato__valor dato__valor--medio">{resultado.est.horaPico ? `${resultado.est.horaPico.hora}:00` : '-'}</p>
                {resultado.est.horaPico && <p className="dato__detalle">{resultado.est.horaPico.cantidad} {resultado.est.horaPico.cantidad === 1 ? 'entrada' : 'entradas'}</p>}</article>
              <article className={`dato ${resultado.est.novedades > 0 ? 'dato--aviso' : ''}`}><p className="dato__titulo">Novedades de equipos</p><p className="dato__valor">{resultado.est.novedades}</p>
                <p className="dato__detalle">{resultado.est.entradasBitacora} {resultado.est.entradasBitacora === 1 ? 'entrada' : 'entradas'} de bitácora</p></article>
            </div>
          </section>

          <section className="tarjeta">
            <header className="tarjeta__cabecera"><h2 className="tarjeta__titulo">Turnos del periodo <span className="tarjeta__conteo">{resultado.datos.turnos.length}</span></h2></header>
            {resultado.datos.turnos.length === 0 ? (
              <p className="vacio">No hubo turnos en este periodo.</p>
            ) : (
              <div className="tabla-scroll">
                <table className="tabla">
                  <thead>
                    <tr><th>Fecha</th><th>Turno</th><th>Horario</th><th>Abrió</th><th>Cerró</th><th>Personas</th></tr>
                  </thead>
                  <tbody>
                    {resultado.datos.turnos.map((t) => (
                      <tr key={t.id_turno}>
                        <td>{fechaCorta(t.fecha_turno)}</td>
                        <td>#{t.id_turno}</td>
                        <td>{formatHoraTexto(t.hora_apertura)} a {t.hora_cierre ? formatHoraTexto(t.hora_cierre) : 'en curso'}</td>
                        <td>{t.nombre_encargado_apertura}</td>
                        <td>{t.nombre_encargado_cierre || '-'}</td>
                        <td>{t.total_registros}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {entregas.length > 0 && (
              <ul className="turno__lista turno__lista--separada">
                {entregas.map((e, i) => (
                  <li key={i}>
                    <span className="turno__hora">{fechaCorta(e.fecha)}</span>
                    <span>Entregó {e.entrega} ({formatHoraTexto(e.horaEntrega)}) y recibió {e.recibe} ({formatHoraTexto(e.horaRecibe)})</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {resultado.modo === 'mes' && resultado.est.porDia.length > 0 && (
            <section className="tarjeta">
              <header className="tarjeta__cabecera"><h2 className="tarjeta__titulo">Por día</h2></header>
              <div className="tabla-scroll">
                <table className="tabla">
                  <thead><tr><th>Fecha</th><th>Turnos</th><th>Personas</th><th>Estudiantes</th><th>Visitantes</th><th>Permanencia promedio</th></tr></thead>
                  <tbody>
                    {resultado.est.porDia.map((d) => (
                      <tr key={d.fecha}>
                        <td>{fechaCorta(d.fecha)}</td><td>{d.turnos}</td><td>{d.registros}</td><td>{d.estudiantes}</td><td>{d.visitantes}</td><td>{formatMinutos(d.promedioMin)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {resultado.est.porEquipo.length > 0 && (
            <section className="tarjeta">
              <header className="tarjeta__cabecera"><h2 className="tarjeta__titulo">Uso de equipos</h2></header>
              <ul className="barras">
                {resultado.est.porEquipo.map((e) => (
                  <li key={e.numero_equipo} className="barra-fila">
                    <span className="barra-etiqueta">PC {e.numero_equipo}</span>
                    <span className="barra"><span style={{ width: `${Math.round((e.sesiones / maxEquipo) * 100)}%` }} /></span>
                    <span className="barra-valor">{e.sesiones} {e.sesiones === 1 ? 'sesión' : 'sesiones'}{e.minutos > 0 ? ` · ${formatMinutos(Math.round(e.minutos))}` : ''}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
};