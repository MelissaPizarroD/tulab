import { useState } from 'react';
import { api } from '../services/api';

interface Visitante {
  id_visitante: number;
  nombre: string;
  codigo_temporal: string;
  timestamp_expiracion: string;
  email: string | null;
  telefono: string | null;
  institucion: string | null;
}

const FORM_VACIO = { nombre: '', motivo_visita: '', email: '', telefono: '', institucion: '' };

export const RegistroVisitante = () => {
  const [form, setForm] = useState(FORM_VACIO);
  const [enviando, setEnviando] = useState(false);
  const [visitante, setVisitante] = useState<Visitante | null>(null);
  const [error, setError] = useState('');

  const handleChange = (campo: string, valor: string) => {
    setForm((f) => ({ ...f, [campo]: valor }));
  };

  const handleRegistrar = async () => {
    if (!form.nombre.trim()) return;
    setEnviando(true);
    setError('');
    try {
      const response = await api.post('/api/visitantes', {
        nombre: form.nombre,
        motivo_visita: form.motivo_visita || undefined,
        email: form.email || undefined,
        telefono: form.telefono || undefined,
        institucion: form.institucion || undefined
      });
      setVisitante(response.data);
      setForm(FORM_VACIO);
    } catch (e: any) {
      setError(e.response?.data?.mensaje || 'No se pudo registrar al visitante.');
    } finally {
      setEnviando(false);
    }
  };

  const handleNuevo = () => {
    setVisitante(null);
    setError('');
  };

  return (
    <section className="tarjeta">
      <header className="tarjeta__cabecera">
        <h2 className="tarjeta__titulo">Registro de visitantes</h2>
      </header>

      {visitante ? (
        <div className="codigo-generado">
          <p className="codigo-generado__aviso">Visitante registrado</p>
          <p className="codigo-generado__nombre">{visitante.nombre}</p>
          {visitante.institucion && <p className="codigo-generado__detalle">{visitante.institucion}</p>}

          <div className="codigo-generado__caja">
            <span className="codigo-generado__etiqueta">Código temporal</span>
            <span className="codigo-generado__valor">{visitante.codigo_temporal}</span>
          </div>

          <p className="codigo-generado__detalle">
            Válido hasta {new Date(visitante.timestamp_expiracion).toLocaleTimeString('es-CO', {
              hour: '2-digit', minute: '2-digit'
            })}
          </p>
          <button type="button" className="btn btn--primario" onClick={handleNuevo}>
            Registrar otro visitante
          </button>
        </div>
      ) : (
        <form
          className="formulario"
          onSubmit={(e) => {
            e.preventDefault();
            handleRegistrar();
          }}
        >
          <label className="campo campo--ancho">
            <span className="campo__etiqueta">Nombre completo *</span>
            <input className="entrada" type="text" value={form.nombre} onChange={(e) => handleChange('nombre', e.target.value)} />
          </label>
          <label className="campo">
            <span className="campo__etiqueta">Correo electrónico</span>
            <input className="entrada" type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
          </label>
          <label className="campo">
            <span className="campo__etiqueta">Teléfono</span>
            <input className="entrada" type="tel" value={form.telefono} onChange={(e) => handleChange('telefono', e.target.value)} />
          </label>
          <label className="campo">
            <span className="campo__etiqueta">Institución</span>
            <input className="entrada" type="text" value={form.institucion} onChange={(e) => handleChange('institucion', e.target.value)} />
          </label>
          <label className="campo">
            <span className="campo__etiqueta">Motivo de la visita</span>
            <input className="entrada" type="text" value={form.motivo_visita} onChange={(e) => handleChange('motivo_visita', e.target.value)} />
          </label>

          {error && <p className="error-texto campo--ancho" role="alert">{error}</p>}

          <button
            type="submit"
            className="btn btn--primario campo--ancho"
            disabled={enviando || !form.nombre.trim()}
          >
            {enviando ? 'Registrando...' : 'Registrar y generar código'}
          </button>
        </form>
      )}
    </section>
  );
};