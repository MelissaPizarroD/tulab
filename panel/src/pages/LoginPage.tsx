import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/tulab_logo.svg';

export const LoginPage = () => {
  const [codigo, setCodigo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo.trim() || !contrasena) {
      setError('Ingresa tu código y contraseña.');
      return;
    }
    setCargando(true);
    setError('');
    try {
      await login(codigo.trim(), contrasena);
      navigate('/dashboard');
    } catch {
      setError('Código o contraseña incorrectos.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="acceso">
      <form className="acceso__tarjeta" onSubmit={handleLogin} noValidate>
        <img className="acceso__logo" src={logo} alt="TuLab" />
        <h1 className="acceso__titulo">Panel administrativo</h1>
        <p className="acceso__subtitulo">Ingresa con tu cuenta de encargado.</p>

        <label className="campo">
          <span className="campo__etiqueta">Código de identificación</span>
          <input
            className="entrada"
            type="text"
            autoComplete="username"
            autoFocus
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
          />
        </label>

        <label className="campo">
          <span className="campo__etiqueta">Contraseña</span>
          <input
            className="entrada"
            type="password"
            autoComplete="current-password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
          />
        </label>

        {error && <p className="error-texto" role="alert">{error}</p>}

        <button type="submit" className="btn btn--primario acceso__boton" disabled={cargando}>
          {cargando ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>

      <p className="acceso__pie">Laboratorio de Informática · Universidad de Cartagena</p>
    </main>
  );
};