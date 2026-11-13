import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { socket } from '../services/api';

interface Sesion {
  id_sesion: number;
  id_equipo: number;
  numero_equipo: number;
  nombre_estudiante: string;
  codigo_estudiantil: string;
  hora_inicio: string;
  estado: string;
}

interface Dispositivo {
  id_dispositivo: number;
  id_equipo: number;
  numero_equipo: number;
  nombre: string;
  estado_conexion: string;
  tipo: string;
}

export const EstadoLaboratorio = ({ id_turno }: { id_turno: number }) => {
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);

  const cargarDatos = async () => {
    try {
      const [sesionesRes, dispositivosRes] = await Promise.all([
        api.get(`/api/sesiones/turno/${id_turno}`),
        api.get('/api/dispositivos')
      ]);
      setSesiones(sesionesRes.data);
      setDispositivos(dispositivosRes.data.filter((d: Dispositivo) => d.tipo === 'gestor_sesiones'));
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  useEffect(() => {
    cargarDatos();

    const handler = () => cargarDatos();
    const eventos = [
      'sesion_iniciada',
      'sesion_cerrada',
      'entrada_registrada',
      'salida_registrada',
      'dispositivo_actualizado'
    ];

    eventos.forEach(e => socket.on(e, handler));
    const intervalo = setInterval(cargarDatos, 30000);

    return () => {
      eventos.forEach(e => socket.off(e, handler));
      clearInterval(intervalo);
    };
  }, [id_turno]);

  const obtenerEstadoEquipo = (numero_equipo: number) => {
    const dispositivo = dispositivos.find(d => d.numero_equipo === numero_equipo);
    const sesion = sesiones.find(s => s.numero_equipo === numero_equipo);

    if (!dispositivo || dispositivo.estado_conexion === 'desconectado') return 'apagado';
    if (sesion) return 'en_uso';
    return 'disponible';
  };

  const colores: Record<string, string> = {
    apagado: '#e2e8f0',
    disponible: '#dcfce7',
    en_uso: '#fef9c3'
  };

  const etiquetas: Record<string, string> = {
    apagado: 'Apagado',
    disponible: 'Disponible',
    en_uso: 'En uso'
  };

  return (
    <div>
      <h3 style={{ marginTop: 0, color: '#1e293b' }}>Estado del laboratorio</h3>
      <div style={{
        display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap'
      }}>
        {Object.entries(etiquetas).map(([estado, label]) => (
          <div key={estado} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '12px', height: '12px', borderRadius: '50%',
              background: colores[estado], border: '1px solid #ccc'
            }} />
            <span style={{ fontSize: '13px', color: '#64748b' }}>{label}</span>
          </div>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '12px'
      }}>
        {dispositivos.map(d => {
          const estado = obtenerEstadoEquipo(d.numero_equipo);
          const sesion = sesiones.find(s => s.numero_equipo === d.numero_equipo);
          return (
            <div key={d.id_dispositivo} style={{
              background: colores[estado],
              borderRadius: '8px', padding: '12px',
              border: '1px solid #e2e8f0', textAlign: 'center'
            }}>
              <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#1e293b' }}>
                PC {d.numero_equipo}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                {etiquetas[estado]}
              </div>
              {sesion && (
                <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>
                  {sesion.nombre_estudiante || sesion.codigo_estudiantil}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {dispositivos.length === 0 && (
        <p style={{ color: '#94a3b8', textAlign: 'center' }}>
          No hay equipos registrados
        </p>
      )}
    </div>
  );
};