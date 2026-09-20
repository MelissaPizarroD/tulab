import pool from '../database/connection';

export const estudianteRepository = {

  async buscarPorCodigo(codigo_estudiantil: string) {
    const result = await pool.query(
      `SELECT * FROM estudiante WHERE codigo_estudiantil = $1`,
      [codigo_estudiantil]
    );
    return result.rows[0] || null;
  },

  async crearOActualizar(data: {
    codigo_estudiantil: string;
    nombre: string;
    programa_academico: string;
    correo_institucional: string;
    semestre: number;
    telefono_contacto?: string;
  }) {
    const result = await pool.query(
      `INSERT INTO estudiante (codigo_estudiantil, nombre, programa_academico, correo_institucional, semestre, telefono_contacto, fecha_ultima_consulta)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (codigo_estudiantil) DO UPDATE SET
         nombre = EXCLUDED.nombre,
         programa_academico = EXCLUDED.programa_academico,
         correo_institucional = EXCLUDED.correo_institucional,
         semestre = EXCLUDED.semestre,
         telefono_contacto = EXCLUDED.telefono_contacto,
         fecha_ultima_consulta = NOW()
       RETURNING *`,
      [data.codigo_estudiantil, data.nombre, data.programa_academico, data.correo_institucional, data.semestre, data.telefono_contacto || null]
    );
    return result.rows[0];
  }

};