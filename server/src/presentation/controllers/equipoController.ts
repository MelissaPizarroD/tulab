import { Request, Response } from 'express';
import { equipoService } from '../../services/equipoService';

export const equipoController = {

  async obtenerTodos(req: Request, res: Response) {
    try {
      const equipos = await equipoService.obtenerTodos();
      res.json(equipos);
    } catch (error: any) {
      res.status(500).json({ mensaje: error.message });
    }
  },

  async crear(req: Request, res: Response) {
    try {
      const equipo = await equipoService.crear(req.body);
      res.status(201).json(equipo);
    } catch (error: any) {
      res.status(400).json({ mensaje: error.message });
    }
  },

  async actualizarEstado(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { estado } = req.body;
      const equipo = await equipoService.actualizarEstado(id, estado);
      res.json(equipo);
    } catch (error: any) {
      res.status(400).json({ mensaje: error.message });
    }
  }

};