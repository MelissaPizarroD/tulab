import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface Novedad {
  id_novedad: number;
  descripcion: string;
  timestamp_reporte: string;
  numero_equipo: number;
  nombre_estudiante: string;
  codigo_estudiantil: string;
}

export const Novedades = ({ id_turno }: { id_turno: number }) => {
  const [novedades, setNovedades] = useState<Novedad[]>([]);

  const cargarNovedades = async () => {
    try {
      const response = await api.get(`/api/novedades/turno/${id_turno}`);
      setNovedades(response.data);
    } catch (error) {
      console.error('Error cargando novedades:', error);
    }
  };

  useEffect(() => {
    cargarNovedades();
    const intervalo = setInterval(cargarNovedades, 30000);
    return () => clearInterval(intervalo);
  }, [id_turno]);

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleTimeString('es-CO', {
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div>
      <h3 style={{ marginTop: 0, color: '#1e293b' }}>
        Novedades de equipos ({novedades.length})
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {novedades.map(n => (
          <div key={n.id_novedad} style={{
            padding: '12px 16px', background: '#fffbeb',
            borderRadius: '8px', border: '1px solid #fde68a'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontWeight: 'bold', color: '#92400e', fontSize: '14px' }}>
                PC {n.numero_equipo}
              </span>
              <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                {formatFecha(n.timestamp_reporte)}
              </span>
            </div>
            <p style={{ margin: 0, color: '#1e293b', fontSize: '14px' }}>
              {n.descripcion}
            </p>
            <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '12px' }}>
              {n.nombre_estudiante || n.codigo_estudiantil}
            </p>
          </div>
        ))}
        {novedades.length === 0 && (
          <p style={{ color: '#94a3b8', textAlign: 'center', fontSize: '14px' }}>
            No hay novedades reportadas
          </p>
        )}
      </div>
    </div>
  );
};