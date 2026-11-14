import { useState, useEffect } from 'react';
import { TecladoNumerico } from '../components/TecladoNumerico';
import { NovedadModal } from '../components/NovedadModal';
import { IndicadorConexion } from '../components/IndicadorConexion';
import { ResultadoOperacion } from '../components/ResultadoOperacion';
import { iniciarSesion, cerrarSesion } from '../services/sesionService';
import { obtenerConfiguracion } from '../services/configuracionService';
import { useConexion } from '../hooks/useConexion';
import { api, urlServidor } from '../services/api';
import { getDB } from '../db/database';
import logo from '../assets/tulab_logo.svg';
import '../styles/gestor.css';

declare global {
  interface Window {
    electron: {
      platform: string;
      apiUrl: string;
      setIdEquipo: (id: number) => void;
      notificarSesionIniciada: (id: number) => void;
      estadoSesion: (activa: boolean) => void;
      setTiempoInactividad: (minutos: number) => void;
      onInactividad: (callback: () => void) => () => void;
    }
  }
}

type EstadoSesion = 'sin_sesion' | 'con_sesion';

type Resultado = {
  tipo: 'exito' | 'error';
  titulo: string;
  mensaje: string;
};

const MS_EXITO = 3000;
const MS_ERROR = 4500;
const PIE_ERROR = 'Si el problema continúa, contacta al encargado de sala.';

export const GestorPage = () => {
  const [codigo, setCodigo] = useState('');
  const [estadoSesion, setEstadoSesion] = useState<EstadoSesion>('sin_sesion');
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [mostrarNovedad, setMostrarNovedad] = useState(false);
  const [tiempoInactividad, setTiempoInactividad] = useState(15);
  const [idEquipo, setIdEquipo] = useState<number | null>(null);
  const [idDispositivo, setIdDispositivo] = useState<number | null>(null);
  const { conectado } = useConexion();
  const [numeroEquipo, setNumeroEquipo] = useState<number | null>(null);

  // Configuración inicial del equipo
  const [numeroInput, setNumeroInput] = useState('');
  const [configurando, setConfigurando] = useState(false);
  const [errorConfig, setErrorConfig] = useState('');

  useEffect(() => {
    if (!idDispositivo) return;

    const latido = () => {
      api.post(`/api/dispositivos/${idDispositivo}/heartbeat`).catch(() => {});
    };

    latido();
    const intervalo = setInterval(latido, 30000);
    return () => clearInterval(intervalo);
  }, [idDispositivo]);

  useEffect(() => {
    const cargarDispositivo = async () => {
      const db = await getDB();
      const equipo = await db.get('configuracion', 'id_equipo');
      const dispositivo = await db.get('configuracion', 'id_dispositivo');
      const numero = await db.get('configuracion', 'numero_equipo');

      if (equipo && dispositivo) {
        setIdEquipo(Number(equipo.valor));
        setIdDispositivo(Number(dispositivo.valor));
        if (numero) setNumeroEquipo(Number(numero.valor));
      }
    };
    cargarDispositivo();
  }, []);

  useEffect(() => {
    const cargarConfig = async () => {
      const tiempo = await obtenerConfiguracion('tiempo_inactividad_minutos');
      if (tiempo) setTiempoInactividad(Number(tiempo));
    };
    cargarConfig();
  }, []);

  // Inactividad: el proceso principal mide el uso de todo el sistema y avisa aquí
  useEffect(() => {
    if (estadoSesion !== 'con_sesion') return;

    window.electron?.setTiempoInactividad(tiempoInactividad);
    const quitarEscucha = window.electron?.onInactividad(() => {
      handleCerrarSesion('inactividad');
    });

    return () => {
      quitarEscucha?.();
    };
  }, [estadoSesion, tiempoInactividad, idEquipo]);

  // Avisa al proceso principal para bloquear o minimizar la ventana
  useEffect(() => {
    const activa = estadoSesion === 'con_sesion';
    // Con sesión espera 1,5 s para que el estudiante alcance a ver el mensaje de éxito
    const t = setTimeout(() => {
      window.electron?.estadoSesion(activa);
    }, activa ? 1500 : 0);
    return () => clearTimeout(t);
  }, [estadoSesion]);

  // Oculta la tarjeta de resultado pasados unos segundos
  useEffect(() => {
    if (!resultado) return;
    const t = setTimeout(
      () => setResultado(null),
      resultado.tipo === 'exito' ? MS_EXITO : MS_ERROR
    );
    return () => clearTimeout(t);
  }, [resultado]);

  const handleConfigurar = async () => {
    const numero = Number(numeroInput);
    if (!numero || configurando) return;
    setConfigurando(true);
    setErrorConfig('');
    try {
      const response = await api.post('/api/dispositivos/registrar', {
        tipo: 'gestor_sesiones',
        nombre: `Gestor PC-${numero}`,
        numero_equipo: numero
      });
      const idEq = response.data.id_equipo;
      const idDisp = response.data.id_dispositivo;
      const db = await getDB();
      await db.put('configuracion', { clave: 'id_equipo', valor: String(idEq) });
      await db.put('configuracion', { clave: 'numero_equipo', valor: String(numero) });
      await db.put('configuracion', { clave: 'id_dispositivo', valor: String(idDisp) });
      setIdEquipo(idEq);
      setNumeroEquipo(numero);
      setIdDispositivo(idDisp);
      window.electron?.setIdEquipo(idEq);
    } catch (error: any) {
      setErrorConfig(error.response?.data?.mensaje || 'Error al configurar el equipo');
    } finally {
      setConfigurando(false);
    }
  };

  const handleIniciarSesion = async () => {
    if (!codigo || !idEquipo || !idDispositivo || cargando) return;
    setCargando(true);

    const respuesta = await iniciarSesion(codigo, idEquipo, idDispositivo);

    if (respuesta.exito) {
      setEstadoSesion('con_sesion');
      window.electron?.notificarSesionIniciada(idEquipo);
      setResultado({
        tipo: 'exito',
        titulo: '¡Sesión iniciada!',
        mensaje: respuesta.offline
          ? 'Tu sesión se guardó en este equipo y se enviará cuando haya conexión.'
          : 'Ya puedes usar el equipo.'
      });
    } else {
      setResultado({
        tipo: 'error',
        titulo: 'No se pudo iniciar sesión',
        mensaje: respuesta.mensaje || 'No pudimos iniciar tu sesión. Inténtalo de nuevo.'
      });
    }

    setCodigo('');
    setCargando(false);
  };

  const handleCerrarSesion = async (motivo: string = 'manual') => {
    if (!idEquipo) return;
    setCargando(true);
    const respuesta = await cerrarSesion(idEquipo, motivo);

    if (respuesta.exito) {
      setEstadoSesion('sin_sesion');
      setResultado({
        tipo: 'exito',
        titulo: '¡Sesión cerrada!',
        mensaje: motivo === 'inactividad'
          ? 'Tu sesión se cerró por inactividad.'
          : 'Gracias por usar el laboratorio.'
      });
    } else {
      setResultado({
        tipo: 'error',
        titulo: 'No se pudo cerrar la sesión',
        mensaje: respuesta.mensaje || 'No pudimos cerrar tu sesión. Inténtalo de nuevo.'
      });
    }
    setCargando(false);
  };

  // ---------- Equipo sin configurar ----------
  if (!idEquipo) {
    return (
      <main className="gestor">
        <IndicadorConexion conectado={conectado} detalle={urlServidor} />
        <div className="gestor__columna">
          <img className="gestor__logo" src={logo} alt="TuLab" />
          <h1 className="gestor__titulo">Equipo no configurado</h1>
          <p className="gestor__subtitulo">
            Ingresa el número de equipo para configurar este PC.
          </p>

          <form
            className="panel"
            onSubmit={(e) => {
              e.preventDefault();
              handleConfigurar();
            }}
          >
            <input
              className="campo campo--numero"
              type="number"
              inputMode="numeric"
              min={1}
              placeholder="Número de equipo (ej: 1)"
              aria-label="Número de equipo"
              value={numeroInput}
              onChange={(e) => setNumeroInput(e.target.value)}
              autoFocus
            />
            {errorConfig && <p className="mensaje-error" role="alert">{errorConfig}</p>}
            <button
              type="submit"
              className="boton boton--primario boton--grande"
              disabled={configurando || !Number(numeroInput)}
            >
              {configurando ? 'Configurando...' : 'Configurar'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  // ---------- Pantalla principal ----------
  return (
    <main className="gestor">
      <IndicadorConexion conectado={conectado} detalle={urlServidor} />

      <div className="gestor__columna">
        <img className="gestor__logo" src={logo} alt="TuLab" />

        {resultado ? (
          <ResultadoOperacion
            tipo={resultado.tipo}
            titulo={resultado.titulo}
            mensaje={resultado.mensaje}
            pie={resultado.tipo === 'error' ? PIE_ERROR : undefined}
            onCerrar={() => setResultado(null)}
          />
        ) : estadoSesion === 'sin_sesion' ? (
          <>
            <h1 className="gestor__titulo">Equipo {numeroEquipo ?? idEquipo}</h1>
            <p className="gestor__subtitulo">Ingresa tu código para iniciar sesión.</p>

            <TecladoNumerico
              valor={codigo}
              onChange={setCodigo}
              onConfirmar={handleIniciarSesion}
              onLimpiar={() => setCodigo('')}
              disabled={cargando}
            />
          </>
        ) : (
          <>
            <h1 className="gestor__titulo">Equipo {numeroEquipo ?? idEquipo}</h1>

            <section className="panel">
              <span className="estado-sesion">
                <span className="conexion__punto" aria-hidden="true" />
                Sesión activa
              </span>
              <p className="panel__texto">
                Puedes seguir trabajando. Si notas un problema con el equipo, repórtalo.
              </p>

              <div className="acciones acciones--columna">
                <button
                  type="button"
                  className="boton boton--aviso"
                  onClick={() => setMostrarNovedad(true)}
                  disabled={cargando}
                >
                  Reportar novedad
                </button>
                <button
                  type="button"
                  className="boton boton--primario"
                  onClick={() => handleCerrarSesion('manual')}
                  disabled={cargando}
                >
                  {cargando ? 'Cerrando...' : 'Cerrar sesión'}
                </button>
              </div>
            </section>
          </>
        )}
      </div>

      {mostrarNovedad && idEquipo && (
        <NovedadModal
          id_equipo={idEquipo}
          onCerrar={() => setMostrarNovedad(false)}
        />
      )}

      {estadoSesion === 'con_sesion' && (
        <p className="gestor__pie">
          Puedes minimizar esta ventana y seguir trabajando. Para volver a abrirla presiona Ctrl + Shift + G
        </p>
      )}
    </main>
  );
};