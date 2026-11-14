import { useEffect, useState } from 'react';
import { TecladoNumerico } from '../components/TecladoNumerico';
import { IndicadorConexion } from '../components/IndicadorConexion';
import { ResultadoRegistro } from '../components/ResultadoRegistro';
import { registrarEntrada, registrarSalida } from '../services/registroService';
import { useConexion } from '../hooks/useConexion';
import logo from '../assets/tulab_logo.svg';
import '../styles/terminal.css';

type Modo = 'entrada' | 'salida';
type EstadoOperacion = 'idle' | 'cargando' | 'exito' | 'error';

const MS_EXITO = 3000;
const MS_ERROR = 4500;

export const TerminalPage = () => {
  const [codigo, setCodigo] = useState('');
  const [modo, setModo] = useState<Modo>('entrada');
  const [estado, setEstado] = useState<EstadoOperacion>('idle');
  const [mensaje, setMensaje] = useState<string | undefined>();
  const { conectado } = useConexion();

  const reiniciar = () => {
    setEstado('idle');
    setMensaje(undefined);
  };

  // Vuelve a la pantalla de captura después de mostrar el resultado
  useEffect(() => {
    if (estado !== 'exito' && estado !== 'error') return;
    const t = setTimeout(reiniciar, estado === 'exito' ? MS_EXITO : MS_ERROR);
    return () => clearTimeout(t);
  }, [estado]);

  const handleConfirmar = async () => {
    if (!codigo || estado === 'cargando') return;
    setEstado('cargando');

    try {
      const resultado = modo === 'entrada'
        ? await registrarEntrada(codigo)
        : await registrarSalida(codigo);

      if (resultado.exito) {
        setMensaje(resultado.offline
          ? 'Tu registro se guardó en esta terminal y se enviará cuando haya conexión.'
          : undefined);
        setEstado('exito');
      } else {
        setMensaje(resultado.mensaje);
        setEstado('error');
      }
    } catch {
      setMensaje(undefined);
      setEstado('error');
    }

    setCodigo('');
  };

  const mostrandoResultado = estado === 'exito' || estado === 'error';

  return (
    <main className="terminal" data-modo={modo}>
      <IndicadorConexion conectado={conectado} />

      <div className="terminal__columna">
        <img className="terminal__logo" src={logo} alt="TuLab" />

        {mostrandoResultado ? (
          <ResultadoRegistro
            tipo={estado === 'exito' ? 'exito' : 'error'}
            mensaje={mensaje}
            onCerrar={reiniciar}
          />
        ) : (
          <>
            <h1 className="terminal__titulo">¿Entras o te vas?</h1>
            <p className="terminal__subtitulo">Selecciona una opción.</p>

            <div className="modo" role="radiogroup" aria-label="Tipo de registro">
              <button
                type="button"
                role="radio"
                aria-checked={modo === 'entrada'}
                className="modo__opcion"
                onClick={() => setModo('entrada')}
              >
                Registrar Entrada
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={modo === 'salida'}
                className="modo__opcion modo__opcion--salida"
                onClick={() => setModo('salida')}
              >
                Registrar Salida
              </button>
            </div>

            <TecladoNumerico
              valor={codigo}
              onChange={setCodigo}
              onConfirmar={handleConfirmar}
              onLimpiar={() => setCodigo('')}
              deshabilitado={estado === 'cargando'}
            />

            <p className="terminal__ayuda">Verifica tu número antes de registrar.</p>
          </>
        )}
      </div>
    </main>
  );
};