import { Request, Response } from 'express';
import { registroAccesoService } from '../../services/registroAccesoService';
import { sesionEquipoService } from '../../services/sesionEquipoService';
import { novedadEquipoService } from '../../services/novedadEquipoService';
import { turnoRepository } from '../../infrastructure/repositories/turnoRepository';
import { obtenerIp } from '../utils/obtenerIp';

const SIN_SESION_ACTIVA = 'No hay sesión activa en este equipo';

// Un pendiente generado antes de abrir el turno activo no se aplica a este turno
const validarDentroDelTurno = async (hora?: string) => {
  if (!hora) return;
  const turno = await turnoRepository.obtenerTurnoActivo();
  if (!turno) return; // los servicios ya responden "No hay turno activo"
  if (await turnoRepository.horaEsAnteriorAlTurno(turno.id_turno, hora)) {
    throw Object.assign(new Error('El evento es anterior al turno activo'), { descartar: true });
  }
};

export const sincronizacionController = {

  async sincronizarTerminal(req: Request, res: Response) {
    try {
      const { registros } = req.body;
      if (!Array.isArray(registros)) {
        return res.status(400).json({ mensaje: 'Se esperaba una lista de registros' });
      }

      const resultados = [];
      const ip_origen = obtenerIp(req);

      for (const registro of registros) {
        try {
          await validarDentroDelTurno(
            registro.tipo === 'salida' ? registro.hora_salida : registro.hora_entrada
          );

          const resultado = registro.tipo === 'salida'
            ? await registroAccesoService.registrarSalida({
                codigo: registro.codigo,
                hora_salida: registro.hora_salida
              })
            : await registroAccesoService.registrarEntrada({
                codigo: registro.codigo,
                id_dispositivo: registro.id_dispositivo,
                origen_registro: registro.origen_registro,
                ip_origen,
                hora_entrada: registro.hora_entrada
              });
          resultados.push({ exito: true, id_local: registro.id_local, registro: resultado });
        } catch (error: any) {
          resultados.push({
            exito: false,
            descartar: error.descartar === true,
            id_local: registro.id_local,
            mensaje: error.message
          });
        }
      }

      res.json({ resultados });
    } catch (error: any) {
      res.status(500).json({ mensaje: error.message });
    }
  },

  // El gestor manda una lista de eventos ya ordenada por hora.
  // Cada evento trae un "ref" que se devuelve tal cual para que el cliente sepa cuál borrar.
  async sincronizarGestor(req: Request, res: Response) {
    try {
      const { eventos } = req.body;
      if (!Array.isArray(eventos)) {
        return res.status(400).json({ mensaje: 'Se esperaba una lista de eventos' });
      }

      const resultados = [];
      const ip_origen = obtenerIp(req);

      for (const evento of eventos) {
        try {
          await validarDentroDelTurno(evento.hora);

          let resultado;

          if (evento.tipo === 'inicio') {
            resultado = await sesionEquipoService.iniciarSesion({
              codigo: evento.codigo,
              id_equipo: evento.id_equipo,
              id_dispositivo: evento.id_dispositivo,
              ip_origen,
              hora_inicio: evento.hora
            });
          } else if (evento.tipo === 'cierre') {
            try {
              resultado = await sesionEquipoService.cerrarSesion({
                id_equipo: evento.id_equipo,
                id_dispositivo: evento.id_dispositivo,
                motivo_cierre: evento.motivo_cierre,
                hora_cierre: evento.hora
              });
            } catch (error: any) {
              // Si ya estaba cerrada (por ejemplo, por salida en la terminal) no hay nada que reintentar
              if (error.message !== SIN_SESION_ACTIVA) throw error;
              resultado = null;
            }
          } else if (evento.tipo === 'novedad') {
            resultado = await novedadEquipoService.reportar({
              id_equipo: evento.id_equipo,
              id_dispositivo: evento.id_dispositivo,
              descripcion: evento.descripcion,
              timestamp_reporte: evento.hora
            });
          } else {
            throw new Error('Tipo de evento no válido');
          }

          resultados.push({ exito: true, ref: evento.ref, resultado });
        } catch (error: any) {
          resultados.push({
            exito: false,
            descartar: error.descartar === true,
            ref: evento.ref,
            mensaje: error.message
          });
        }
      }

      res.json({ resultados });
    } catch (error: any) {
      res.status(500).json({ mensaje: error.message });
    }
  }

};