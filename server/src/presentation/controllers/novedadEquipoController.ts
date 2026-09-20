import { Request, Response } from 'express';
import { novedadEquipoService } from '../../services/novedadEquipoService';

export const novedadEquipoController = {

  async reportar(req: Request, res: Response) {
    try {
      const novedad = await novedadEquipoService.reportar(req.body);
      res.status(201).json(novedad);
    } catch (error: any) {
      res.status(400).json({ mensaje: error.message });
    }
  },

  async obtenerPorTurno(req: Request, res: Response) {
    try {
      const id_turno = Number(req.params.id_turno);
      const novedades = await novedadEquipoService.obtenerPorTurno(id_turno);
      res.json(novedades);
    } catch (error: any) {
      res.status(500).json({ mensaje: error.message });
    }
  }

};