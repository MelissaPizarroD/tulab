import { useState, useEffect } from 'react';
import { TecladoNumerico } from '../components/TecladoNumerico';
import { NovedadModal } from '../components/NovedadModal';
import { iniciarSesion, cerrarSesion } from '../services/sesionService';
import { obtenerConfiguracion } from '../services/configuracionService';
import { useConexion } from '../hooks/useConexion';
import { api, urlServidor } from '../services/api';
import { getDB } from '../db/database';

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
type EstadoOperacion = 'idle' | 'cargando' | 'exito' | 'error';

export const GestorPage = () => {
  const [codigo, setCodigo] = useState('');
  const [estadoSesion, setEstadoSesion] = useState<EstadoSesion>('sin_sesion');
  const [estadoOperacion, setEstadoOperacion] = useState<EstadoOperacion>('idle');
  const [mensaje, setMensaje] = useState('');
  const [mostrarNovedad, setMostrarNovedad] = useState(false);
  const [tiempoInactividad, setTiempoInactividad] = useState(15);
  const [idEquipo, setIdEquipo] = useState<number | null>(null);
  const [idDispositivo, setIdDispositivo] = useState<number | null>(null);
  const { conectado } = useConexion();
  const [numeroEquipo, setNumeroEquipo] = useState<number | null>(null);

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

  const handleIniciarSesion = async () => {
    if (!codigo || !idEquipo || !idDispositivo) return;
    setEstadoOperacion('cargando');

    const resultado = await iniciarSesion(codigo, idEquipo, idDispositivo);

    if (resultado.exito) {
      setEstadoSesion('con_sesion');
      if (idEquipo) window.electron.notificarSesionIniciada(idEquipo);
      setEstadoOperacion('exito');
      setMensaje(resultado.offline
        ? 'Sesión iniciada localmente'
        : '¡Sesión iniciada!'
      );
    } else {
      setEstadoOperacion('error');
      setMensaje(resultado.mensaje || 'Error al iniciar sesión');
    }

    setCodigo('');
    setTimeout(() => {
      setEstadoOperacion('idle');
      setMensaje('');
    }, 3000);
  };

  const handleCerrarSesion = async (motivo: string = 'manual') => {
    if (!idEquipo) return;
    setEstadoOperacion('cargando');
    const resultado = await cerrarSesion(idEquipo, motivo);

    if (resultado.exito) {
      setEstadoSesion('sin_sesion');
      setEstadoOperacion('exito');
      setMensaje(motivo === 'inactividad'
        ? 'Sesión cerrada por inactividad'
        : '¡Sesión cerrada!'
      );
    } else {
      setEstadoOperacion('error');
      setMensaje(resultado.mensaje || 'Error al cerrar sesión');
    }

    setTimeout(() => {
      setEstadoOperacion('idle');
      setMensaje('');
    }, 3000);
  };

  if (!idEquipo) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#f8fafc', gap: '16px'
      }}>
        <p style={{ color: '#64748b', fontSize: '18px' }}>
          Equipo no configurado
        </p>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          Ingresa el número de equipo para configurar este PC
        </p>
        <input
          type="number"
          placeholder="Número de equipo (ej: 1)"
          style={{
            padding: '12px 16px', fontSize: '16px',
            borderRadius: '8px', border: '1px solid #ccc',
            width: '240px', textAlign: 'center'
          }}
          id="input-equipo"
        />
        <button
          onClick={async () => {
            const input = document.getElementById('input-equipo') as HTMLInputElement;
            const numero = Number(input.value);
            if (!numero) return;
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
              window.electron.setIdEquipo(idEq);
            } catch (error: any) {
              alert(error.response?.data?.mensaje || 'Error al configurar el equipo');
            }
          }}
          style={{
            padding: '12px 32px', fontSize: '16px',
            borderRadius: '8px', border: 'none',
            background: '#2563eb', color: 'white',
            cursor: 'pointer', fontWeight: 'bold'
          }}
        >
          Configurar
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc',
      padding: '24px'
    }}>
      <div style={{
        position: 'fixed', top: '16px', right: '16px',
        padding: '6px 12px', borderRadius: '20px',
        background: conectado ? '#dcfce7' : '#fee2e2',
        color: conectado ? '#166534' : '#991b1b',
        fontSize: '14px', fontWeight: 'bold'
      }}>
        {conectado ? 'En línea' : `Sin conexión (${urlServidor})`}
      </div>

      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#1e293b' }}>
        Equipo {numeroEquipo ?? idEquipo}
      </h1>

      {estadoSesion === 'sin_sesion' ? (
        <>
          <p style={{ color: '#64748b', marginBottom: '32px' }}>
            Ingresa tu código para iniciar sesión
          </p>
          {estadoOperacion === 'idle' || estadoOperacion === 'cargando' ? (
            <TecladoNumerico
              valor={codigo}
              onChange={setCodigo}
              onConfirmar={handleIniciarSesion}
              onLimpiar={() => setCodigo('')}
              disabled={estadoOperacion === 'cargando'}
            />
          ) : (
            <div style={{
              padding: '32px 48px', borderRadius: '12px',
              background: estadoOperacion === 'exito' ? '#dcfce7' : '#fee2e2',
              color: estadoOperacion === 'exito' ? '#166534' : '#991b1b',
              fontSize: '20px', fontWeight: 'bold', textAlign: 'center'
            }}>
              {estadoOperacion === 'exito' ? '✓' : '✗'} {mensaje}
            </div>
          )}
        </>
      ) : (
        <>
          <p style={{ color: '#166534', fontSize: '20px', marginBottom: '32px' }}>
            Sesión activa
          </p>
          {mensaje && (
            <div style={{
              padding: '16px 32px', borderRadius: '8px', marginBottom: '24px',
              background: estadoOperacion === 'exito' ? '#dcfce7' : '#fee2e2',
              color: estadoOperacion === 'exito' ? '#166534' : '#991b1b',
              fontWeight: 'bold'
            }}>
              {mensaje}
            </div>
          )}
          <div style={{ display: 'flex', gap: '16px' }}>
            <button
              onClick={() => setMostrarNovedad(true)}
              style={{
                padding: '16px 32px', fontSize: '16px',
                borderRadius: '8px', border: 'none',
                background: '#f59e0b', color: 'white',
                cursor: 'pointer', fontWeight: 'bold'
              }}
            >
              Reportar novedad
            </button>
            <button
              onClick={() => handleCerrarSesion('manual')}
              style={{
                padding: '16px 32px', fontSize: '16px',
                borderRadius: '8px', border: 'none',
                background: '#dc2626', color: 'white',
                cursor: 'pointer', fontWeight: 'bold'
              }}
            >
              Cerrar sesión
            </button>
          </div>
        </>
      )}

      {mostrarNovedad && idEquipo && (
        <NovedadModal
          id_equipo={idEquipo}
          onCerrar={() => setMostrarNovedad(false)}
        />
      )}

      {estadoSesion === 'con_sesion' && (
        <p style={{
          position: 'fixed', bottom: '16px', left: 0, right: 0,
          textAlign: 'center', color: '#94a3b8', fontSize: '13px', margin: 0
        }}>
          Puedes minimizar esta ventana y seguir trabajando. Para volver a abrirla presiona Ctrl + Shift + G
        </p>
      )}
    </div>
  );
};