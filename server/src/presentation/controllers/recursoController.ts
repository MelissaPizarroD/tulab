import { Request, Response } from 'express';
import { recursoService } from '../../services/recursoService';

export const recursoController = {
  async obtenerTodos(req: Request, res: Response) {
    try {
      res.json(await recursoService.obtenerTodos());
    } catch (error: any) {
      res.status(500).json({ mensaje: error.message });
    }
  },

  async disponibilidad(req: Request, res: Response) {
    try {
      res.json(await recursoService.disponibilidad());
    } catch (error: any) {
      res.status(500).json({ mensaje: error.message });
    }
  },

  async crear(req: Request, res: Response) {
    try {
      res.status(201).json(await recursoService.crear(req.body.nombre));
    } catch (error: any) {
      res.status(400).json({ mensaje: error.message });
    }
  },

  async actualizarActivo(req: Request, res: Response) {
    try {
      res.json(await recursoService.actualizarActivo(Number(req.params.id), req.body.activo));
    } catch (error: any) {
      res.status(400).json({ mensaje: error.message });
    }
  },

  async eliminar(req: Request, res: Response) {
    try {
      await recursoService.eliminar(Number(req.params.id));
      res.status(204).end();
    } catch (error: any) {
      res.status(400).json({ mensaje: error.message });
    }
  }
};