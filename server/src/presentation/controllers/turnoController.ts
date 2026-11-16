import { Request, Response } from 'express';
import { turnoService } from '../../services/turnoService';

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

  async abrir(req: Request, res: Response) {
    try {
      const turno = await turnoService.abrirTurno(req.body);
      res.status(201).json(turno);
    } catch (error: any) {
      res.status(400).json({ mensaje: error.message });
    }
  },

  async cerrar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const turno = await turnoService.cerrarTurno(Number(id), req.body);
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