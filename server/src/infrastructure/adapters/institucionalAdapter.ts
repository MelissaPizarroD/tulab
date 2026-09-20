const estudiantesSimulados = [
  {
    codigo_estudiantil: '2020101001',
    nombre: 'Ana García',
    programa_academico: 'Ingeniería de Sistemas',
    correo_institucional: 'a.garcia@universidad.edu.co',
    semestre: 6,
    telefono_contacto: '3001234567'
  },
  {
    codigo_estudiantil: '2021202002',
    nombre: 'Carlos Martínez',
    programa_academico: 'Ingeniería Industrial',
    correo_institucional: 'c.martinez@universidad.edu.co',
    semestre: 4,
    telefono_contacto: '3009876543'
  },
  {
    codigo_estudiantil: '2019303003',
    nombre: 'Laura Pérez',
    programa_academico: 'Ingeniería Civil',
    correo_institucional: 'l.perez@universidad.edu.co',
    semestre: 8,
    telefono_contacto: '3005555555'
  }
];

export const institucionalAdapter = {

  async validarEstudiante(codigo_estudiantil: string) {
    const estudiante = estudiantesSimulados.find(
      e => e.codigo_estudiantil === codigo_estudiantil
    );
    return estudiante || null;
  }

};