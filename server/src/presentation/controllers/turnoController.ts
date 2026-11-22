import { Request, Response } from 'express';
import { turnoService } from '../../services/turnoService';
import { AuthRequest } from '../middlewares/authMiddleware';

export const turnoController = {

  async obtenerActivo(req: Request, res: Response) {
    try {
      const turno = await turnoService.obtenerTurnoActivo();
      if (!turno) {
        return res.status(404).json({ mensaje: 'No hay turno activo' });
      }
      res.json(turno);
    } catch (error: any) {
      res.status(500).json({ mensaje: error.message });
    }
  },

  async abrir(req: AuthRequest, res: Response) {
    try {
      const turno = await turnoService.abrirTurno({
        id_encargado_apertura: req.encargado!.id_encargado,
        observaciones_apertura: req.body.observaciones_apertura
      });
      res.status(201).json(turno);
    } catch (error: any) {
      res.status(400).json({ mensaje: error.message });
    }
  },

  async cerrar(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const turno = await turnoService.cerrarTurno(Number(id), {
        id_encargado_cierre: req.encargado!.id_encargado,
        observaciones_cierre: req.body.observaciones_cierre
      });
      res.json(turno);
    } catch (error: any) {
      res.status(400).json({ mensaje: error.message });
    }
  },

  async obtenerHistorico(req: Request, res: Response) {
    try {
      const { desde, hasta } = req.query;
      const turnos = await turnoService.obtenerHistorico({
        desde: desde as string,
        hasta: hasta as string
      });
      res.json(turnos);
    } catch (error: any) {
      res.status(500).json({ mensaje: error.message });
    }
  },

  async obtenerDetalle(req: Request, res: Response) {
    try {
      const detalle = await turnoService.obtenerDetalle(Number(req.params.id));
      res.json(detalle);
    } catch (error: any) {
      res.status(500).json({ mensaje: error.message });
    }
  }

};