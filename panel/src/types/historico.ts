import type { SesionRegistro } from './laboratorio';

export interface RegistroHistorico {
  id_registro: number;
  id_turno: number;
  fecha_turno: string;
  codigo_estudiantil: string | null;
  nombre_estudiante: string | null;
  id_visitante: number | null;
  nombre_visitante: string | null;
  codigo_temporal: string | null;
  hora_entrada: string;
  hora_salida: string | null;
  origen_registro: string;
  ip_origen: string | null;
  programa_academico: string | null;
  semestre: number | null;
  correo_institucional: string | null;
  telefono_contacto: string | null;
  motivo_visita: string | null;
  email: string | null;
  telefono: string | null;
  institucion: string | null;
  timestamp_expiracion: string | null;
  equipos: string | null;
  ips_equipo: string | null;
  nombre_encargado_apertura: string;
  nombre_encargado_cierre: string | null;
  sesiones?: SesionRegistro[];
}

export interface TurnoHistorico {
  id_turno: number;
  fecha_turno: string;
  hora_apertura: string;
  hora_cierre: string | null;
  estado: string;
  observaciones_apertura: string | null;
  observaciones_cierre: string | null;
  nombre_encargado_apertura: string;
  nombre_encargado_cierre: string | null;
  total_registros: number;
}

export interface EntradaBitacoraHistorico {
  id_entrada: number;
  id_turno: number;
  descripcion: string;
  timestamp_registro: string;
  nombre_encargado: string;
  fecha_turno?: string;
  timestamp_edicion?: string | null;
  nombre_editor?: string | null;
}

export interface NovedadHistorico {
  id_novedad: number;
  id_turno?: number;
  numero_equipo: number;
  descripcion: string;
  timestamp_reporte: string;
  nombre_estudiante: string | null;
  codigo_estudiantil: string | null;
  fecha_turno?: string;
  nombre_visitante: string | null;
}

export interface ProgramacionHistorico {
  id_programacion: number;
  id_turno: number;
  tipo_recurso: string;
  descripcion_recurso: string | null;
  hora_estimada_disponibilidad: string | null;
  estado: string;
  nombre_estudiante: string | null;
  nombre_visitante: string | null;
  codigo_estudiantil: string | null;
  fecha_turno?: string;
}

export interface SesionHistorico {
  id_sesion: number;
  numero_equipo: number;
  hora_inicio: string;
  hora_cierre: string | null;
  motivo_cierre: string | null;
  ip_origen: string | null;
  id_turno: number;
  fecha_turno: string;
  codigo_estudiantil: string | null;
  codigo_temporal: string | null;
  nombre_estudiante: string | null;
  nombre_visitante: string | null;
}

export interface DatosReporte {
  desde: string;
  hasta: string;
  turnos: TurnoHistorico[];
  registros: RegistroHistorico[];
  bitacora: EntradaBitacoraHistorico[];
  novedades: NovedadHistorico[];
  programaciones: ProgramacionHistorico[];
  sesiones: SesionHistorico[];
}

export interface SesionTurno {
  id_sesion: number;
  numero_equipo: number;
  hora_inicio: string;
  hora_cierre: string | null;
  motivo_cierre: string | null;
  ip_origen: string | null;
  codigo_estudiantil: string | null;
  nombre_estudiante: string | null;
  nombre_visitante: string | null;
}