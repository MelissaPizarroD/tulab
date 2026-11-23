import { Request, Response } from 'express';
import { sesionEquipoService } from '../../services/sesionEquipoService';
import { obtenerIp } from '../utils/obtenerIp';

export const sesionEquipoController = {

  async iniciar(req: Request, res: Response) {
    try {
      const { codigo, id_equipo, id_dispositivo } = req.body;
      const sesion = await sesionEquipoService.iniciarSesion({
        codigo,
        id_equipo,
        id_dispositivo,
        ip_origen: obtenerIp(req)
      });
      res.status(201).json(sesion);
    } catch (error: any) {
      res.status(400).json({ mensaje: error.message });
    }
  },

  async cerrar(req: Request, res: Response) {
    try {
      const { id_equipo, id_dispositivo, motivo_cierre } = req.body;
      const sesion = await sesionEquipoService.cerrarSesion({
        id_equipo,
        id_dispositivo,
        motivo_cierre
      });
      res.json(sesion);
    } catch (error: any) {
      res.status(400).json({ mensaje: error.message });
    }
  },

  async obtenerActivasPorTurno(req: Request, res: Response) {
    try {
      const id_turno = Number(req.params.id_turno);
      const sesiones = await sesionEquipoService.obtenerActivasPorTurno(id_turno);
      res.json(sesiones);
    } catch (error: any) {
      res.status(500).json({ mensaje: error.message });
    }
  }

};