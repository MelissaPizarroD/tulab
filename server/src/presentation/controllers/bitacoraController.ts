import { Request, Response } from 'express';
import { bitacoraService } from '../../services/bitacoraService';
import { AuthRequest } from '../middlewares/authMiddleware';

export const bitacoraController = {

  async registrar(req: AuthRequest, res: Response) {
    try {
      const entrada = await bitacoraService.registrar({
        id_encargado: req.encargado!.id_encargado,
        descripcion: req.body.descripcion
      });
      res.status(201).json(entrada);
    } catch (error: any) {
      res.status(400).json({ mensaje: error.message });
    }
  },

  async eliminar(req: AuthRequest, res: Response) {
    try {
      const id_entrada = Number(req.params.id);
      const entrada = await bitacoraService.eliminar(id_entrada);
      res.json(entrada);
    } catch (error: any) {
      res.status(400).json({ mensaje: error.message });
    }
  },

  async obtenerPorTurno(req: Request, res: Response) {
    try {
      const id_turno = Number(req.params.id_turno);
      const entradas = await bitacoraService.obtenerPorTurno(id_turno);
      res.json(entradas);
    } catch (error: any) {
      res.status(500).json({ mensaje: error.message });
    }
  }

};