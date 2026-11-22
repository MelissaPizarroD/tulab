import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api, socket } from '../services/api';
import type {
  Registro, Sesion, Dispositivo, Novedad, PersonaPresente, EquipoLab, EstadoEquipo
} from '../types/laboratorio';

const EVENTOS = [
  'entrada_registrada',
  'salida_registrada',
  'sesion_iniciada',
  'sesion_cerrada',
  'dispositivo_actualizado',
  'visitante_actualizado',
  'novedad_reportada',
  'equipo_actualizado',
  'turno_actualizado'
];

/**
 * Carga una sola vez los datos del turno y los mantiene al día
 * (eventos en tiempo real + actualización cada 30 s), y cruza
 * personas con equipos para que el dashboard pueda mostrar
 * "quién está en qué PC".
 */
export const useEstadoLaboratorio = (id_turno: number) => {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [novedades, setNovedades] = useState<Novedad[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [enVivo, setEnVivo] = useState(socket.connected);
  const [actualizado, setActualizado] = useState<Date | null>(null);
  const peticion = useRef(0);

  const cargar = useCallback(async () => {
    const numero = ++peticion.current;
    try {
      const [r, s, d, n] = await Promise.all([
        api.get(`/api/registros-acceso/turno/${id_turno}`),
        api.get(`/api/sesiones/turno/${id_turno}`),
        api.get('/api/dispositivos'),
        api.get(`/api/novedades/turno/${id_turno}`)
      ]);
      // si salió una petición más nueva, se descarta esta respuesta
      if (numero !== peticion.current) return;
      setRegistros(r.data);
      setSesiones(s.data);
      setDispositivos(d.data.filter((x: Dispositivo) => x.tipo === 'gestor_sesiones'));
      setNovedades(n.data);
      setError(false);
      setActualizado(new Date());
    } catch {
      if (numero === peticion.current) setError(true);
    } finally {
      if (numero === peticion.current) setCargando(false);
    }
  }, [id_turno]);

  useEffect(() => {
    cargar();

    EVENTOS.forEach((e) => socket.on(e, cargar));
    const alConectar = () => setEnVivo(true);
    const alDesconectar = () => setEnVivo(false);
    socket.on('connect', alConectar);
    socket.on('disconnect', alDesconectar);
    const intervalo = setInterval(cargar, 30000);

    return () => {
      EVENTOS.forEach((e) => socket.off(e, cargar));
      socket.off('connect', alConectar);
      socket.off('disconnect', alDesconectar);
      clearInterval(intervalo);
    };
  }, [cargar]);

  const personas = useMemo<PersonaPresente[]>(() => {
    return registros
      .map((registro) => ({
        registro,
        sesion: sesiones.find((s) => s.id_registro === registro.id_registro) ?? null,
        tipo: registro.codigo_estudiantil ? ('estudiante' as const) : ('visitante' as const),
        nombre: registro.nombre_estudiante || registro.nombre_visitante || 'Visitante',
        codigo: registro.codigo_estudiantil || registro.codigo_temporal || '-'
      }))
      // los que entraron más recientemente, primero
      .sort((a, b) => new Date(b.registro.hora_entrada).getTime() - new Date(a.registro.hora_entrada).getTime());
  }, [registros, sesiones]);

  const equipos = useMemo<EquipoLab[]>(() => {
    return dispositivos
      .map((d) => {
        const sesion = sesiones.find((s) => s.numero_equipo === d.numero_equipo);
        const persona = sesion ? personas.find((p) => p.registro.id_registro === sesion.id_registro) ?? null : null;
        let estado: EstadoEquipo = 'disponible';
        if (d.estado_conexion === 'desconectado') estado = 'apagado';
        else if (sesion) estado = 'en_uso';
        return {
          id_dispositivo: d.id_dispositivo,
          numero_equipo: d.numero_equipo,
          estado,
          persona,
          tieneNovedad: novedades.some((n) => n.numero_equipo === d.numero_equipo)
        };
      })
      .sort((a, b) => a.numero_equipo - b.numero_equipo);
  }, [dispositivos, sesiones, personas, novedades]);

  return { personas, equipos, novedades, cargando, error, enVivo, actualizado, recargar: cargar };
};