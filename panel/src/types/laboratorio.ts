export interface Registro {
  id_registro: number;
  codigo_estudiantil: string | null;
  nombre_estudiante: string | null;
  nombre_visitante: string | null;
  codigo_temporal: string | null;
  hora_entrada: string;
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
}

export interface Sesion {
  id_sesion: number;
  id_registro: number;
  id_equipo: number;
  numero_equipo: number;
  hora_inicio: string;
  ip_origen: string | null;
}

export interface Dispositivo {
  id_dispositivo: number;
  numero_equipo: number;
  nombre: string;
  estado_conexion: string;
  tipo: string;
}

export interface Novedad {
  id_novedad: number;
  descripcion: string;
  timestamp_reporte: string;
  numero_equipo: number;
  nombre_estudiante: string | null;
  codigo_estudiantil: string | null;
}

export type EstadoEquipo = 'disponible' | 'en_uso' | 'apagado';

export interface PersonaPresente {
  registro: Registro;
  sesion: Sesion | null;
  tipo: 'estudiante' | 'visitante';
  nombre: string;
  codigo: string;
}

export interface EquipoLab {
  id_dispositivo: number;
  numero_equipo: number;
  estado: EstadoEquipo;
  persona: PersonaPresente | null;
  tieneNovedad: boolean;
}